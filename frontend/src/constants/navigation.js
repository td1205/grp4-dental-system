import { ROLES } from './roles';

// Cấu hình menu cho từng vai trò
const MENU_CONFIG = {
  [ROLES.ADMIN]: [
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
        { id: 'salary-config', label: 'Thiết lập lương', path: '/salary/config' },
        { id: 'shift-coefficients', label: 'Hệ số ca', path: '/salary/coefficients' },
        { id: 'payslip', label: 'Lập phiếu lương', path: '/salary/payslip' },
        { id: 'salary-payslips', label: 'DS Phiếu lương bác sĩ', path: '/salary/payslips' },
        { id: 'yearly-report', label: 'Báo cáo thu nhập năm', path: '/salary/yearly-report' },
        { id: 'fund-report', label: 'Báo cáo quỹ lương năm', path: '/salary/fund-report' },
      ]
    },
    { id: 'revenue', label: 'Thống kê doanh thu', icon: 'stats', path: '/revenue' },
  ],
  [ROLES.RECEPTIONIST]: [
    { id: 'reception', label: 'Tiếp đón & Hàng đợi', icon: 'schedule', path: '/reception' },
    { id: 'schedule', label: 'Quản lý lịch hẹn', icon: 'schedule', path: '/schedule' },
    { id: 'billing', label: 'Thanh toán Viện phí', icon: 'salary', path: '/billing' },
    { id: 'personal-schedule', label: 'Lịch làm việc của tôi', icon: 'schedule', path: '/personal-schedule' },
    { id: 'customers', label: 'Quản lý khách hàng', icon: 'users', path: '/customers' },
  ],
  [ROLES.DOCTOR]: [
    { id: 'dashboard', label: 'Hàng đợi khám', icon: 'stetho', path: '/doctor/dashboard' },
    { id: 'history', label: 'Lịch sử bệnh án', icon: 'history', path: '/doctor/history' },
    {
      id: 'personal-schedule',
      label: 'Lịch trực cá nhân',
      icon: 'schedule',
      path: '/personal-schedule' 
    },
    {
      id: 'income-report',
      label: 'Báo cáo thu nhập', 
      icon: 'salary',
      path: '/doctor/yearly-report'
    }
  ]
};

export const getNavItems = (role) => {
  if (!role) return [];

  const currentRole = role.toLowerCase();

  if (currentRole.includes('admin') || currentRole.includes('quản trị')) {
    return MENU_CONFIG[ROLES.ADMIN];
  }
  if (currentRole.includes('doctor') || currentRole.includes('bác sĩ')) {
    return MENU_CONFIG[ROLES.DOCTOR];
  }
  if (currentRole.includes('receptionist') || currentRole.includes('lễ tân')) {
    return MENU_CONFIG[ROLES.RECEPTIONIST];
  }

  return [];
};

export const DEFAULT_USER = { initials: 'AU', name: 'User', email: 'user@dentalcare.vn' };
