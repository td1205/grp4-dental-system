const LeaveRequest = require('../models/LeaveRequest');
const Shift = require('../models/Shift');
const Admin = require('../models/Admin');
const User = require('../models/User');
const CycleLock = require('../models/CycleLock');
const notificationService = require('../services/notificationService');

const clearShiftsForLeave = async (staffId, startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    await Shift.updateMany(
        { 
            staffId: staffId, 
            date: { $gte: start, $lte: end } 
        },
        { 
            $set: { staffId: null, status: 'Trống' } 
        }
    );
};

// 1. Lấy danh sách lịch nghỉ (Admin xem tất cả, Nhân viên xem cá nhân)
const getLeaveRequests = async (req, res) => {
    try {
        // Nếu là Admin, lấy tất cả. Nếu là nhân viên, lọc theo staffId
        const query = req.user.role === 'Admin' ? {} : { staffId: req.user.id };
        const leaves = await LeaveRequest.find(query).populate('staffId', 'name role');

        res.status(200).json({ success: true, data: leaves });
    } catch (err) {
        res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
    }
};

// 2. Nhân viên đăng ký nghỉ phép (UC 2.3)
const createLeaveRequest = async (req, res) => {
    try {
        const { startDate, endDate, duration, leaveType, reason } = req.body;

        // Ràng buộc thời gian: không chọn ngày quá khứ (so sánh start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        if (start < today) {
            return res.status(400).json({ message: "Ngày bắt đầu phải sau ngày hiện tại" });
        }

        // Kiểm tra xem chu kỳ tháng này đã bị chốt chưa
        const month = start.getMonth() + 1;
        const year = start.getFullYear();
        const cycleLock = await CycleLock.findOne({ month, year });
        if (cycleLock && cycleLock.isLocked) {
            return res.status(400).json({ message: "Thời hạn đăng ký vắng mặt cho chu kỳ này đã kết thúc. Vui lòng liên hệ Quản trị viên để được hỗ trợ." });
        }

        const newLeave = new LeaveRequest({
            staffId: req.user.id,
            startDate,
            endDate,
            duration: duration || 'Cả ngày',
            leaveType,
            reason,
            status: 'Chờ duyệt'
        });

        await newLeave.save();

        // Gửi thông báo đến Admin
        try {
            const admins = await Admin.find({});
            const staffUser = await User.findById(req.user.id);
            if (staffUser) {
                await notificationService.sendAdminLeaveNotification(admins, staffUser, newLeave);
            }
        } catch (notifErr) {
            console.error('Lỗi khi gửi thông báo tạo đơn:', notifErr.message);
        }

        res.status(201).json({ message: "Đăng ký thành công", data: newLeave });
    } catch (err) {
        res.status(500).json({ message: "Lỗi tạo đơn", error: err.message });
    }
};

// 3. Admin thiết lập ngày nghỉ toàn hệ thống (UC 2.1)
const createSystemLeave = async (req, res) => {
    try {
        const { startDate, endDate, description } = req.body;

        const systemLeave = new LeaveRequest({
            staffId: req.user.id, // Admin thực hiện
            startDate,
            endDate,
            leaveType: 'Nghỉ lễ',
            reason: description,
            status: 'Đã duyệt' // Mặc định duyệt cho nghỉ lễ
        });

        await systemLeave.save();
        res.status(201).json({ message: "Thiết lập nghỉ lễ thành công", data: systemLeave });
    } catch (err) {
        res.status(500).json({ message: "Lỗi thiết lập", error: err.message });
    }
};

// 4. Admin phê duyệt đơn (UC 2.3)
const approveLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Đã duyệt', approvedBy: req.user.id },
            { new: true }
        );
        
        if (leave) {
            await clearShiftsForLeave(leave.staffId, leave.startDate, leave.endDate);
        }

        res.status(200).json({ message: "Đã duyệt đơn nghỉ", data: leave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. Admin từ chối đơn (UC 2.3 - Bắt buộc lý do)
const rejectLeave = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        if (!rejectionReason) return res.status(400).json({ message: "Cần lý do từ chối" });

        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Từ chối', rejectionReason, approvedBy: req.user.id },
            { new: true }
        );
        res.status(200).json({ message: "Đã từ chối đơn", data: leave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 6. Nhân viên tự hủy đơn (UC 2.3)
const cancelLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findOne({ _id: req.params.id, staffId: req.user.id });
        if (!leave) return res.status(404).json({ message: "Không tìm thấy đơn nghỉ phép" });

        if (leave.status === 'Chờ duyệt') {
            leave.status = 'Đã hủy';
            await leave.save();
            return res.status(200).json({ message: "Đã hủy đơn thành công", data: leave });
        } else if (leave.status === 'Đã duyệt') {
            leave.status = 'Chờ hủy phép';
            await leave.save();

            // Gửi thông báo đến Admin
            try {
                const admins = await Admin.find({});
                const staffUser = await User.findById(req.user.id);
                if (staffUser) {
                    await notificationService.sendAdminLeaveNotification(admins, staffUser, leave, true);
                }
            } catch (notifErr) {
                console.error('Lỗi khi gửi thông báo hủy đơn:', notifErr.message);
            }

            return res.status(200).json({ message: "Đã gửi yêu cầu hủy phép. Vui lòng chờ Admin duyệt.", data: leave });
        } else {
            return res.status(400).json({ message: "Không thể hủy đơn ở trạng thái hiện tại" });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 7. Admin tạo đơn nghỉ khẩn cấp (UC 2.3)
const createEmergencyLeave = async (req, res) => {
    try {
        const { staffId, startDate, endDate, duration, leaveType, reason } = req.body;

        if (!staffId || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
        }

        const emergencyLeave = new LeaveRequest({
            staffId,
            startDate,
            endDate,
            duration: duration || 'Cả ngày',
            leaveType: leaveType || 'Việc riêng',
            reason,
            status: 'Đã duyệt', // Mặc định duyệt
            approvedBy: req.user.id
        });

        await emergencyLeave.save();
        await clearShiftsForLeave(staffId, startDate, endDate);
        
        res.status(201).json({ message: "Ghi nhận vắng mặt khẩn cấp thành công", data: emergencyLeave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 8. Admin duyệt yêu cầu hủy phép (UC 2.3)
const approveCancelLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Đã hủy', approvedBy: req.user.id },
            { new: true }
        );
        res.status(200).json({ message: "Đã xác nhận hủy đơn", data: leave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 9. Admin từ chối yêu cầu hủy phép (UC 2.3)
const rejectCancelLeave = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        if (!rejectionReason) return res.status(400).json({ message: "Cần lý do từ chối" });

        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Đã duyệt', rejectionReason, approvedBy: req.user.id },
            { new: true }
        );
        res.status(200).json({ message: "Đã từ chối hủy phép", data: leave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 10. Admin toggle khóa chu kỳ (Để test EXC_001)
const toggleCycleLock = async (req, res) => {
    try {
        const { month, year, isLocked } = req.body;
        if (!month || !year) return res.status(400).json({ message: "Vui lòng truyền month và year" });

        const lock = await CycleLock.findOneAndUpdate(
            { month, year },
            { isLocked, lockedBy: req.user.id, lockedAt: new Date() },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: isLocked ? `Đã khóa chu kỳ ${month}/${year}` : `Đã mở khóa chu kỳ ${month}/${year}`, data: lock });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
    getLeaveRequests,
    createLeaveRequest,
    createSystemLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    createEmergencyLeave,
    approveCancelLeave,
    rejectCancelLeave,
    toggleCycleLock
};