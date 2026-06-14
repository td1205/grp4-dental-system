const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.get('/', protect, restrictTo('Admin'), revenueController.getRevenueStatistics);

module.exports = router;
