const express = require('express');
const router = express.Router();
const shiftCoefficientController = require('../controllers/shiftCoefficientController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('Admin')); // Security UC4.2_SEC_001, 002

router.get('/', shiftCoefficientController.getCoefficients);
router.put('/', shiftCoefficientController.updateCoefficients);

module.exports = router;
