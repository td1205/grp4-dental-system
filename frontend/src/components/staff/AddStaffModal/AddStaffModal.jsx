import { Icon } from '../../common/Icon/Icon'
import { Modal } from '../../common/Modal/Modal'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import { FormField } from '../../common/FormField/FormField'
import { SharedPersonForm } from '../../common/SharedForm/SharedPersonForm'
import { ROLES } from '../../../constants/roles'
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

  // 🚀 LOGIC THÔNG MINH CHO CHỨC VỤ
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    onFieldChange('role', selectedRole);

    // Tự động gán phòng ban
    if (selectedRole === ROLES.RECEPTIONIST) {
      onFieldChange('department', 'Quầy Lễ Tân');
    } else if (formValues.department === 'Quầy Lễ Tân') {
      onFieldChange('department', '');
    }
  };

  const isDoctor = formValues.role === ROLES.DOCTOR;

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
          <legend className="add-staff-form__section-title">Thông tin định danh & Liên hệ</legend>
          <SharedPersonForm formData={formValues} onFieldChange={onFieldChange} />
        </fieldset>

        <fieldset className="add-staff-form__section">
          <legend className="add-staff-form__section-title">Cấu hình công việc</legend>
          <div className="add-staff-form__grid">
            <FormField label="Chức vụ" required>
              <div className="add-staff-form__select-wrap">
                <select
                  className="add-staff-form__select"
                  name="role" // Đã sửa
                  value={formValues.role || ''}
                  onChange={handleRoleChange}
                >
                  <option value="" disabled>Chọn chức vụ</option>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Icon name="chevron-down" className="add-staff-form__select-chevron" size={16} />
              </div>
            </FormField>

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

            {/* 🚀 CHUYÊN KHOA VÀ THÔNG TIN BẰNG CẤP CHỈ HIỆN KHI LÀ BÁC SĨ */}
            {isDoctor && (
              <>
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

                <FormField label="Bằng cấp (Bác sĩ)">
                  <input
                    type="text"
                    className="add-staff-form__input"
                    name="academicDegree"
                    placeholder="VD: Thạc sĩ, Tiến sĩ..."
                    value={formValues.academicDegree || ''}
                    onChange={(e) => onFieldChange('academicDegree', e.target.value)}
                  />
                </FormField>

                <FormField label="Học hàm">
                  <input
                    type="text"
                    className="add-staff-form__input"
                    name="academicTitle"
                    placeholder="VD: Bác sĩ CK I, CK II..."
                    value={formValues.academicTitle || ''}
                    onChange={(e) => onFieldChange('academicTitle', e.target.value)}
                  />
                </FormField>

                <FormField label="Chứng chỉ chuyên môn">
                  <input
                    type="text"
                    className="add-staff-form__input"
                    name="qualification"
                    placeholder="Mã chứng chỉ hành nghề"
                    value={formValues.qualification || ''}
                    onChange={(e) => onFieldChange('qualification', e.target.value)}
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