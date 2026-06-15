const Holiday = require('../models/Holiday');
const Appointment = require('../models/Appointment');

// 1. Lấy danh sách tất cả lịch nghỉ lễ
const getAllHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ startDate: 1 });
        res.status(200).json({ success: true, data: holidays });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 1.5. API Check xung đột trước khi lưu (EF2.1.1, EF2.1.4)
const checkHolidayConflicts = async (req, res) => {
    try {
        const { startDate, endDate, ignoreHolidayId } = req.body;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);

        if (start < today) return res.status(400).json({ message: 'Ngày bắt đầu lịch nghỉ không được nằm trong quá khứ.' });
        if (end < start) return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });

        // Check overlap holiday
        const overlapQuery = {
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        };
        if (ignoreHolidayId) {
            overlapQuery._id = { $ne: ignoreHolidayId };
        }
        
        const overlapHoliday = await Holiday.findOne(overlapQuery);

        // Check conflicting appointments
        const conflictingAppointments = await Appointment.find({
            date: { $gte: start, $lte: end },
            status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] }
        });

        res.status(200).json({
            success: true,
            overlapHoliday: overlapHoliday || null,
            affectedAppointmentsCount: conflictingAppointments.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 2. Tạo lịch nghỉ lễ mới
const createHoliday = async (req, res) => {
    try {
        const { name, startDate, endDate, type, department, description, holidayAction, appointmentAction } = req.body;

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);

        // EF2.1.4: Xử lý gộp lịch nghỉ
        let holidayIdToReturn = null;
        let holidayObj = null;

        if (holidayAction === 'merge') {
            const overlap = await Holiday.findOne({
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }
                ]
            });
            if (overlap) {
                // Extend dates
                const newStart = start < new Date(overlap.startDate) ? start : new Date(overlap.startDate);
                const newEnd = end > new Date(overlap.endDate) ? end : new Date(overlap.endDate);
                
                overlap.startDate = newStart;
                overlap.endDate = newEnd;
                // Merge name if needed, or keep latest
                overlap.name = name; // Update with new name
                overlap.type = type;
                overlap.department = department;
                overlap.description = description;
                
                await overlap.save();
                holidayIdToReturn = overlap._id;
                holidayObj = overlap;
            }
        } 
        
        if (!holidayObj) {
            // Create new
            const holiday = new Holiday({ name, startDate, endDate, type, department, description });
            await holiday.save();
            holidayIdToReturn = holiday._id;
            holidayObj = holiday;
        }

        // EF2.1.1 & BR2.1.2: Xử lý lịch khám
        if (appointmentAction === 'cancel' || appointmentAction === 'reschedule') {
            const conflictingAppointments = await Appointment.find({
                date: { $gte: start, $lte: end },
                status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] }
            });

            if (conflictingAppointments.length > 0) {
                const newStatus = appointmentAction === 'cancel' ? 'Cancelled' : 'Pending';
                const notes = appointmentAction === 'cancel' ? 'Bị hủy do lịch nghỉ đột xuất' : 'Chờ dời lịch do lịch nghỉ đột xuất';
                
                await Appointment.updateMany(
                    { _id: { $in: conflictingAppointments.map(a => a._id) } },
                    { $set: { status: newStatus, notes: notes } }
                );
            }
        }

        res.status(201).json({ success: true, message: 'Thiết lập thành công', data: holidayObj });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 3. Cập nhật lịch nghỉ lễ
const updateHoliday = async (req, res) => {
    try {
        const { name, startDate, endDate, type, department, description } = req.body;

        // EF2.1.2: Validate khoảng ngày
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });
        }

        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            { name, startDate, endDate, type, department, description },
            { new: true }
        );

        if (!holiday) return res.status(404).json({ message: 'Không tìm thấy lịch nghỉ' });

        res.status(200).json({ success: true, message: 'Chỉnh sửa thành công', data: holiday });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 4. Xóa lịch nghỉ lễ
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        if (!holiday) return res.status(404).json({ message: 'Không tìm thấy lịch nghỉ' });
        res.status(200).json({ success: true, message: 'Xóa ngày nghỉ thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

module.exports = { getAllHolidays, checkHolidayConflicts, createHoliday, updateHoliday, deleteHoliday };
