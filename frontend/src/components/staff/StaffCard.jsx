import { ROLE_LABELS, STATUS_LABELS } from '../../constants/staff';
import './StaffCard.css';

function getInitials(name) {
  if (!name) return 'NV';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StaffCard({ staff, onView, onEdit, onChangePassword, onToggleLock, onDelete, onResendMail }) {
  const { id, fullName, email, phone, role, status } = staff;
  
  const handleResendMail = () => {
    if (onResendMail) {
      onResendMail(email);
    }
  };

  return (
    <div className="staff-card-item">
      <div className="staff-card-item__header">
        <div className="staff-card-item__avatar">{getInitials(fullName)}</div>
        <div className="staff-card-item__title">
          <h3 className="staff-card-item__name">{fullName}</h3>
          <span className={`staff-card-item__role staff-card-item__role--${role}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
        <div className="staff-card-item__actions">
            <button type="button" className="staff-action-btn" title="Chỉnh sửa" onClick={() => onEdit?.(staff)}>
              <PencilIcon />
            </button>
            <button type="button" className="staff-action-btn staff-action-btn--danger" title="Xóa" onClick={() => onDelete?.(staff)}>
              <TrashIcon />
            </button>
        </div>
      </div>
      
      <div className="staff-card-item__divider" />

      <div className="staff-card-item__body">
        <div className="staff-card-item__row">
          <span className="staff-card-item__label">ID:</span>
          <span className="staff-card-item__value">{id}</span>
        </div>
        <div className="staff-card-item__row">
          <span className="staff-card-item__label">Email:</span>
          <span className="staff-card-item__value">{email}</span>
        </div>
        <div className="staff-card-item__row">
          <span className="staff-card-item__label">SĐT:</span>
          <span className="staff-card-item__value">{phone}</span>
        </div>
      </div>

      <div className="staff-card-item__footer">
        <span className={`staff-card-item__status staff-card-item__status--${status}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
        {status === 'pending' && (
          <button type="button" className="staff-card-item__resend" onClick={handleResendMail}>
            <MailIcon />
            Gửi lại mail
          </button>
        )}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
}
