/**
 * Confirmation dialog — lock, delete (soft), or generic actions.
 */
export function StaffConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default',
}) {
  if (!open) return null;

  return (
    <div className="staff-modal" role="presentation" onClick={onCancel}>
      <div
        className="staff-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="staff-modal-title"
        aria-describedby="staff-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="staff-modal-title" className="staff-modal__title">
          {title}
        </h2>
        <p id="staff-modal-desc" className="staff-modal__message">
          {message}
        </p>
        <div className="staff-modal__actions">
          <button
            type="button"
            className="staff-btn staff-btn--outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`staff-btn staff-btn--primary${
              variant === 'danger' ? ' staff-btn--danger' : ''
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
