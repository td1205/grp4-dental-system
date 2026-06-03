import Icon from '../../common/Icon/Icon'
import Badge from '../../common/Badge/Badge'
import './StaffCard.css'

const STATUS_VARIANT = {
  active: 'success',
  pending: 'warning',
}

const SPECIALTY_VARIANT = {
  Implant: 'implant',
  Orthodontics: 'orthodontics',
  'Lễ tân': 'reception',
}

export default function StaffCard({ staff, onResendMail }) {
  const statusVariant = STATUS_VARIANT[staff.status] ?? 'success'
  const specialtyVariant = SPECIALTY_VARIANT[staff.specialty] ?? 'reception'
  const statusLabel = staff.status === 'active' ? 'Hoạt động' : 'Chờ kích hoạt'

  return (
    <article className="staff-card">
      <header className="staff-card__header">
        <div className="staff-card__avatar" aria-hidden="true">
          {staff.initials}
        </div>
        <div className="staff-card__identity">
          <h3 className="staff-card__name">{staff.name}</h3>
          <div className="staff-card__specialty">
            <Badge label={staff.specialty} variant={specialtyVariant} />
          </div>
        </div>
      </header>

      <div className="staff-card__body">
        <div className="staff-card__info-row">
          <span className="staff-card__label">ID</span>
          <span className="staff-card__value">{staff.id}</span>
        </div>
        <div className="staff-card__info-row">
          <span className="staff-card__label">Email</span>
          <span className="staff-card__value">{staff.email}</span>
        </div>
        <div className="staff-card__info-row">
          <span className="staff-card__label">SĐT</span>
          <span className="staff-card__value">{staff.phone}</span>
        </div>
      </div>

      <footer className="staff-card__footer">
        <Badge label={statusLabel} variant={statusVariant} />
        {staff.status === 'pending' && onResendMail ? (
          <button
            type="button"
            className="staff-card__resend"
            onClick={onResendMail}
          >
            <Icon name="mail" className="staff-card__resend-icon" size={16} />
            Gửi lại email
          </button>
        ) : null}
      </footer>
    </article>
  )
}
