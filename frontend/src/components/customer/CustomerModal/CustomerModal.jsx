import { useState, useEffect } from 'react'
import { Icon } from '../../common/Icon/Icon'
import { formatDateForInput } from '../../../utils/staffFormMappers'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import { SharedPersonForm } from '../../common/SharedForm/SharedPersonForm'
import { MacDropdown } from '../../common/MacDropdown/MacDropdown'
import './CustomerModal.css'

export function CustomerModal({ isOpen, onClose, onSave, customer = null }) {
  const isEdit = !!customer
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    phone: '',
    cccd: '',
    address: '',
    email: '',
    status: 'active'
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          _id: customer._id,
          id: customer.id,
          name: customer.name || '',
          dob: formatDateForInput(customer.dob || customer.dateOfBirth),
          phone: customer.phone || '',
          cccd: customer.cccd || '',
          address: customer.address || '',
          email: customer.email || '',
          status: customer.status || 'active'
        })
      } else {
        setFormData({
          name: '',
          dob: '',
          phone: '',
          cccd: '',
          address: '',
          email: '',
          status: 'active'
        })
      }
      setErrors({})
    }
  }, [isOpen, customer])

  if (!isOpen) return null

  const validate = () => {
    const tempErrors = {}
    
    // Họ tên
    if (!formData.name?.trim()) tempErrors.name = 'Vui lòng nhập Họ tên'

    // Ngày sinh
    if (!formData.dob) tempErrors.dob = 'Ngày sinh không hợp lệ'
    else {
      const dobDate = new Date(formData.dob)
      if (isNaN(dobDate.getTime())) {
        tempErrors.dob = 'Ngày sinh không hợp lệ'
      } else if (dobDate > new Date()) {
        tempErrors.dob = 'Ngày sinh không hợp lệ'
      }
    }

    // SĐT
    const phoneVal = formData.phone?.trim()?.replace(/\s/g, '') || ''
    if (!phoneVal) {
      tempErrors.phone = 'Vui lòng nhập SĐT'
    } else if (!/^0/.test(phoneVal)) {
      tempErrors.phone = 'SĐT phải bắt đầu bằng 0'
    } else if (!/^0[0-9]{9}$/.test(phoneVal)) {
      tempErrors.phone = 'SĐT không đúng định dạng'
    }

    // CCCD
    const cccdVal = formData.cccd?.trim() || ''
    if (!cccdVal) {
      tempErrors.cccd = 'Vui lòng nhập CCCD'
    } else if (/[^0-9]/.test(cccdVal)) {
      tempErrors.cccd = 'CCCD chỉ chấp nhận số'
    } else if (cccdVal.length !== 12) {
      tempErrors.cccd = 'CCCD không đúng định dạng'
    }

    // Email (optional, but if provided must be valid according to previous code, wait test case says "Email sai định dạng -> Báo lỗi Email không đúng định dạng")
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        tempErrors.email = 'Email không đúng định dạng'
      }
    }

    // Address (If required by test case, I'll keep it)
    if (!formData.address?.trim()) tempErrors.address = 'Vui lòng nhập địa chỉ'

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="customer-modal-overlay">
      <div className="customer-modal">
        <header className="customer-modal__header">
          <h2>{isEdit ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm khách hàng mới'}</h2>
          <button type="button" className="customer-modal__close-btn" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="customer-modal__form">
          <div className="customer-modal__body" style={{ padding: '0 24px' }}>
            {isEdit && (
              <div className="customer-modal__field" style={{ marginBottom: '16px' }}>
                <label htmlFor="cust-id">mã bệnh nhân <span className="required">*</span></label>
                <input
                  id="cust-id"
                  type="text"
                  value={formData.id || ''}
                  disabled={true}
                  title="Không cho phép chỉnh sửa Mã bệnh nhân"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}
                />
              </div>
            )}

            <SharedPersonForm formData={formData} onFieldChange={handleChange} errors={errors} isCustomer={true} />

            {isEdit && (
              <div className="customer-modal__field">
                <label htmlFor="cust-status">trạng thái</label>
                <MacDropdown
                  value={formData.status}
                  onChange={(val) => handleChange('status', val)}
                  options={[
                    { value: "active", label: "Đang hoạt động" },
                    { value: "locked", label: "Tạm khóa" },
                    { value: "inactive", label: "Ngừng hoạt động" }
                  ]}
                />
              </div>
            )}
          </div>

          <footer className="customer-modal__footer">
            <button type="button" className="customer-btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <PrimaryButton type="submit">
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </PrimaryButton>
          </footer>
        </form>
      </div>
    </div>
  )
}
