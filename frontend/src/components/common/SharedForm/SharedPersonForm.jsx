import { FormField } from '../FormField/FormField'

export function SharedPersonForm({ formData, onFieldChange, errors = {}, isCustomer = false }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormField label="Họ tên" required>
          <input
            type="text"
            className={`add-staff-form__input ${errors.name ? 'input-error' : ''}`}
            name="name"
            placeholder="Nhập họ tên"
            value={formData.name || ''}
            onChange={(e) => onFieldChange('name', e.target.value)}
          />
          {errors.name && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
        </FormField>

        <FormField label="Ngày sinh">
          <input
            type="date"
            className={`add-staff-form__input ${errors.birthday || errors.dob ? 'input-error' : ''}`}
            name="birthday"
            value={formData.birthday || formData.dob || ''}
            onChange={(e) => {
              onFieldChange('birthday', e.target.value)
              if (isCustomer) onFieldChange('dob', e.target.value)
            }}
          />
          {(errors.birthday || errors.dob) && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.birthday || errors.dob}</span>}
        </FormField>

        {!isCustomer && (
          <FormField label="Giới tính">
            <div className="add-staff-form__radio-group" style={{ display: 'flex', gap: '16px' }}>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={formData.gender === 'Nam'}
                  onChange={(e) => onFieldChange('gender', e.target.value)}
                />
                Nam
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={formData.gender === 'Nữ'}
                  onChange={(e) => onFieldChange('gender', e.target.value)}
                />
                Nữ
              </label>
            </div>
          </FormField>
        )}

        <FormField label="Số điện thoại" required>
          <input
            type="tel"
            className={`add-staff-form__input ${errors.phone ? 'input-error' : ''}`}
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone || ''}
            onChange={(e) => onFieldChange('phone', e.target.value)}
          />
          {errors.phone && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.phone}</span>}
        </FormField>

        <FormField label="Căn cước công dân (CCCD)">
          <input
            type="text"
            className={`add-staff-form__input ${errors.cccd ? 'input-error' : ''}`}
            name="cccd"
            placeholder="Nhập số CCCD"
            value={formData.cccd || ''}
            onChange={(e) => onFieldChange('cccd', e.target.value)}
          />
          {errors.cccd && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.cccd}</span>}
        </FormField>

        <FormField label={isCustomer ? "Email" : "Email cá nhân"} required>
          <input
            type="email"
            className={`add-staff-form__input ${errors.email ? 'input-error' : ''}`}
            name="email"
            placeholder="Nhập email"
            value={formData.email || formData.personalEmail || ''}
            onChange={(e) => {
              onFieldChange('email', e.target.value)
              if (!isCustomer) onFieldChange('personalEmail', e.target.value)
            }}
          />
          {errors.email && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
        </FormField>
      </div>

      <div style={{ marginTop: '16px' }}>
        <FormField label="Địa chỉ thường trú" fullWidth>
          <input
            type="text"
            className={`add-staff-form__input ${errors.address ? 'input-error' : ''}`}
            name="address"
            placeholder="Nhập địa chỉ đầy đủ"
            value={formData.address || ''}
            onChange={(e) => onFieldChange('address', e.target.value)}
          />
          {errors.address && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.address}</span>}
        </FormField>
      </div>
    </>
  )
}
