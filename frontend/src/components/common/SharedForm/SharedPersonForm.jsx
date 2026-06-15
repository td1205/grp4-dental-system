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
            type="text"
            className={`add-staff-form__input ${errors.birthday || errors.dob ? 'input-error' : ''}`}
            name="birthday"
            placeholder="dd/mm/yyyy"
            value={
              (formData.birthday && formData.birthday.includes('-'))
                ? formData.birthday.split('-').reverse().join('/')
                : (formData.dob && formData.dob.includes('-') ? formData.dob.split('-').reverse().join('/') : (formData.birthday || formData.dob || ''))
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
                onFieldChange('birthday', isoDate);
                if (isCustomer) onFieldChange('dob', isoDate);
              } else {
                onFieldChange('birthday', formatted);
                if (isCustomer) onFieldChange('dob', formatted);
              }
            }}
            maxLength={10}
          />
          {(errors.birthday || errors.dob) && <span className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.birthday || errors.dob}</span>}
        </FormField>

        {!isCustomer && (
          <FormField label="Giới tính">
            <div className="add-staff-form__radio-group" style={{ display: 'flex', gap: '16px' }}>
              {['Nam', 'Nữ', 'Khác'].map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFieldChange('gender', option);
                      } else {
                        onFieldChange('gender', '');
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
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
