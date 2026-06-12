import { GENDER_OPTIONS } from '../../../constants/staffForm';
import { FormField } from './FormField';
import { FormSection, FormSectionRow } from './FormSection';

/**
 * Personal info card — pure, controlled via props.
 *
 * @param {Object} props
 * @param {{ name: string, birthday: string, gender: string, cccd: string, address: string, phone: string, email: string }} props.values
 * @param {Partial<Record<keyof typeof props.values, string>>} [props.errors]
 * @param {(field: string, value: string) => void} props.onChange
 * @param {(field: string) => void} [props.onBlur]
 * @param {boolean} [props.disabled]
 */
export function PersonalInfoSection({
  values,
  errors = {},
  onChange,
  onBlur,
  disabled = false,
}) {
  const bind = (name) => ({
    value: values[name] ?? '',
    onChange: (e) => onChange(name, e.target.value),
    onBlur: onBlur ? () => onBlur(name) : undefined,
    disabled,
    error: errors[name],
  });

  return (
    <FormSection title="Thông tin cá nhân">
      <FormField
        id="name"
        label="Họ tên"
        required
        placeholder="Nhập họ và tên"
        autoComplete="name"
        {...bind('name')}
      />

      <FormSectionRow>
        <FormField
          id="birthday"
          label="Ngày sinh"
          type="date"
          required
          {...bind('birthday')}
        />
        <FormField
          id="gender"
          label="Giới tính"
          as="select"
          required
          options={GENDER_OPTIONS}
          {...bind('gender')}
        />
      </FormSectionRow>

      <FormField
        id="cccd"
        label="CCCD/CMND"
        required
        placeholder="Nhập số CCCD hoặc CMND"
        autoComplete="off"
        {...bind('cccd')}
      />

      <FormField
        id="address"
        label="Địa chỉ"
        as="textarea"
        rows={4}
        required
        placeholder="Nhập địa chỉ thường trú"
        autoComplete="street-address"
        {...bind('address')}
      />

      <FormField
        id="phone"
        label="Số điện thoại"
        type="tel"
        required
        placeholder="Nhập số điện thoại"
        autoComplete="tel"
        {...bind('phone')}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        required
        placeholder="Nhập địa chỉ email"
        autoComplete="email"
        {...bind('email')}
      />
    </FormSection>
  );
}