import { EMPTY_STAFF_FORM } from '../constants/staffForm';

export function staffToFormValues(staff) {
  if (!staff) return { ...EMPTY_STAFF_FORM };

  return {
    fullName: staff.fullName ?? '',
    dob: staff.dob ?? '',
    gender: staff.gender ?? '',
    idNumber: staff.idNumber ?? '',
    address: staff.address ?? '',
    phone: staff.phone ?? '',
    email: staff.email ?? '',
    role: staff.role ?? '',
    workplace: staff.workplace ?? '',
    degree: staff.degree ?? '',
    startDate: staff.startDate ?? staff.createdAt ?? '',
    username: staff.username ?? '',
    password: '',
    confirmPassword: '',
    status: staff.status ?? 'active',
  };
}
