/** Personal info fields for add/edit staff forms */
export const PERSONAL_FIELDS = {
  fullName: 'fullName',
  dob: 'dob',
  gender: 'gender',
  idNumber: 'idNumber',
  address: 'address',
  phone: 'phone',
  email: 'email',
};

export const JOB_FIELDS = {
  role: 'role',
  workplace: 'workplace',
  degree: 'degree',
  startDate: 'startDate',
};

export const ACCOUNT_FIELDS = {
  username: 'username',
  password: 'password',
  confirmPassword: 'confirmPassword',
  status: 'status',
};

export const EMPTY_PERSONAL_INFO = {
  fullName: '',
  dob: '',
  gender: '',
  idNumber: '',
  address: '',
  phone: '',
  email: '',
};

export const EMPTY_JOB_INFO = {
  role: '',
  workplace: '',
  degree: '',
  startDate: '',
};

export const EMPTY_ACCOUNT_INFO = {
  username: '',
  password: '',
  confirmPassword: '',
  status: 'active',
};

export const EMPTY_STAFF_FORM = {
  ...EMPTY_PERSONAL_INFO,
  ...EMPTY_JOB_INFO,
  ...EMPTY_ACCOUNT_INFO,
};

export const GENDER_OPTIONS = [
  { value: '', label: 'Chọn giới tính' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export const FORM_ROLE_OPTIONS = [
  { value: '', label: 'Chọn vai trò' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'receptionist', label: 'Lễ tân' },
];

export const FORM_STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'locked', label: 'Tạm khóa' },
];

/** Edit form: inactive accounts shown but typically not selectable for new edits */
export const FORM_STATUS_OPTIONS_EDIT = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'locked', label: 'Tạm khóa' },
  { value: 'inactive', label: 'Ngưng hoạt động' },
];
