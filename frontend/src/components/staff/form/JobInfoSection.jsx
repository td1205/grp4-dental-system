import { FORM_ROLE_OPTIONS } from '../../../constants/staffForm';
import { FormField } from './FormField';
import { FormSection } from './FormSection';

/**
 * Job information card — pure, controlled via props.
 */
export function JobInfoSection({
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
    <FormSection title="Thông tin công việc">
      <FormField
        id="role"
        label="Vai trò"
        as="select"
        required
        options={FORM_ROLE_OPTIONS}
        {...bind('role')}
      />

      <FormField
        id="workplace"
        label="Nơi công tác chính thức"
        placeholder="Nhập nơi công tác"
        {...bind('workplace')}
      />

      <FormField
        id="degree"
        label="Bằng cấp / Học hàm học vị"
        placeholder="VD: Bác sĩ Răng Hàm Mặt..."
        {...bind('degree')}
      />

      <FormField
        id="startDate"
        label="Ngày vào làm"
        type="date"
        required
        {...bind('startDate')}
      />
    </FormSection>
  );
}
