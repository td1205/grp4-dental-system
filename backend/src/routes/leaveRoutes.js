const express = require('express');
const router = express.Router(); // Khởi tạo router
const leaveRequestController = require('../controllers/leaveRequestController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Áp dụng middleware bảo mật
router.use(protect);

// Các route cho lịch nghỉ
router.get('/', leaveRequestController.getLeaveRequests);
router.post('/register', leaveRequestController.createLeaveRequest);
router.post('/system-leave', restrictTo('Admin'), leaveRequestController.createSystemLeave);
router.put('/:id/approve', restrictTo('Admin'), leaveRequestController.approveLeave);
router.put('/:id/reject', restrictTo('Admin'), leaveRequestController.rejectLeave);

module.exports = router;