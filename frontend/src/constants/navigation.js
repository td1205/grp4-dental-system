export const NAV_ITEMS = [
  // =================================================================
  // PHÂN HỆ LỄ TÂN (CỦA BẠN - CHỈ HIỂN THỊ ĐÚNG 5 MỤC NÀY TRÊN MENU)
  // =================================================================
  {
    id: 'reception',
    label: 'Tiếp đón & Hàng đợi',
    icon: 'schedule', 
    path: '/reception'
  },
  {
    id: 'schedule',
    label: 'Quản lý lịch hẹn',
    icon: 'schedule',
    path: '/schedule'
  },
  {
    id: 'billing',
    label: 'Thanh toán Viện phí',
    icon: 'salary', 
    path: '/billing'
  },
  {
    id: 'personal-schedule',
    label: 'Lịch làm việc của tôi',
    icon: 'schedule',
    path: '/personal-schedule'
  },
  { 
    id: 'revenue', 
    label: 'Quản lý khách hàng', // <-- Trang Khách hàng của bạn đã được thêm lại ở đây
    icon: 'users', // Dùng icon chung hệ thống để tránh lỗi
    path: '/revenue' 
  }

  // =================================================================
  // CÁC MỤC CỦA ADMIN (ĐÃ ĐƯỢC TẠM ẨN ĐI ĐỂ TRÁNH LỖI GIAO DIỆN)
  // =================================================================
  /*
  ,
  {
    id: 'users',
    label: 'Quản lý người dùng',
    icon: 'users',
    path: '/users',
    children: [
      { id: 'staff', label: 'Quản lý nhân viên', path: '/staff' },
      { id: 'customers', label: 'Quản lý khách hàng', path: '/customers' }
    ]
  },
  {
    id: 'admin-schedule',
    label: 'Quản Lý Lịch Hẹn (Admin)',
    icon: 'schedule',
    path: '/schedule-admin',
    children: [
      { id: 'schedule-leaves', label: 'Quản lý lịch nghỉ', path: '/schedule/leaves' },
      { id: 'schedule-shifts', label: 'Thiết lập ca làm việc', path: '/schedule/shifts' }
    ]
  },
  {
    id: 'salary',
    label: 'Quản Lý Lương',
    icon: 'salary',
    path: '/salary',
    children: [
      { id: 'salary-config', label: 'Cấu hình lương & Hệ số ca bệnh', path: '/salary/config' },
      { id: 'salary-payslips', label: 'Phiếu lương bác sĩ', path: '/salary/payslips' }
    ]
  }
  */
];

export const DEFAULT_USER = {
  initials: 'LT',
  name: 'Lê Tân',
  email: 'letan@dentalcare.vn'
};