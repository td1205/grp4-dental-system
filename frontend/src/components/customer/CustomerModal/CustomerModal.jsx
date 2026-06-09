import { useState, useEffect } from 'react'
import { Icon } from '../../common/Icon/Icon'
import { formatDateForInput } from '../../../utils/staffFormMappers'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
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
    if (!formData.name.trim()) tempErrors.name = 'Vui lòng nhập họ tên'
    else if (formData.name.trim().length < 2) tempErrors.name = 'Họ tên phải từ 2 ký tự trở lên'

    if (!formData.dob) tempErrors.dob = 'Vui lòng chọn ngày sinh'
    else {
      const dobDate = new Date(formData.dob)
      if (dobDate > new Date()) tempErrors.dob = 'Ngày sinh không thể ở tương lai'
    }

    const phoneRegex = /^(0|\+84)[0-9]{8,10}$/
    if (!formData.phone.trim()) tempErrors.phone = 'Vui lòng nhập số điện thoại'
    else if (!phoneRegex.test(formData.phone.trim().replace(/\s/g, ''))) {
      tempErrors.phone = 'Số điện thoại không hợp lệ (gồm 9-11 chữ số)'
    }

    const cccdRegex = /^[0-9]{9,12}$/
    if (!formData.cccd.trim()) tempErrors.cccd = 'Vui lòng nhập số CCCD/CMND'
    else if (!cccdRegex.test(formData.cccd.trim())) {
      tempErrors.cccd = 'Số CCCD/CMND không hợp lệ (gồm 9-12 chữ số)'
    }

    if (!formData.address.trim()) tempErrors.address = 'Vui lòng nhập địa chỉ'

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        tempErrors.email = 'Địa chỉ email không hợp lệ'
      }
    }

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
          <div className="customer-modal__body">
            <div className="customer-modal__field">
              <label htmlFor="cust-name">họ và tên <span className="required">*</span></label>
              <input
                id="cust-name"
                type="text"
                placeholder="Nhập họ tên khách hàng"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="customer-modal__row">
              <div className="customer-modal__field">
                <label htmlFor="cust-dob">ngày sinh <span className="required">*</span></label>
                <input
                  id="cust-dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className={errors.dob ? 'input-error' : ''}
                />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>

              <div className="customer-modal__field">
                <label htmlFor="cust-phone">số điện thoại <span className="required">*</span></label>
                <input
                  id="cust-phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            {isEdit && (
              <div className="customer-modal__field">
                <label htmlFor="cust-id">mã bệnh nhân <span className="required">*</span></label>
                <input
                  id="cust-id"
                  type="text"
                  value={formData.id}
                  disabled={true}
                  title="Không cho phép chỉnh sửa Mã bệnh nhân"
                />
              </div>
            )}

            <div className="customer-modal__field">
              <label htmlFor="cust-cccd">số CCCD <span className="required">*</span></label>
              <input
                id="cust-cccd"
                type="text"
                placeholder="Nhập số căn cước công dân"
                value={formData.cccd}
                onChange={(e) => handleChange('cccd', e.target.value)}
                disabled={isEdit}
                className={errors.cccd ? 'input-error' : ''}
                title={isEdit ? 'Không cho phép chỉnh sửa Số CCCD' : ''}
              />
              {errors.cccd && <span className="error-message">{errors.cccd}</span>}
            </div>

            <div className="customer-modal__field">
              <label htmlFor="cust-email">email</label>
              <input
                id="cust-email"
                type="email"
                placeholder="Ví dụ: benhnhan@gmail.com (không bắt buộc)"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="customer-modal__field">
              <label htmlFor="cust-address">địa chỉ thường trú <span className="required">*</span></label>
              <textarea
                id="cust-address"
                placeholder="Nhập địa chỉ của khách hàng"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className={errors.address ? 'input-error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            {isEdit && (
              <div className="customer-modal__field">
                <label htmlFor="cust-status">trạng thái</label>
                <select
                  id="cust-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="locked">Tạm khóa</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
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
