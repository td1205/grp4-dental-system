const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('Admin')); // Security UC4.1_SEC_001

router.get('/', salaryController.getSalaryConfigs);
router.post('/', salaryController.createSalaryConfig);

module.exports = router;
