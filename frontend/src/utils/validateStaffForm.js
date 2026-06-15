const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^0[0-9]{9}$/;
const CCCD_RE = /^[0-9]{12}$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,50}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;


const CREATE_REQUIRED = [
  'name',
  'birthday',
  'gender',
  'cccd',
  'address',
  'phone',
  'email',
  'role',
  'startDate',
];

const EDIT_REQUIRED = CREATE_REQUIRED;

export function validateStaffField(field, values, mode = 'create') {
  const v = values[field]?.trim?.() ?? values[field] ?? '';

  switch (field) {
    case 'name': // Đã sửa
      if (!v) return 'Vui lòng nhập họ tên';
      if (v.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
      return '';

    case 'birthday': // Đã sửa
      if (!v) return 'Vui lòng chọn ngày sinh';
      if (new Date(v) > new Date()) return 'Ngày sinh không được ở tương lai';
      return '';

    case 'gender':
      if (!v) return 'Vui lòng chọn giới tính';
      return '';

    case 'cccd':
      if (!v) return 'Vui lòng nhập CCCD/CMND';
      if (!CCCD_RE.test(v)) return 'CCCD/CMND phải gồm đúng 12 chữ số';
      return '';

    case 'address':
      if (!v) return 'Vui lòng nhập địa chỉ';
      return '';

    case 'phone': {
      if (!v) return 'Vui lòng nhập số điện thoại';
      const normalized = v.replace(/\s/g, '');
      if (!PHONE_RE.test(normalized)) return 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0';
      return '';
    }

    case 'email':
      if (!v) return 'Vui lòng nhập email';
      if (!EMAIL_RE.test(v)) return 'Email không hợp lệ';
      return '';

    case 'role':
      if (!v) return 'Vui lòng chọn vai trò';
      return '';

    // Cập nhật bỏ trường 'degree' cũ, khai báo các trường chuyên môn mới
    case 'workplace':
    case 'academicDegree':
    case 'academicTitle':
    case 'qualification':
    case 'doctorID':
      return '';

    case 'startDate':
      if (!v) return 'Vui lòng chọn ngày vào làm';
      return '';

    case 'username':
      if (!v) return 'Vui lòng nhập tên đăng nhập';
      if (!USERNAME_RE.test(v)) {
        return 'Tên đăng nhập gồm 3–50 ký tự chữ, số, dấu chấm, gạch';
      }
      return '';

    case 'password': {
      if (mode === 'edit' && !v) return '';
      if (!v) return 'Vui lòng nhập mật khẩu';
      if (!PASSWORD_RE.test(v)) {
        return 'Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt';
      }
      return '';
    }

    case 'confirmPassword': {
      if (mode === 'edit' && !values.password) return '';
      if (!v) return 'Vui lòng xác nhận mật khẩu';
      if (v !== values.password) return 'Mật khẩu xác nhận không khớp';
      return '';
    }

    case 'status':
      if (!v) return 'Vui lòng chọn trạng thái';
      return '';

    default:
      return '';
  }
}

export function validateStaffForm(values, mode = 'create') {
  const errors = {};
  let valid = true;
  const fields = mode === 'edit' ? EDIT_REQUIRED : CREATE_REQUIRED;

  for (const field of fields) {
    const message = validateStaffField(field, values, mode);
    if (message) {
      errors[field] = message;
      valid = false;
    }
  }

  if (mode === 'edit' && values.password) {
    for (const field of ['password', 'confirmPassword']) {
      const message = validateStaffField(field, values, mode);
      if (message) {
        errors[field] = message;
        valid = false;
      }
    }
  }

  return { valid, errors };
}


export function mapServerErrors(apiFields = {}) {
  const mapped = {};

  if (apiFields.cccd) mapped.cccd = apiFields.cccd;
  if (apiFields.phone) mapped.phone = apiFields.phone;
  if (apiFields.email) mapped.email = apiFields.email;
  if (apiFields.username) mapped.username = apiFields.username;
  return mapped;
}