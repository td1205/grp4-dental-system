const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

router.get('/customer/:customerId', medicalRecordController.getByCustomer);
router.post('/finish', medicalRecordController.finishExam);

module.exports = router;
