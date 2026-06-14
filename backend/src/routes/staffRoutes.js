const express = require('express');
const router = express.Router();

const staffController = require('../controllers/staffControllers');
const { protect } = require('../middlewares/authMiddleware');

// Nối API với Controller tương ứng
router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.post('/activate', staffController.activateStaff);
router.post('/login', staffController.loginStaff);
router.get('/for-scheduling', protect, staffController.getStaffForScheduling);
router.post('/:id/resend-email', staffController.resendEmail);
router.patch('/:id/reset-password', staffController.resetPassword);
router.get('/:id/check-appointments', staffController.checkAppointments);
router.post('/:id/reassign-suspend', staffController.reassignAndSuspend);
router.patch('/:id/lock', staffController.toggleLockStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;