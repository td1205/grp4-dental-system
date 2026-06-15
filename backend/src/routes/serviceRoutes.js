const express = require('express');
const router = express.Router();
const { 
    getAllServices, 
    createService, 
    addServicePrice,
    getSuggestedCode,
    updateService,
    deleteService,
    restoreService
} = require('../controllers/serviceController');

// Khai báo các đường dẫn API
router.get('/suggest-code', getSuggestedCode);
router.get('/', getAllServices);   // GET /api/services (Lấy danh sách)
router.post('/', createService);   // POST /api/services (Thêm mới)
router.put('/:id', updateService);
router.delete('/:id', deleteService);
router.patch('/:id/restore', restoreService);

router.post('/:serviceId/prices', addServicePrice);

module.exports = router;