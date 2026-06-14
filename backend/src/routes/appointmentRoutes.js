const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

// Áp dụng middleware protect cho tất cả các route của Appointment
router.use(protect);

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.put('/:id/status', appointmentController.updateStatus);

module.exports = router;