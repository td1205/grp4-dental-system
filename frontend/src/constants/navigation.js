// Cấu hình menu cho từng vai trò (GIỮ NGUYÊN HOÀN TOÀN CỦA BẠN)
const MENU_CONFIG = {
  Admin: [
    {
      id: 'users', label: 'Quản lý người dùng', icon: 'users', path: '/users', children: [
        { id: 'staff', label: 'Quản lý nhân viên', path: '/staff' },
        { id: 'customers', label: 'Quản lý khách hàng', path: '/customers' },
      ]
    },
    {
      id: 'services', label: 'Dịch vụ', icon: 'services', path: '/services', children: [
        { id: 'service-categories', label: 'Danh mục dịch vụ', path: '/services/categories' },
        { id: 'service-prices', label: 'Bảng giá dịch vụ', path: '/services/prices' },
      ]
    },
    {
      id: 'schedule', label: 'Lịch làm việc', icon: 'schedule', path: '/schedule', children: [
        { id: 'schedule-leaves', label: 'Quản lý lịch nghỉ', path: '/schedule/leaves' },
        { id: 'schedule-shifts', label: 'Thiết lập ca làm việc', path: '/schedule/shifts' },
      ]
    },
    {
      id: 'salary', label: 'Lương', icon: 'salary', path: '/salary', children: [
        { id: 'salary-config', label: 'Cấu hình lương & Hệ số ca bệnh', path: '/salary/config' },
        { id: 'salary-payslips', label: 'Phiếu lương bác sĩ', path: '/salary/payslips' },
      ]
    },
    { id: 'revenue', label: 'Thống kê doanh thu', icon: 'stats', path: '/revenue' },
  ],
  Receptionist: [
    { id: 'customers', label: 'Quản lý khách hàng', icon: 'users', path: '/customers' },
    { id: 'appointment', label: 'Đặt lịch hẹn', icon: 'schedule', path: '/appointments' },
    { id: 'queue', label: 'Hàng đợi', icon: 'services', path: '/queue' },
  ],
  Doctor: [
    { id: 'dashboard', label: 'Hàng đợi khám', icon: 'stetho', path: '/doctor/dashboard' },
    { id: 'history', label: 'Lịch sử bệnh án', icon: 'history', path: '/doctor/history' },
    // Bổ sung các chức năng còn thiếu theo đặc tả:
    {
      id: 'schedule',
      label: 'Lịch trực cá nhân', // Phục vụ UC2.2 (Xem lịch) và UC2.3 (Xin nghỉ phép)
      icon: 'schedule',
      path: '/schedule/shifts' // Điều chỉnh lại path này cho khớp với route Lịch làm việc của bạn
    },
    {
      id: 'income-report',
      label: 'Báo cáo thu nhập', // Phục vụ UC4.6 (Báo cáo tiền lương của một bác sĩ trong một năm)
      icon: 'salary',
      path: '/doctor/payslips'
    }
  ]
};

// ĐÂY LÀ PHẦN HÀM ĐÃ ĐƯỢC LÀM CHO THÔNG MINH HƠN
export const getNavItems = (role) => {
  if (!role) return [];

  // Chuẩn hóa chuỗi về chữ thường để không bị lỗi nhận diện
  const currentRole = role.toLowerCase();

  if (currentRole.includes('admin') || currentRole.includes('quản trị')) {
    return MENU_CONFIG.Admin;
  }
  if (currentRole.includes('doctor') || currentRole.includes('bác sĩ')) {
    return MENU_CONFIG.Doctor;
  }
  if (currentRole.includes('receptionist') || currentRole.includes('lễ tân')) {
    return MENU_CONFIG.Receptionist;
  }

  return [];
};

export const DEFAULT_USER = { initials: 'AU', name: 'User', email: 'user@dentalcare.vn' };