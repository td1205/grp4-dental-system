import { FORM_STATUS_OPTIONS, FORM_STATUS_OPTIONS_EDIT } from '../../../constants/staffForm';
import { FormField } from '../../common/FormField/FormField';
import { FormSection } from './FormSection';

/**
 * Account information card — pure, controlled via props.
 */
export function AccountInfoSection({
  values,
  errors = {},
  onChange,
  onBlur,
  disabled = false,
  isEdit = false,
}) {
  const bind = (name) => ({
    value: values[name] ?? '',
    onChange: (e) => onChange(name, e.target.value),
    onBlur: onBlur ? () => onBlur(name) : undefined,
    disabled,
    error: errors[name],
  });

  return (
    <FormSection title="Thông tin tài khoản">
      <FormField
        id="username"
        label="Tên đăng nhập"
        required
        placeholder="Nhập tên đăng nhập"
        autoComplete="username"
        {...bind('username')}
        disabled={disabled || isEdit}
      />

      {!isEdit ? (
        <>
          <FormField
            id="password"
            label="Mật khẩu khởi tạo"
            type="password"
            required
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
            {...bind('password')}
          />
          <FormField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            required
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            {...bind('confirmPassword')}
          />
        </>
      ) : (
        <>
          <FormField
            id="password"
            label="Mật khẩu mới (tùy chọn)"
            type="password"
            placeholder="Để trống nếu không đổi"
            autoComplete="new-password"
            {...bind('password')}
          />
          <FormField
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            {...bind('confirmPassword')}
          />
        </>
      )}

      <FormField
        id="status"
        label="Trạng thái"
        as="select"
        required
        options={isEdit ? FORM_STATUS_OPTIONS_EDIT : FORM_STATUS_OPTIONS}
        {...bind('status')}
      />
    </FormSection>
  );
}
