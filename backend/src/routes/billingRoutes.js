const express = require('express');
const router = express.Router();

// Lấy đối tượng MOCK_INVOICES dạng Object từ file mockData dùng chung
let { MOCK_INVOICES } = require('../data/mockData');

// =================================================================
// API 1: Lấy danh sách toàn bộ hóa đơn viện phí (Chuyển đổi Object -> Array)
// =================================================================
router.get('/invoices', (req, res) => {
  // Biến đổi cấu trúc Object { INV001: {...} } thành dạng Mảng [ { id: 'INV001', ... } ] để Frontend map mượt mà
  const invoiceArray = Object.keys(MOCK_INVOICES).map((key) => {
    return {
      id: key,
      ...MOCK_INVOICES[key]
    };
  });
  res.json(invoiceArray);
});

// =================================================================
// API 2: Xác nhận thu tiền hóa đơn (Xử lý trực tiếp trên Object gốc)
// =================================================================
router.post('/invoices/:id/pay', (req, res) => {
  const invoiceId = req.params.id; // Lấy mã ID (Ví dụ: "INV001" hoặc "INV002")
  const { paymentMethod } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ ok: false, message: 'Mã hóa đơn không hợp lệ' });
  }

  // Dò tìm trực tiếp bằng Key của Object (Nhanh và không bao giờ lỗi sập hệ thống)
  const invoice = MOCK_INVOICES[invoiceId];

  if (invoice) {
    invoice.status = 'Đã thanh toán';
    
    // Lưu vết phương thức thanh toán để đối soát dữ liệu
    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod; // 'Tiền mặt', 'Chuyển khoản QR'...
    }

    console.log(`[BILLING SUCCESS] Hóa đơn ${invoiceId} đã thanh toán thành công bằng [${paymentMethod || 'Tiền mặt'}]`);

    return res.json({ 
      ok: true,
      message: 'Xác nhận thu tiền hóa đơn thành công!', 
      data: { id: invoiceId, ...invoice }
    });
  }

  // Báo lỗi nếu ID truyền lên bị lệch ký tự
  console.log(`[BILLING ERROR] Không tìm thấy mã hóa đơn: ${invoiceId}`);
  res.status(404).json({ ok: false, message: 'Không tìm thấy hóa đơn này trên hệ thống' });
});

module.exports = router;