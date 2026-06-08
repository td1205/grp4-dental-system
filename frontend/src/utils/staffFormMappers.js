import { EMPTY_STAFF_FORM } from '../constants/staffForm';

export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export function staffToFormValues(staff) {
  if (!staff) return { ...EMPTY_STAFF_FORM };

  return {
    fullName: staff.fullName ?? '',
    dob: formatDateForInput(staff.dob) ?? '',
    gender: staff.gender ?? '',
    idNumber: staff.idNumber ?? '',
    address: staff.address ?? '',
    phone: staff.phone ?? '',
    email: staff.email ?? '',
    role: staff.role ?? '',
    workplace: staff.workplace ?? '',
    degree: staff.degree ?? '',
    startDate: formatDateForInput(staff.startDate) ?? formatDateForInput(staff.createdAt) ?? '',
    username: staff.username ?? '',
    password: '',
    confirmPassword: '',
    status: staff.status ?? 'active',
  };
}
