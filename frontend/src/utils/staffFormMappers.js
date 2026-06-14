import { EMPTY_STAFF_FORM } from '../constants/staffForm';

export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export function staffToFormValues(staff) {
  if (!staff) return { ...EMPTY_STAFF_FORM };

  return {
    name: staff.name ?? '',
    birthday: formatDateForInput(staff.birthday) ?? '',
    gender: staff.gender ?? '',
    cccd: staff.cccd ?? '',
    address: staff.address ?? '',
    phone: staff.phone ?? '',
    email: staff.email ?? '',
    role: staff.role ?? '',
    workplace: staff.workplace ?? '',


    academicDegree: staff.academicDegree ?? '',
    academicTitle: staff.academicTitle ?? '',
    qualification: staff.qualification ?? '',
    doctorID: staff.doctorID ?? '',

    startDate: formatDateForInput(staff.startDate) ?? formatDateForInput(staff.createdAt) ?? '',
    username: staff.username ?? '',
    password: '',
    confirmPassword: '',
    status: staff.trang_thai ?? 'Chờ kích hoạt',
  };
}