export const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'receptionist', label: 'Lễ tân' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'locked', label: 'Tạm khóa' },
  { value: 'inactive', label: 'Ngưng hoạt động' },
];

export const ROLE_LABELS = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  receptionist: 'Lễ tân',
};

export const STATUS_LABELS = {
  pending: 'Chờ kích hoạt',
  active: 'Hoạt động',
  locked: 'Tạm khóa',
  inactive: 'Ngưng hoạt động',
};

export function formatCreatedDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}
