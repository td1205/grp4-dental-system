import { useState, useEffect } from 'react';
import { Icon } from '../../common/Icon/Icon'
import { Modal } from '../../common/Modal/Modal'
import { Button } from '../../ui/Button/Button'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import { FormField } from '../../common/FormField/FormField'
import { MacDropdown } from '../../common/MacDropdown/MacDropdown'
import { ROLES } from '../../../constants/roles'
import { validateStaffForm } from '../../../utils/validateStaffForm'
import './AddStaffModal.css'


const ROLE_OPTIONS = [
  { value: ROLES.DOCTOR, label: 'Bác sĩ' },
  { value: ROLES.RECEPTIONIST, label: 'Lễ tân' },
  { value: ROLES.ADMIN, label: 'Quản trị viên' }
]

const SPECIALTY_OPTIONS = [
  { value: '', label: 'Chọn...' },
  { value: 'Implant', label: 'Implant' },
  { value: 'Orthodontics', label: 'Orthodontics' },
  { value: 'Lễ tân', label: 'Lễ tân' },
  { value: 'General', label: 'Tổng quát' },
]



export function AddStaffModal({
  isOpen,
  formValues,
  onFieldChange,
  onClose,
  onSubmit,
  isEdit = false,
}) {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) setErrors({});
  }, [isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const { valid, errors: newErrors } = validateStaffForm(formValues, isEdit ? 'edit' : 'create');
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit();
  };

  const handleFieldChangeWrapper = (field, value) => {
    onFieldChange(field, value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Hủy
      </Button>
      <PrimaryButton onClick={handleSubmit}>
        {isEdit ? 'Cập nhật' : 'Thêm mới nhân viên'}
      </PrimaryButton>
    </>
  )

  // 🚀 LOGIC THÔNG MINH CHO CHỨC VỤ
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    handleFieldChangeWrapper('role', selectedRole);

    // Tự động gán phòng ban
    if (selectedRole === ROLES.RECEPTIONIST) {
      handleFieldChangeWrapper('department', 'Quầy Lễ Tân');
    } else if (formValues.department === 'Quầy Lễ Tân') {
      handleFieldChangeWrapper('department', '');
    }
  };

  const isDoctor = formValues.role === ROLES.DOCTOR;

  return (
    <Modal
      isOpen={isOpen}
      title={isEdit ? "Cập nhật thông tin nhân viên" : "Thêm nhân viên mới"}
      subtitle={isEdit ? "Chỉnh sửa thông tin nhân viên dưới đây" : "Điền thông tin nhân viên mới vào biểu mẫu dưới đây"}
      onClose={onClose}
      footer={footer}
    >
      <form
        className="add-staff-form"
        onSubmit={handleSubmit}
      >
        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Thông tin định danh</legend>
          <div className="add-staff-form__grid">
            <FormField label="Họ tên" required error={errors.name}>
              <input
                type="text"
                className="add-staff-form__input"
                name="name"
                placeholder="Nhập họ tên"
                value={formValues.name || ''}
                onChange={(e) => handleFieldChangeWrapper('name', e.target.value)}
              />
            </FormField>

            <FormField label="Ngày sinh" required error={errors.birthday}>
              <input
                type="text"
                className="add-staff-form__input"
                name="birthday"
                placeholder="dd/mm/yyyy"
                value={
                  (formValues.birthday && formValues.birthday.includes('-'))
                    ? formValues.birthday.split('-').reverse().join('/')
                    : (formValues.birthday || '')
                }
                onChange={(e) => {
                  const inputType = e.nativeEvent.inputType;
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 8) val = val.slice(0, 8);
                  
                  let formatted = val;
                  if (val.length >= 5) {
                    formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                  } else if (val.length >= 3) {
                    formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
                    if (val.length === 4 && inputType !== 'deleteContentBackward') {
                      formatted += '/';
                    }
                  } else if (val.length === 2 && inputType !== 'deleteContentBackward') {
                    formatted += '/';
                  }

                  if (formatted.length === 10) {
                    const [d, m, y] = formatted.split('/');
                    const isoDate = `${y}-${m}-${d}`;
                    handleFieldChangeWrapper('birthday', isoDate);
                  } else {
                    handleFieldChangeWrapper('birthday', formatted);
                  }
                }}
                maxLength={10}
              />
            </FormField>

            <FormField label="Giới tính" required error={errors.gender}>
              <div className="add-staff-form__radio-group" style={{ display: 'flex', gap: '16px' }}>
                {['Nam', 'Nữ', 'Khác'].map(option => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="checkbox"
                      name="gender"
                      value={option}
                      checked={formValues.gender === option}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFieldChangeWrapper('gender', option);
                        } else {
                          handleFieldChangeWrapper('gender', '');
                        }
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Căn cước công dân (CCCD)" required error={errors.cccd}>
              <input
                type="text"
                className="add-staff-form__input"
                name="cccd"
                placeholder="Nhập số CCCD"
                value={formValues.cccd || ''}
                onChange={(e) => handleFieldChangeWrapper('cccd', e.target.value)}
              />
            </FormField>

            <FormField label="Địa chỉ thường trú" required fullWidth error={errors.address}>
              <input
                type="text"
                className="add-staff-form__input"
                name="address"
                placeholder="Nhập địa chỉ đầy đủ"
                value={formValues.address || ''}
                onChange={(e) => handleFieldChangeWrapper('address', e.target.value)}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Thông tin liên hệ</legend>
          <div className="add-staff-form__grid">
            <FormField label="Số điện thoại" required error={errors.phone}>
              <input
                type="tel"
                className="add-staff-form__input"
                name="phone"
                placeholder="Nhập số điện thoại"
                value={formValues.phone || ''}
                onChange={(e) => handleFieldChangeWrapper('phone', e.target.value)}
              />
            </FormField>

            <FormField label="Email cá nhân" required error={errors.email}>
              <input
                type="email"
                className="add-staff-form__input"
                name="email"
                placeholder="Nhập email cá nhân"
                value={formValues.email || ''}
                onChange={(e) => handleFieldChangeWrapper('email', e.target.value)}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Cấu hình công việc</legend>
          <div className="add-staff-form__grid">
            <FormField label="Chức vụ" required error={errors.role}>
              <div className="add-staff-form__select-wrap" style={{ display: 'block', height: 'auto' }}>
                <MacDropdown
                  value={formValues.role || ''}
                  onChange={(val) => handleRoleChange({ target: { value: val }})}
                  placeholder="Chọn chức vụ"
                  options={[
                    { value: "", label: "Chọn chức vụ" },
                    ...ROLE_OPTIONS
                  ]}
                />
              </div>
            </FormField>

            <FormField label="Phòng ban" error={errors.department}>
              <div className="add-staff-form__select-wrap" style={{ display: 'block', height: 'auto' }}>
                <MacDropdown
                  value={formValues.department || ''}
                  onChange={(val) => handleFieldChangeWrapper('department', val)}
                  placeholder="Chọn phòng ban"
                  options={[
                    { value: "", label: "Chọn phòng ban" },
                    { value: "Khoa Khám Bệnh", label: "Khoa Khám Bệnh" },
                    { value: "Khoa Phục Hình", label: "Khoa Phục Hình" },
                    { value: "Quầy Lễ Tân", label: "Quầy Lễ Tân" },
                    { value: "Phòng Hành Chính", label: "Phòng Hành Chính" }
                  ]}
                />
              </div>
            </FormField>

            <FormField label="Ngày bắt đầu làm việc" required error={errors.startDate}>
              <input
                type="date"
                className="add-staff-form__input"
                name="startDate"
                value={formValues.startDate || ''}
                onChange={(e) => handleFieldChangeWrapper('startDate', e.target.value)}
              />
            </FormField>

            {/* 🚀 CHUYÊN KHOA VÀ THÔNG TIN BẰNG CẤP CHỈ HIỆN KHI LÀ BÁC SĨ */}
            {isDoctor && (
              <>
                <FormField label="Chuyên khoa" required error={errors.specialty}>
                  <div className="add-staff-form__select-wrap" style={{ display: 'block', height: 'auto' }}>
                    <MacDropdown
                      value={formValues.specialty || ''}
                      onChange={(val) => handleFieldChangeWrapper('specialty', val)}
                      placeholder="Chọn chuyên khoa"
                      options={[
                        { value: "", label: "Chọn chuyên khoa" },
                        ...SPECIALTY_OPTIONS.filter(opt => opt.value !== '')
                      ]}
                    />
                  </div>
                </FormField>

                <FormField label="Bằng cấp (Bác sĩ)" error={errors.academicDegree}>
                  <input
                    type="text"
                    className="add-staff-form__input"
                    name="academicDegree"
                    placeholder="VD: Thạc sĩ, Tiến sĩ..."
                    value={formValues.academicDegree || ''}
                    onChange={(e) => handleFieldChangeWrapper('academicDegree', e.target.value)}
                  />
                </FormField>

                <FormField label="Học hàm" error={errors.academicTitle}>
                  <input
                    type="text"
                    className="add-staff-form__input"
                    name="academicTitle"
                    placeholder="VD: Bác sĩ CK I, CK II..."
                    value={formValues.academicTitle || ''}
                    onChange={(e) => handleFieldChangeWrapper('academicTitle', e.target.value)}
                  />
                </FormField>

                <FormField label="Chứng chỉ chuyên môn" error={errors.qualification}>
                  <input
                    type="text"
                    className="add-staff-form__input"
                    name="qualification"
                    placeholder="Mã chứng chỉ hành nghề"
                    value={formValues.qualification || ''}
                    onChange={(e) => handleFieldChangeWrapper('qualification', e.target.value)}
                  />
                </FormField>



              </>
            )}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}