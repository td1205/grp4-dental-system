const express = require('express');
const router = express.Router();
// Lấy mảng dữ liệu lịch hẹn từ file mockData dùng chung
let { MOCK_APPOINTMENTS } = require('../data/mockData');


router.get('/', (req, res) => {
  res.json(MOCK_APPOINTMENTS);
});


router.post('/', (req, res) => {
  const { name, phone, date, time, service, doctor } = req.body;

  // Kiểm tra điều kiện bắt buộc đầu vào để tránh dữ liệu trống
  if (!name || !phone || !date || !time) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ Họ tên, SĐT, Ngày và Giờ khám!' });
  }

  // Tự động tính toán ID lớn nhất tiếp theo và dựng cấu trúc bản ghi mới
  const newAppointment = {
    id: MOCK_APPOINTMENTS.length > 0 ? Math.max(...MOCK_APPOINTMENTS.map(a => a.id)) + 1 : 1,
    name: name.trim(),
    phone: phone.trim(),
    date: date,       // Định dạng chuỗi nhận từ ô chọn lịch (YYYY-MM-DD)
    time: time,       // Định dạng chuỗi nhận từ ô chọn giờ (HH:MM)
    service: service || 'Khám tổng quát',
    doctor: doctor || 'BS. Hưng',
    status: 'Chờ xác nhận' // Các lịch trực tiếp tạo từ Lễ tân mặc định sẽ để Chờ xác nhận
  };

  MOCK_APPOINTMENTS.push(newAppointment);
  res.status(201).json({ message: 'Đặt lịch hẹn mới thành công!', data: newAppointment });
});


router.put('/:id/reschedule', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { date, time, doctor } = req.body; // Bổ sung bóc tách biến doctor từ body gửi lên

  if (!date || !time) {
    return res.status(400).json({ message: 'Vui lòng chọn đầy đủ Ngày và Giờ khám mới!' });
  }

  const appointment = MOCK_APPOINTMENTS.find(a => a.id === id);
  if (appointment) {
    appointment.date = date;
    appointment.time = time;
    
    // Nếu phía Frontend có gửi kèm thông tin bác sĩ, cập nhật luôn cho bệnh nhân
    if (doctor) {
      appointment.doctor = doctor;
    }
    
    appointment.status = 'Đã xác nhận'; // Đổi lịch xong tự động chuyển thành Đã xác nhận
    return res.json({ message: 'Thay đổi ngày giờ hẹn thành công!', data: appointment });
  }
  res.status(404).json({ message: 'Không tìm thấy lịch hẹn này' });
});


router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body; // Trạng thái mới gửi từ Frontend lên ('Đã hủy'...)

  const appointment = MOCK_APPOINTMENTS.find(a => a.id === id);
  if (appointment) {
    appointment.status = status;
    return res.json({ message: `Cập nhật trạng thái lịch hẹn thành ${status} thành công`, data: appointment });
  }
  res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
});

module.exports = router;