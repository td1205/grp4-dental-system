const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Nối API với Controller tương ứng
router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.patch('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.patch('/:id/restore', customerController.restoreCustomer);

module.exports = router;