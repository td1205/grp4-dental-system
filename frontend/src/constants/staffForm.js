
export const PERSONAL_FIELDS = {
  name: 'name',
  birthday: 'birthday',
  gender: 'gender',
  cccd: 'cccd',
  address: 'address',
  phone: 'phone',
  email: 'email',
};

export const JOB_FIELDS = {
  role: 'role',
  workplace: 'workplace',
  startDate: 'startDate',
  academicDegree: 'academicDegree',
  academicTitle: 'academicTitle',
  qualification: 'qualification',
  doctorID: 'doctorID',
};

export const ACCOUNT_FIELDS = {
  username: 'username',
  password: 'password',
  confirmPassword: 'confirmPassword',
  status: 'trang_thai',
};
export const EMPTY_PERSONAL_INFO = {
  name: '',
  birthday: '',
  gender: '',
  cccd: '',
  address: '',
  phone: '',
  email: '',
};
export const EMPTY_JOB_INFO = {
  role: '',
  workplace: '',
  startDate: '',
  academicDegree: '',
  academicTitle: '',
  qualification: '',
  doctorID: '',
};

export const EMPTY_ACCOUNT_INFO = {
  username: '',
  password: '',
  confirmPassword: '',
  status: 'Chờ kích hoạt',
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
  { value: 'Admin', label: 'Quản trị viên' },
  { value: 'Doctor', label: 'Bác sĩ' },
  { value: 'Receptionist', label: 'Lễ tân' },
];

export const FORM_STATUS_OPTIONS = [
  { value: 'Chờ kích hoạt', label: 'Chờ kích hoạt' },
  { value: 'Đang hoạt động', label: 'Hoạt động' },
  { value: 'Đình chỉ', label: 'Tạm khóa' },
];
/** Edit form: inactive accounts shown but typically not selectable for new edits */
export const FORM_STATUS_OPTIONS_EDIT = [
  { value: 'Chờ kích hoạt', label: 'Chờ kích hoạt' },
  { value: 'Đang hoạt động', label: 'Hoạt động' },
  { value: 'Đình chỉ', label: 'Tạm khóa' },
  { value: 'Ngừng hoạt động', label: 'Ngưng hoạt động' },
];