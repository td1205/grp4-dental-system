const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
// Thay vì: const { protect, restrictToAdmin } = require('../middlewares/authMiddleware');
// Hãy sửa thành:
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
// Sau đó sửa các route dùng 'restrictToAdmin' thành 'restrictTo('Admin')'
router.route('/')
    .get(shiftController.getShifts)
    .post(protect, restrictTo('Admin'), shiftController.createShift); // Gọi restrictTo('Admin')

router.post('/copy', protect, restrictTo('Admin'), shiftController.copyShifts);

router.route('/:id')
    .put(protect, restrictTo('Admin'), shiftController.updateShift)
    .delete(protect, restrictTo('Admin'), shiftController.deleteShift);

module.exports = router;