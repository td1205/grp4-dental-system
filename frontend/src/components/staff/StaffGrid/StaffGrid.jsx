import { UniversalDataCard } from '../../common/UniversalDataCard/UniversalDataCard'
import { Badge } from '../../common/Badge/Badge'
import { Icon } from '../../common/Icon/Icon'
import './StaffGrid.css'

const STATUS_VARIANT = {
  active: 'success',
  pending: 'warning',
  locked: 'error',
}

const SPECIALTY_VARIANT = {
  Implant: 'implant',
  Orthodontics: 'orthodontics',
  'Lễ tân': 'reception',
}

export function StaffGrid({ staffList = [], onResendMail }) {
  if (!staffList || staffList?.length === 0) {
    return (
      <div className="staff-grid">
        <p className="staff-grid__empty">Không tìm thấy nhân viên phù hợp.</p>
      </div>
    )
  }

  return (
    <div className="staff-grid">
      {staffList?.map((staff) => {
        const statusVariant = STATUS_VARIANT[staff.status] ?? 'success'
        const specialtyVariant = SPECIALTY_VARIANT[staff.specialty] ?? 'reception'
        const statusLabel = staff.status === 'active' ? 'Hoạt động' : staff.status === 'locked' ? 'Bị khóa' : 'Chờ kích hoạt'

        const actions = (
          <>
            <div style={{ marginRight: 'auto' }}>
              <Badge label={statusLabel} variant={statusVariant} />
            </div>
            {staff.status === 'pending' && onResendMail ? (
              <button
                type="button"
                className="staff-card__resend"
                onClick={() => onResendMail(staff)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-cta, #0D8A72)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <Icon name="mail" size={16} />
                Gửi lại email
              </button>
            ) : null}
          </>
        );

        const fullName = staff.name || staff.fullName || '';
        const words = fullName.trim().split(' ');
        const computedInitials = words.length > 1 
          ? words[0][0] + words[words.length - 1][0] 
          : (words[0] ? words[0].substring(0, 2) : 'NV');

        return (
          <UniversalDataCard
            key={staff.id}
            avatarText={computedInitials.toUpperCase()}
            title={fullName}
            subtitle={staff.id}
            badge={<Badge label={staff.specialty} variant={specialtyVariant} />}
            infoLines={[
              { label: 'Email', value: staff.email || staff.personalEmail },
              { label: 'SĐT', value: staff.phone }
            ]}
            actions={actions}
          />
        );
      })}
    </div>
  )
}
