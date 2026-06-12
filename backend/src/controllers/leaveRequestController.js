const LeaveRequest = require('../models/LeaveRequest');

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
        const { startDate, endDate, leaveType, reason } = req.body;

        // Ràng buộc thời gian: không chọn ngày quá khứ
        if (new Date(startDate) < new Date()) {
            return res.status(400).json({ message: "Ngày bắt đầu phải sau ngày hiện tại" });
        }

        const newLeave = new LeaveRequest({
            staffId: req.user.id,
            startDate,
            endDate,
            leaveType,
            reason,
            status: 'Chờ duyệt'
        });

        await newLeave.save();
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

module.exports = {
    getLeaveRequests,
    createLeaveRequest,
    createSystemLeave,
    approveLeave,
    rejectLeave
};