const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffControllers');

// Nối API với Controller tương ứng
router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.post('/activate', staffController.activateStaff);
router.post('/login', staffController.loginStaff);

module.exports = router;