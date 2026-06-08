import { ROLE_LABELS, STATUS_LABELS } from '../../constants/staff';
import './StaffCard.css';

function getInitials(name) {
  if (!name) return 'NV';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StaffCard({ staff, onView, onEdit, onChangePassword, onResetPassword, onToggleLock, onDelete, onResendMail, onShowActivationLink }) {
  const { id, fullName, email, phone, role, status, specialty } = staff;

  return (
    <div className="staff-card-item">
      <div className="staff-card-item__header">
        <div className="staff-card-item__avatar">{getInitials(fullName)}</div>
        <div className="staff-card-item__title">
          <h3 className="staff-card-item__name">{fullName}</h3>
          <div className="staff-card-item__tags">
            <span className={`staff-card-item__role staff-card-item__role--${role}`}>
              {ROLE_LABELS[role] ?? role}
            </span>
            {role === 'doctor' && specialty && (
              <span className="staff-card-item__specialty">Chuyên khoa: {specialty}</span>
            )}
          </div>
        </div>
        <div className="staff-card-item__actions">
            <button type="button" className="staff-action-btn" title="Chỉnh sửa" onClick={() => onEdit?.(staff)}>
              <PencilIcon />
            </button>
            <button 
              type="button" 
              className={`staff-action-btn ${status === 'suspended' ? 'staff-action-btn--success' : 'staff-action-btn--warning'}`}
              title={status === 'suspended' ? "Khôi phục tài khoản" : "Đình chỉ"} 
              onClick={() => onToggleLock?.(staff)}
            >
              {status === 'suspended' ? <RestoreIcon /> : <SuspendIcon />}
            </button>
            <button 
              type="button" 
              className="staff-action-btn staff-action-btn--secondary" 
              title="Reset mật khẩu" 
              onClick={() => onResetPassword?.(staff)}
            >
              <ResetIcon />
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
          <button type="button" className="staff-card-item__resend" onClick={() => onResendMail?.(staff)}>
            <MailIcon />
            Gửi lại email
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

function SuspendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
      <polyline points="12 8 12 12 14 14"></polyline>
    </svg>
  );
}
