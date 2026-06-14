const express = require('express');
const router = express.Router();
// Lấy dữ liệu mẫu từ file mockData dùng chung
let { MOCK_RECEPTION, MOCK_CUSTOMERS, MOCK_PERSONAL_SCHEDULE } = require('../data/mockData');

// Mảng cục bộ lưu trữ danh sách các đơn xin nghỉ của Lễ tân (Lưu tạm trên RAM Server)
let MOCK_LEAVE_REQUESTS = [];

// =================================================================
// 1. CÁC API PHÂN HỆ TIẾP ĐÓN & HÀNG ĐỢI 
// =================================================================

// API: Lấy danh sách hàng đợi tiếp đón bốc từ mảng mockData
router.get('/patients', (req, res) => {
  res.json(MOCK_RECEPTION);
});

// API: Cập nhật trạng thái bệnh nhân khi chọn Select hoặc bấm nút Xác nhận
router.put('/patients/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const patient = MOCK_RECEPTION.find(p => p.id === id);
  if (patient) {
    patient.status = status;
    return res.json({ message: 'Cập nhật trạng thái thành công', data: patient });
  }
  res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
});

// API: Tiếp nhận đơn Đăng ký khách vãng lai mới từ Popup Frontend
router.post('/patients/walk-in', (req, res) => {
  const { name, phone, service, doctor } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ message: 'Thiếu thông tin Tên hoặc Số điện thoại bệnh nhân!' });
  }

  const newPatient = {
    id: MOCK_RECEPTION.length > 0 ? Math.max(...MOCK_RECEPTION.map(p => p.id)) + 1 : 1,
    time: new Date().toTimeString().slice(0, 5), 
    name: name.trim(),
    phone: phone.trim(),
    service: service || 'Khám tổng quát',
    doctor: doctor || 'BS. Hưng',
    status: 'Chờ tiếp đón'
  };
  MOCK_RECEPTION.push(newPatient);
  res.status(201).json({ message: 'Thêm khách vãng lai thành công', data: newPatient });
});

// =================================================================
// 2. CÁC API PHÂN HỆ QUẢN LÝ KHÁCH HÀNG (BẢN TỐI ƯU HÓA KHỬ LỖI)
// =================================================================

// API: Lấy toàn bộ danh sách khách hàng hiển thị lên bảng Grid
router.get('/customers', (req, res) => {
  res.json(MOCK_CUSTOMERS);
});

// API Chỉnh sửa cập nhật thông tin chi tiết một khách hàng
router.put('/customers/:id', (req, res) => {
  const customerId = req.params.id; // Giá trị từ URL (Ví dụ: "BN001")
  const { name, dob, phone, cccd, status } = req.body;

  if (!customerId) {
    return res.status(400).json({ message: 'Mã bệnh nhân không hợp lệ!' });
  }

  // SỬA LỖI CỐT LÕI: Tìm kiếm thông minh tuyệt đối bằng cách ép chuỗi .toString() và loại bỏ khoảng trắng
  const customer = MOCK_CUSTOMERS.find(c => {
    const targetId = c.id || c.id || ''; 
    return targetId.toString().trim().toLowerCase() === customerId.toString().trim().toLowerCase();
  });

  if (customer) {
    // Tiến hành cập nhật dữ liệu mới nếu có truyền sang
    if (name !== undefined) customer.name = name.trim();
    if (dob !== undefined) customer.dob = dob.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (cccd !== undefined) customer.cccd = cccd.trim();
    if (status !== undefined) customer.status = status;

    console.log(`[SUCCESS] Đã cập nhật thành công bệnh nhân: ${customerId}`);
    
    return res.json({
      message: `Cập nhật thông tin bệnh nhân ${customerId} thành công!`,
      data: customer
    });
  }

  // Nếu rơi vào đây nghĩa là ID truyền lên từ Frontend bị lệch hoàn toàn với file dữ liệu mẫu mockData.js
  console.log(`[ERROR 404] Frontend gửi lên ID [${customerId}] nhưng không tìm thấy trong danh sách.`);
  res.status(404).json({ message: `Không tìm thấy tài khoản bệnh nhân mang mã ${customerId} trên hệ thống.` });
});

// =================================================================
// 3. CÁC API PHÂN HỆ LỊCH LÀM VIỆC & ĐƠN XIN NGHỈ 
// =================================================================

// API: Lấy cấu trúc bảng lịch trực tuần của Lễ tân để hiển thị lên Grid
router.get('/personal-schedule', (req, res) => {
  res.json(MOCK_PERSONAL_SCHEDULE);
});

// API: Lấy toàn bộ danh sách đơn xin nghỉ
router.get('/leave-requests', (req, res) => {
  res.json(MOCK_LEAVE_REQUESTS);
});

// API: Tiếp nhận dữ liệu Đơn xin nghỉ gửi từ Form Modal Frontend lên
router.post('/leave-requests', (req, res) => {
  const { reason, startDate, endDate, note } = req.body;

  if (!reason || !startDate || !endDate) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường thông tin bắt buộc!' });
  }

  const newLeaveRequest = {
    id: MOCK_LEAVE_REQUESTS.length > 0 ? Math.max(...MOCK_LEAVE_REQUESTS.map(r => r.id)) + 1 : 1,
    reason: reason,
    startDate: startDate, 
    endDate: endDate,     
    note: note || '',
    createdAt: new Date().toISOString().slice(0, 10), 
    status: 'Chờ duyệt'    
  };

  MOCK_LEAVE_REQUESTS.push(newLeaveRequest);
  res.status(201).json({ message: 'Gửi đơn xin nghỉ thành công, vui lòng đợi quản lý xét duyệt!', data: newLeaveRequest });
});

module.exports = router;