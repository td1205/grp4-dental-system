const Shift = require('../models/Shift');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const notificationService = require('../services/notificationService');

// 1. Lấy danh sách lịch trực (BR2.2.1)
exports.getShifts = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin') {
            query = { staffId: req.user.id };
        }
        const shifts = await Shift.find(query).populate('staffId', 'name');
        res.status(200).json(shifts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Xếp ca mới (UC2.2 - Luồng 2 & BR2.2.3)
exports.createShift = async (req, res) => {
    try {
        const { staffId, date, startTime, endTime, room, role } = req.body;

        // Kiểm tra nhân sự hoạt động (BR1.2.1)
        const staff = await User.findById(staffId);
        if (!staff || staff.status !== 'Hoạt động') {
            return res.status(400).json({ message: "Nhân sự không khả dụng!" });
        }

        // Kiểm tra Lễ tân tối thiểu (BR2.2.3)
        if (role !== 'Lễ tân') {
            const hasReceptionist = await Shift.findOne({ date, startTime, role: 'Lễ tân' });
            if (!hasReceptionist) {
                return res.status(400).json({ message: "Ca trực phải có tối thiểu 01 Lễ tân!" });
            }
        }

        // Chống xung đột (BR2.2.2)
        const conflict = await Shift.findOne({ staffId, date, startTime: { $lt: endTime }, endTime: { $gt: startTime } });
        if (conflict) return res.status(400).json({ message: "Nhân sự bị trùng ca!" });

        // Kiểm tra quá tải 12h/ngày (EF2.2.2)
        const dayShifts = await Shift.find({ staffId, date });
        const newHours = (parseInt(endTime) - parseInt(startTime));
        const totalHours = dayShifts.reduce((sum, s) => sum + (parseInt(s.endTime) - parseInt(s.startTime)), 0) + newHours;
        if (totalHours > 12) return res.status(400).json({ message: "Vi phạm quy định quá tải (tối đa 12h/ngày)!" });

        const newShift = await Shift.create(req.body);

        // Gửi thông báo tự động (UC2.2 - Luồng 2)
        await notificationService.sendShiftNotification(staff, newShift);

        res.status(201).json(newShift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Xóa ca trực (EF2.1: Ràng buộc xóa ca)
exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id);
        if (!shift) return res.status(404).json({ message: "Không tìm thấy ca trực!" });

        const hasAppointment = await Appointment.findOne({ date: shift.date, status: 'Đã đặt' });
        if (hasAppointment) {
            return res.status(400).json({ message: "Ca trực đã có lịch hẹn, yêu cầu dời lịch bệnh nhân trước!" });
        }

        await shift.deleteOne();
        res.status(200).json({ message: "Xóa ca trực thành công!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Thêm hàm này vào shiftController.js
exports.updateShift = async (req, res) => {
    try {
        const updatedShift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedShift) return res.status(404).json({ message: "Không tìm thấy ca trực!" });
        res.status(200).json(updatedShift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
