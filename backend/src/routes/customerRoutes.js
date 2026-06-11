const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController'); // Đã xóa chữ 's' ở cuối

// Nối API với Controller tương ứng
router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);

module.exports = router;