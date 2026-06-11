// 1. Dữ liệu của bạn Admin cũ
const MOCK_STAFF = [
  { id: 'NV001', fullName: 'Nguyễn Văn An', email: 'nguyenvanan@dentalcare.vn', phone: '0901234567', role: 'admin', status: 'active', dob: '1990-03-15', gender: 'male', idNumber: '001090001234', address: 'Hà Nội', workplace: 'DentalCare HQ', username: 'nguyenvanan', startDate: '2024-01-15' },
  { id: 'BS001', fullName: 'Trần Thị Bình', email: 'tranthibinh@dentalcare.vn', phone: '0912345678', role: 'doctor', degree: 'Bác sĩ Răng Hàm Mặt', status: 'active', dob: '1988-07-22', gender: 'female', idNumber: '001088007222', address: 'TP. Hồ Chí Minh', workplace: 'Phòng khám 1', username: 'tranthibinh', startDate: '2024-02-20' },
  { id: 'BS002', fullName: 'Lê Minh Cường', email: 'leminhcuong@dentalcare.vn', phone: '0923456789', role: 'doctor', degree: 'Thạc sĩ Nha khoa', status: 'active', dob: '1985-11-01', gender: 'male', idNumber: '001085011001', address: 'Đà Nẵng', workplace: 'Phòng khám 2', username: 'leminhcuong', startDate: '2024-03-10' },
  { id: 'LT001', fullName: 'Phạm Thu Dung', email: 'phamthudung@dentalcare.vn', phone: '0934567890', role: 'receptionist', status: 'locked', dob: '1995-05-18', gender: 'female', idNumber: '001095005518', address: 'Hải Phòng', workplace: 'Quầy lễ tân', username: 'phamthudung', startDate: '2024-04-05' },
];

// 2. Dữ liệu Tiếp đón & Hàng đợi của bạn
let MOCK_RECEPTION = [
  { id: 1, time: '08:30', name: 'Nguyễn Văn A', phone: '0901234567', service: 'Khám tổng quát', doctor: 'BS. Hưng', status: 'Chờ tiếp đón' },
  { id: 2, time: '09:00', name: 'Trần Thị B', phone: '0901234568', service: 'Nhổ răng khôn', doctor: 'BS. Tiến', status: 'Chờ khám' },
  { id: 3, time: '09:15', name: 'Lê Văn C', phone: '0987654321', service: 'Niềng răng', doctor: 'BS. Hưng', status: 'Đang khám' },
];

// 3. Dữ liệu Lịch hẹn của bạn
let MOCK_APPOINTMENTS = [
  { id: 1, name: "Nguyễn Văn A", phone: "0901234567", date: "2026-06-09", time: "08:30", service: "Khám tổng quát", doctor: "BS. Hưng", status: "Đã xác nhận" },
  { id: 2, name: "Phạm Thị D", phone: "0912345678", date: "2026-06-09", time: "10:00", service: "Tẩy trắng răng", doctor: "BS. Tiến", status: "Chờ xác nhận" },
  { id: 3, name: "Hoàng Văn E", phone: "0923456789", date: "2026-06-10", time: "14:00", service: "Trám răng", doctor: "BS. Hưng", status: "Đã xác nhận" },
];

// 4. Dữ liệu Hóa đơn (Thanh toán viện phí) của bạn
let MOCK_INVOICES = {
  INV001: { patientName: "Nguyễn Văn A", items: [{ name: "Khám tổng quát", price: "300.000 VND", quantity: 1, total: "300.000 VND" }, { name: "Trám răng thẩm mỹ", price: "1.200.000 VND", quantity: 1, total: "1.200.000 VND" }], totalCost: "1.500.000 VND", status: "Chờ thanh toán" },
  INV002: { patientName: "Trần Thị B", items: [{ name: "Niềng răng kim loại", price: "2.500.000 VND", quantity: 1, total: "2.500.000 VND" }, { name: "Khám tổng quát", price: "300.000 VND", quantity: 1, total: "300.000 VND" }], totalCost: "2.800.000 VND", status: "Chờ thanh toán" },
  INV003: { patientName: "Lê Văn C", items: [{ name: "Cạo vôi răng (Lấy cao răng)", price: "450.000 VND", quantity: 1, total: "450.000 VND" }], totalCost: "450.000 VND", status: "Chờ thanh toán" }
};

// 5. Dữ liệu Quản lý khách hàng của bạn
let MOCK_CUSTOMERS = [
  { id: 'BN001', name: 'Nguyễn Văn A', dob: '15/03/1990', phone: '0901234567', cccd: '001234567890', status: 'Đang hoạt động' },
  { id: 'BN002', name: 'Trần Thị B', dob: '22/07/1985', phone: '0901234568', cccd: '001234567891', status: 'Đang hoạt động' },
  { id: 'BN003', name: 'Lê Văn C', dob: '10/11/1995', phone: '0987654321', cccd: '001234567892', status: 'Đang hoạt động' },
];

// 6. Dữ liệu Lịch làm việc cá nhân của bạn
let MOCK_PERSONAL_SCHEDULE = {
  '08:00-Thứ 2': { shift: 'Ca Sáng', location: 'Quầy Lễ Tân', doctor: 'BS. Hưng' },
  '08:00-Thứ 5': { shift: 'Ca Sáng', location: 'Quầy Lễ Tân', doctor: 'BS. Hưng' },
  '08:00-Thứ 7': { shift: 'Ca Sáng', location: 'Quầy Lễ Tân', doctor: 'BS. Tiến' },
  '09:00-Thứ 2': { shift: 'Ca Sáng', location: 'Quầy Lễ Tân', doctor: 'BS. Hưng' },
  '13:00-Thứ 3': { shift: 'Ca Chiều', location: 'Quầy Lễ Tân', doctor: 'BS. Tiến' },
};

// Xuất tất cả các biến dữ liệu ra để các file Routes con lấy dùng
module.exports = {
  MOCK_STAFF,
  MOCK_RECEPTION,
  MOCK_APPOINTMENTS,
  MOCK_INVOICES,
  MOCK_CUSTOMERS,
  MOCK_PERSONAL_SCHEDULE
};