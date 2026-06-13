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

module.exports = router;