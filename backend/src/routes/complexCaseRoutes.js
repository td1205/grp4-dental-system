const express = require('express');
const router = express.Router();
const complexCaseController = require('../controllers/complexCaseController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('Admin')); // Security UC4.3_SEC_001, 002

router.get('/', complexCaseController.getComplexCaseShifts);
router.put('/:shiftId', complexCaseController.updateComplexCaseCoefficient);

module.exports = router;
