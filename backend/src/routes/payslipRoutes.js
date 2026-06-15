const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const ROLES = require('../constants/roles');

// Apply auth middleware if needed
// router.use(protect);
// router.use(restrictTo(ROLES.ADMIN));

router.post('/calculate', payslipController.calculatePayslip);
router.get('/report', payslipController.getAllPayslipsForMonth);
router.get('/yearly-report', protect, payslipController.getYearlyReport);
router.get('/fund-report', protect, payslipController.getFundReport);
router.get('/', payslipController.getPayslip);
router.post('/:id/confirm', payslipController.confirmPayslip);

module.exports = router;
