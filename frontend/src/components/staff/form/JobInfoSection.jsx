import { FORM_ROLE_OPTIONS } from '../../../constants/staffForm';
import { FormField } from './FormField';
import { FormSection, FormSectionRow } from './FormSection';

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


  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;

    // 1. Cập nhật role như bình thường
    onChange('role', selectedRole);

    // 2. Tự động gán phòng ban nếu chọn Lễ tân
    if (selectedRole === 'Receptionist') {
      onChange('department', 'Phòng Lễ tân');
    }
    // Nếu đổi từ Lễ tân sang role khác, có thể tự động xóa chữ "Phòng Lễ tân" đi để họ nhập cái khác
    else if (values.department === 'Phòng Lễ tân') {
      onChange('department', '');
    }
  };

  const isDoctor = values.role === 'Doctor';

  return (
    <FormSection title="Cấu hình công việc">
      {/* Hàng 1: Chức vụ & Phòng ban */}
      <FormSectionRow>
        <FormField
          id="role"
          label="Chức vụ"
          as="select"
          required
          options={FORM_ROLE_OPTIONS}
          {...bind('role')}
          onChange={handleRoleChange} // 🚀 Ghi đè sự kiện onChange mặc định
        />
        <FormField
          id="department"
          label="Phòng ban"
          placeholder="VD: Khoa Khám Bệnh..."
          {...bind('department')}
        />
      </FormSectionRow>

      {/* Hàng 2: Ngày bắt đầu & Chuyên khoa */}
      <FormSectionRow>
        <FormField
          id="startDate"
          label="Ngày bắt đầu làm việc"
          type="date"
          required
          {...bind('startDate')}
        />
        {/* Chuyên khoa chỉ hiển thị nếu là Bác sĩ */}
        {isDoctor ? (
          <FormField
            id="specialty"
            label="Chuyên khoa"
            required
            placeholder="Nhập hoặc chọn chuyên khoa"
            {...bind('specialty')}
          />
        ) : (
          <div style={{ flex: 1 }}></div>
        )}
      </FormSectionRow>


      {isDoctor && (
        <>
          <hr style={{ margin: '16px 0', borderColor: '#f0f0f0', borderStyle: 'solid' }} />

          <FormSectionRow>
            <FormField
              id="academicDegree"
              label="Bằng cấp (Bác sĩ)"
              placeholder="VD: Thạc sĩ, Tiến sĩ..."
              {...bind('academicDegree')}
            />
            <FormField
              id="academicTitle"
              label="Học hàm"
              placeholder="VD: Bác sĩ CK I, CK II..."
              {...bind('academicTitle')}
            />
          </FormSectionRow>

          <FormSectionRow>
            <FormField
              id="qualification"
              label="Chứng chỉ chuyên môn"
              placeholder="Nhập mã chứng chỉ..."
              {...bind('qualification')}
            />

          </FormSectionRow>
        </>
      )}
    </FormSection>
  );
}