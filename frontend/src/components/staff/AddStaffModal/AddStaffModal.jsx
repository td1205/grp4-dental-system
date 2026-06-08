import Icon from '../../common/Icon/Icon'
import Modal from '../../common/Modal/Modal'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import './AddStaffModal.css'

const POSITION_OPTIONS = [
  { value: '', label: 'Chọn...' },
  { value: 'doctor', label: 'Bác sĩ' },
  { value: 'receptionist', label: 'Lễ tân' },
  { value: 'nurse', label: 'Y tá' },
]

const SPECIALTY_OPTIONS = [
  { value: '', label: 'Chọn...' },
  { value: 'Implant', label: 'Implant' },
  { value: 'Orthodontics', label: 'Orthodontics' },
  { value: 'Lễ tân', label: 'Lễ tân' },
  { value: 'General', label: 'Tổng quát' },
]

function FormField({ label, required, children, fullWidth = false }) {
  return (
    <div className={`add-staff-form__field${fullWidth ? ' add-staff-form__field--full' : ''}`}>
      <label className="add-staff-form__label">
        {label}
        {required ? <span className="add-staff-form__required"> *</span> : null}
      </label>
      {children}
    </div>
  )
}

export default function AddStaffModal({
  isOpen,
  formValues,
  onFieldChange,
  onClose,
  onSubmit,
}) {
  const footer = (
    <>
      <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
        Hủy
      </button>
      <PrimaryButton onClick={onSubmit}>
        Lưu thông tin
      </PrimaryButton>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      title="Thêm nhân viên mới"
      subtitle="Điền thông tin nhân viên mới vào biểu mẫu dưới đây"
      onClose={onClose}
      footer={footer}
    >
      <form
        className="add-staff-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Thông tin định danh</legend>
          <div className="add-staff-form__grid">
            <FormField label="Họ tên" required>
              <input
                type="text"
                className="add-staff-form__input"
                name="fullName"
                value={formValues.fullName || ''}
                onChange={(e) => onFieldChange('fullName', e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Ngày sinh">
              <input
                type="date"
                className="add-staff-form__input"
                name="dateOfBirth"
                value={formValues.dateOfBirth || ''}
                onChange={(e) => onFieldChange('dateOfBirth', e.target.value)}
              />
            </FormField>

            <FormField label="Giới tính">
              <div className="add-staff-form__radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formValues.gender === 'male'}
                    onChange={(e) => onFieldChange('gender', e.target.value)}
                  />
                  Nam
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formValues.gender === 'female'}
                    onChange={(e) => onFieldChange('gender', e.target.value)}
                  />
                  Nữ
                </label>
              </div>
            </FormField>

            <FormField label="Căn cước công dân (CCCD)">
              <input
                type="text"
                className="add-staff-form__input"
                name="idNumber"
                value={formValues.idNumber || ''}
                onChange={(e) => onFieldChange('idNumber', e.target.value)}
              />
            </FormField>

            <FormField label="Địa chỉ thường trú" fullWidth>
              <input
                type="text"
                className="add-staff-form__input"
                name="address"
                value={formValues.address || ''}
                onChange={(e) => onFieldChange('address', e.target.value)}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Thông tin liên hệ</legend>
          <div className="add-staff-form__grid">
            <FormField label="Số điện thoại" required>
              <input
                type="tel"
                className="add-staff-form__input"
                name="phone"
                value={formValues.phone || ''}
                onChange={(e) => onFieldChange('phone', e.target.value)}
              />
            </FormField>

            <FormField label="Email cá nhân" required>
              <input
                type="email"
                className="add-staff-form__input"
                name="personalEmail"
                value={formValues.personalEmail || ''}
                onChange={(e) => onFieldChange('personalEmail', e.target.value)}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Cấu hình công việc</legend>
          <div className="add-staff-form__grid">
            <FormField label="Chức vụ" required>
              <div className="add-staff-form__select-wrap">
                <select
                  className="add-staff-form__select"
                  name="position"
                  value={formValues.position || ''}
                  onChange={(e) => onFieldChange('position', e.target.value)}
                >
                  <option value="" disabled>Chọn chức vụ</option>
                  {POSITION_OPTIONS.filter(opt => opt.value !== '').map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Icon name="chevron-down" className="add-staff-form__select-chevron" size={16} />
              </div>
            </FormField>

            {formValues.position === 'doctor' && (
              <FormField label="Chuyên khoa" required>
                <div className="add-staff-form__select-wrap">
                  <select
                    className="add-staff-form__select"
                    name="specialty"
                    value={formValues.specialty || ''}
                    onChange={(e) => onFieldChange('specialty', e.target.value)}
                  >
                    <option value="" disabled>Chọn chuyên khoa</option>
                    {SPECIALTY_OPTIONS.filter(opt => opt.value !== '').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" className="add-staff-form__select-chevron" size={16} />
                </div>
              </FormField>
            )}

            <FormField label="Phòng ban">
              <div className="add-staff-form__select-wrap">
                <select
                  className="add-staff-form__select"
                  name="department"
                  value={formValues.department || ''}
                  onChange={(e) => onFieldChange('department', e.target.value)}
                >
                  <option value="" disabled>Chọn phòng ban</option>
                  <option value="Khoa Khám Bệnh">Khoa Khám Bệnh</option>
                  <option value="Khoa Phục Hình">Khoa Phục Hình</option>
                  <option value="Quầy Lễ Tân">Quầy Lễ Tân</option>
                  <option value="Phòng Hành Chính">Phòng Hành Chính</option>
                </select>
                <Icon name="chevron-down" className="add-staff-form__select-chevron" size={16} />
              </div>
            </FormField>

            <FormField label="Ngày bắt đầu làm việc" required>
              <input
                type="date"
                className="add-staff-form__input"
                name="startDate"
                value={formValues.startDate || ''}
                onChange={(e) => onFieldChange('startDate', e.target.value)}
              />
            </FormField>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
