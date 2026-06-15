const express = require('express');
const router = express.Router();
const { getAllHolidays, checkHolidayConflicts, createHoliday, updateHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getAllHolidays);
router.post('/check', restrictTo('Admin'), checkHolidayConflicts);
router.post('/', restrictTo('Admin'), createHoliday);
router.put('/:id', restrictTo('Admin'), updateHoliday);
router.delete('/:id', restrictTo('Admin'), deleteHoliday);

module.exports = router;
