const Shift = require('../models/Shift');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Holiday = require('../models/Holiday');
const LeaveRequest = require('../models/LeaveRequest');
const notificationService = require('../services/notificationService');

// Helper: kiểm tra lịch nghỉ phép (UC 2.3)
const hasLeaveConflict = async (staffId, date, startTime, endTime) => {
    // Chuyển date về 00:00:00 để so sánh chính xác ngày
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const leaves = await LeaveRequest.find({
        staffId,
        status: { $in: ['Đã duyệt', 'Chờ hủy phép'] },
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate }
    });

    for (const leave of leaves) {
        if (leave.duration === 'Cả ngày') return true;
        // Giả định: Sáng là các ca bắt đầu < 12:00, Chiều là các ca kết thúc > 12:00
        if (leave.duration === 'Sáng' && startTime < '12:00') return true;
        if (leave.duration === 'Chiều' && endTime > '12:00') return true;
    }
    return false;
};

// Helper: chuyển "HH:mm" → phút
const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// Helper: kiểm tra xung đột ca (BR2.2.2)
const hasConflict = async (staffId, date, startTime, endTime, excludeId = null) => {
    const query = {
        staffId,
        date: new Date(date),
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    };
    if (excludeId) query._id = { $ne: excludeId };
    return await Shift.findOne(query);
};

// Helper: kiểm tra độc quyền phòng khám (BR2.2.4)
const hasRoomConflict = async (room, date, startTime, endTime, excludeId = null) => {
    const query = {
        room,
        date: new Date(date),
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    };
    if (excludeId) query._id = { $ne: excludeId };
    return await Shift.findOne(query);
};

// Helper: tính tổng giờ làm việc trong ngày của nhân sự
const getTotalHoursInDay = async (staffId, date, addStart, addEnd, excludeId = null) => {
    const query = { staffId, date: new Date(date) };
    if (excludeId) query._id = { $ne: excludeId };
    const dayShifts = await Shift.find(query);
    const existingMinutes = dayShifts.reduce((sum, s) =>
        sum + (toMinutes(s.endTime) - toMinutes(s.startTime)), 0);
    const newMinutes = toMinutes(addEnd) - toMinutes(addStart);
    return (existingMinutes + newMinutes) / 60;
};

