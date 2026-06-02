import { ROLE_LABELS, STATUS_LABELS, formatCreatedDate } from '../../constants/staff';

export function StaffRow({ staff, onView, onEdit, onChangePassword, onToggleLock, onDelete }) {
  return (
    <tr className="staff-row">
      <td className="staff-row__id">{staff.id}</td>
      <td className="staff-row__name">{staff.fullName}</td>
      <td>{staff.email}</td>
      <td>{staff.phone}</td>
      <td>
        <span className={`staff-badge staff-badge--role staff-badge--role-${staff.role}`}>
          {ROLE_LABELS[staff.role] ?? staff.role}
        </span>
      </td>
      <td className="staff-row__degree">{staff.degree || '—'}</td>
      <td>
        <span className={`staff-badge staff-badge--status staff-badge--status-${staff.status}`}>
          {STATUS_LABELS[staff.status] ?? staff.status}
        </span>
      </td>
      <td>{formatCreatedDate(staff.createdAt)}</td>
      <td>
        <div className="staff-row__actions">
          <ActionButton label="Xem" onClick={() => onView?.(staff)}>
            <EyeIcon />
          </ActionButton>
          <ActionButton label="Sửa" onClick={() => onEdit?.(staff)}>
            <PencilIcon />
          </ActionButton>
          <ActionButton label="Đổi mật khẩu" onClick={() => onChangePassword?.(staff)}>
            <KeyIcon />
          </ActionButton>
          <ActionButton
            label={staff.status === 'locked' ? 'Mở khóa' : 'Khóa'}
            onClick={() => onToggleLock?.(staff)}
          >
            <LockIcon />
          </ActionButton>
          <ActionButton label="Xóa" onClick={() => onDelete?.(staff)} variant="danger">
            <TrashIcon />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

function ActionButton({ label, onClick, children, variant }) {
  return (
    <button
      type="button"
      className={`staff-action-btn${variant === 'danger' ? ' staff-action-btn--danger' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.6 7.6a6.5 6.5 0 11-2.2-2.2L15 7l2-2 4 4-2 2-3.4-3.4z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}
