import Icon from '../../common/Icon/Icon'
import Modal from '../../common/Modal/Modal'
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
      <button type="button" className="modal__btn modal__btn--primary" onClick={onSubmit}>
        Lưu thông tin
      </button>
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
        <FormField label="Họ tên" required>
          <input
            type="text"
            className="add-staff-form__input"
            name="fullName"
            value={formValues.fullName}
            onChange={(e) => onFieldChange('fullName', e.target.value)}
            autoFocus
          />
        </FormField>

        <FormField label="Số điện thoại" required>
          <input
            type="tel"
            className="add-staff-form__input"
            name="phone"
            value={formValues.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
          />
        </FormField>

        <FormField label="Chức vụ" required>
          <div className="add-staff-form__select-wrap">
            <select
              className="add-staff-form__select"
              name="position"
              value={formValues.position}
              onChange={(e) => onFieldChange('position', e.target.value)}
            >
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" className="add-staff-form__select-chevron" size={16} />
          </div>
        </FormField>

        <FormField label="Chuyên khoa">
          <div className="add-staff-form__select-wrap">
            <select
              className="add-staff-form__select"
              name="specialty"
              value={formValues.specialty}
              onChange={(e) => onFieldChange('specialty', e.target.value)}
            >
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" className="add-staff-form__select-chevron" size={16} />
          </div>
        </FormField>

        <FormField label="Ngày sinh">
          <input
            type="date"
            className="add-staff-form__input"
            name="dateOfBirth"
            value={formValues.dateOfBirth}
            onChange={(e) => onFieldChange('dateOfBirth', e.target.value)}
          />
        </FormField>

        <FormField label="Nơi công tác">
          <input
            type="text"
            className="add-staff-form__input"
            name="workplace"
            placeholder=""
            value={formValues.workplace}
            onChange={(e) => onFieldChange('workplace', e.target.value)}
          />
        </FormField>
      </form>
    </Modal>
  )
}
