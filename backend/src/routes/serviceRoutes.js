const express = require('express');
const router = express.Router();
const { getAllServices, createService } = require('../controllers/serviceController');

// Khai báo các đường dẫn API
router.get('/', getAllServices);   // GET /api/services (Lấy danh sách)
router.post('/', createService);   // POST /api/services (Thêm mới)

module.exports = router;