// 1. Lấy danh sách lịch trực (BR2.2.1)
exports.getShifts = async (req, res) => {
    try {
        let query = {};
        // Admin và Lễ tân được xem toàn bộ lịch trực (để quản lý / đặt lịch hẹn)
        if (req.user.role !== 'Admin' && req.user.role !== 'Lễ tân') {
            query = { staffId: req.user._id };
        }
        const shifts = await Shift.find(query)
            .populate('staffId', 'name role ma_nhan_vien')
            .sort({ date: 1, startTime: 1 });
        res.status(200).json(shifts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Xếp ca mới (Luồng 2 + BR2.2.2, BR2.2.3, BR2.2.4, EF2.2)
exports.createShift = async (req, res) => {
    try {
        const { staffId, date, startTime, endTime, room, role } = req.body;

        // Kiểm tra nhân sự hoạt động (sửa lỗi: dùng đúng trường trang_thai)
        const staff = await User.findById(staffId);
        if (!staff || staff.trang_thai !== 'Đang hoạt động') {
            return res.status(400).json({ message: 'Nhân sự không khả dụng hoặc không đang hoạt động!' });
        }

        // Kiểm tra Lễ tân tối thiểu (BR2.2.3)
        if (role !== 'Lễ tân') {
            const hasReceptionist = await Shift.findOne({ 
                date: new Date(date), 
                role: 'Lễ tân',
                startTime: { $lte: startTime },
                endTime: { $gte: endTime },
                staffId: { $ne: null }
            });
            if (!hasReceptionist && !req.body.receptionistId) {
                return res.status(400).json({ message: 'Ca trực phải có tối thiểu 01 Lễ tân được chỉ định trước (bao phủ toàn bộ thời gian của ca)!' });
            }
        }

        // Chống xung đột nhân sự (BR2.2.2)
        if (await hasConflict(staffId, date, startTime, endTime)) {
            return res.status(400).json({ message: 'Nhân sự đã có ca trực trong khung giờ này!' });
        }

        // Chống xung đột nghỉ phép (UC 2.3)
        if (await hasLeaveConflict(staffId, date, startTime, endTime)) {
            return res.status(400).json({ message: 'Nhân sự đã được duyệt nghỉ phép trong khoảng thời gian này!' });
        }

        // Độc quyền phòng khám (BR2.2.4)
        if (await hasRoomConflict(room, date, startTime, endTime)) {
            return res.status(400).json({ message: `Phòng ${room} đã được sử dụng trong khung giờ này!` });
        }

        // Giới hạn 12h/ngày (EF2.2) — tính đúng theo phút
        const totalHours = await getTotalHoursInDay(staffId, date, startTime, endTime);
        if (totalHours > 12) {
            return res.status(400).json({ message: 'Vi phạm quy định quá tải lao động! Nhân sự đã đủ/vượt quá 12 giờ làm việc trong ngày này.' });
        }

        const newShift = await Shift.create({ staffId, date, startTime, endTime, room, role, createdBy: req.user._id });

        // Gửi thông báo tự động cho ca bác sĩ
        try { await notificationService.sendShiftNotification(staff, newShift); } catch (_) {}

        // Nếu có truyền lên receptionistId, tạo luôn ca lễ tân nếu họ chưa có ca cover khoảng thời gian này
        if (req.body.receptionistId && role !== 'Lễ tân') {
            const existingReceptionist = await Shift.findOne({
                staffId: req.body.receptionistId,
                date: new Date(date),
                startTime: { $lte: startTime },
                endTime: { $gte: endTime }
            });
            if (!existingReceptionist) {
                const recStaff = await User.findById(req.body.receptionistId);
                if (recStaff && recStaff.trang_thai === 'Đang hoạt động') {
                    // Check xung đột cá nhân của lễ tân
                    const recConflict = await hasConflict(req.body.receptionistId, date, startTime, endTime);
                    const recLeaveConflict = await hasLeaveConflict(req.body.receptionistId, date, startTime, endTime);
                    if (!recConflict && !recLeaveConflict) {
                        const recShift = await Shift.create({
                            staffId: req.body.receptionistId,
                            date, startTime, endTime, room: 'Quầy Lễ Tân', role: 'Lễ tân', createdBy: req.user._id
                        });
                        try { await notificationService.sendShiftNotification(recStaff, recShift); } catch (_) {}
                    }
                }
            }
        }

        res.status(201).json(newShift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Cập nhật ca trực (Luồng 3 + kiểm tra xung đột + thông báo bác sĩ thay thế)
exports.updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId, date, startTime, endTime, room, role } = req.body;

        const existing = await Shift.findById(id);
        if (!existing) return res.status(404).json({ message: 'Không tìm thấy ca trực!' });

        const newStaffId = staffId || existing.staffId;
        const newDate = date || existing.date;
        const newStart = startTime || existing.startTime;
        const newEnd = endTime || existing.endTime;
        const newRoom = room || existing.room;

        // Chống xung đột nhân sự (bỏ qua chính ca đang sửa)
        if (await hasConflict(newStaffId, newDate, newStart, newEnd, id)) {
            return res.status(400).json({ message: 'Nhân sự mới đã có ca trực trong khung giờ này!' });
        }

        // Chống xung đột nghỉ phép
        if (await hasLeaveConflict(newStaffId, newDate, newStart, newEnd)) {
            return res.status(400).json({ message: 'Nhân sự mới đã được duyệt nghỉ phép trong khoảng thời gian này!' });
        }

        // Độc quyền phòng khám
        if (await hasRoomConflict(newRoom, newDate, newStart, newEnd, id)) {
            return res.status(400).json({ message: `Phòng ${newRoom} đã được sử dụng trong khung giờ này!` });
        }

        // Kiểm tra 12h/ngày cho nhân sự mới
        const totalHours = await getTotalHoursInDay(newStaffId, newDate, newStart, newEnd, id);
        if (totalHours > 12) {
            return res.status(400).json({ message: 'Vi phạm quy định quá tải lao động! Nhân sự đã đủ/vượt quá 12 giờ làm việc trong ngày này.' });
        }

        const updatedShift = await Shift.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        // Gửi thông báo cho bác sĩ thay thế nếu staffId thay đổi
        if (staffId && staffId.toString() !== existing.staffId.toString()) {
            const newStaff = await User.findById(staffId);
            if (newStaff) {
                try {
                    await notificationService.sendShiftNotification(newStaff, updatedShift, true);
                } catch (_) {}
            }
        }

        res.status(200).json(updatedShift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Xóa ca trực (EF2.1)
exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id);
        if (!shift) return res.status(404).json({ message: 'Không tìm thấy ca trực!' });

        // Kiểm tra có lịch hẹn trong ngày này không
        const hasAppointment = await Appointment.findOne({
            date: shift.date,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (hasAppointment) {
            return res.status(400).json({ message: 'Ca trực này đã phát sinh lịch hẹn. Yêu cầu tiến hành dời lịch của bệnh nhân trước khi thực hiện.' });
        }

        await shift.deleteOne();
        res.status(200).json({ message: 'Xóa ca trực thành công!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Sao chép lịch trực (AF2.1 & EF2.3)
exports.copyShifts = async (req, res) => {
    try {
        const { sourceDate, targetDate, ignoreHolidays } = req.body;
        
        // Tính toán thứ 2 đầu tuần của source và target
        const sDate = new Date(sourceDate);
        const dayOfWeekSource = sDate.getDay() === 0 ? 6 : sDate.getDay() - 1; // 0 = Sunday
        const sStart = new Date(sDate);
        sStart.setDate(sStart.getDate() - dayOfWeekSource);
        sStart.setHours(0, 0, 0, 0);
        
        const tDate = new Date(targetDate);
        const dayOfWeekTarget = tDate.getDay() === 0 ? 6 : tDate.getDay() - 1;
        const tStart = new Date(tDate);
        tStart.setDate(tStart.getDate() - dayOfWeekTarget);
        tStart.setHours(0, 0, 0, 0);
        
        const tEnd = new Date(tStart);
        tEnd.setDate(tEnd.getDate() + 6);
        tEnd.setHours(23, 59, 59, 999);
        
        const sEnd = new Date(sStart);
        sEnd.setDate(sEnd.getDate() + 6);
        sEnd.setHours(23, 59, 59, 999);

        // Kiểm tra xem tuần đích có trùng ngày nghỉ lễ nào không (EF2.3)
        if (!ignoreHolidays) {
            const holidays = await Holiday.find({
                $or: [
                    { startDate: { $lte: tEnd }, endDate: { $gte: tStart } }
                ]
            });
            if (holidays.length > 0) {
                return res.status(409).json({ 
                    message: 'Tuần đích chứa ngày nghỉ lễ. Bạn có muốn bỏ qua các ngày nghỉ này và tiếp tục sao chép?', 
                    hasHoliday: true 
                });
            }
        }
        
        // Lấy tất cả ca trực trong tuần nguồn
        const sourceShifts = await Shift.find({
            date: { $gte: sStart, $lte: sEnd }
        });
        
        if (sourceShifts.length === 0) {
            return res.status(400).json({ message: 'Tuần nguồn không có ca trực nào để sao chép.' });
        }
        
        // Số ngày chênh lệch để dời ca
        const diffTime = tStart.getTime() - sStart.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
        
        const newShifts = [];
        let conflictCount = 0;
        
        for (const shift of sourceShifts) {
            const newDate = new Date(shift.date);
            newDate.setDate(newDate.getDate() + diffDays);
            
            // Nếu người dùng chọn bỏ qua ngày nghỉ, thì không copy ca vào ngày nghỉ
            if (ignoreHolidays) {
                 const holidayOnDay = await Holiday.findOne({
                    startDate: { $lte: newDate }, endDate: { $gte: newDate }
                 });
                 if (holidayOnDay) continue; // Bỏ qua ca này
            }
            
            // Kiểm tra xung đột (Nhân sự hoặc phòng) trong tuần đích
            const isStaffConflict = await hasConflict(shift.staffId, newDate, shift.startTime, shift.endTime);
            const isStaffLeave = await hasLeaveConflict(shift.staffId, newDate, shift.startTime, shift.endTime);
            const isRoomConflict = await hasRoomConflict(shift.room, newDate, shift.startTime, shift.endTime);
            
            // Check exist exact shift to avoid duplicate copy
            const exactShift = await Shift.findOne({
                staffId: shift.staffId, date: newDate, startTime: shift.startTime, room: shift.room
            });

            if (isStaffConflict || isStaffLeave || isRoomConflict || exactShift) {
                conflictCount++;
                continue;
            }
            
            newShifts.push({
                staffId: shift.staffId,
                date: newDate,
                startTime: shift.startTime,
                endTime: shift.endTime,
                room: shift.room,
                role: shift.role,
                createdBy: req.user._id
            });
        }
        
        if (newShifts.length > 0) {
            await Shift.insertMany(newShifts);
        }
        
        res.status(200).json({ 
            message: `Sao chép thành công ${newShifts.length} ca trực. Đã bỏ qua ${conflictCount} ca do xung đột.` 
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
