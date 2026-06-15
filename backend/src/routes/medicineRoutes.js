const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getAllMedicines);
router.post('/seed', medicineController.seedMedicines);

module.exports = router;
