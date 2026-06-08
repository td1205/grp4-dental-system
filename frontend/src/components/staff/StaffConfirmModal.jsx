import { useState, useEffect } from 'react';

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
  requireReason = false,
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  if (!open) return null;

  const isConfirmDisabled = isLoading || (requireReason && !reason.trim());

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
        
        {requireReason && (
          <div className="staff-modal__reason-field" style={{ marginTop: '16px' }}>
            <label htmlFor="suspend-reason" style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Lý do đình chỉ <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="suspend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do đình chỉ nhân viên này..."
              style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        )}

        <div className="staff-modal__actions" style={{ marginTop: requireReason ? '20px' : '0' }}>
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
            onClick={() => onConfirm(reason)}
            disabled={isConfirmDisabled}
          >
            {isLoading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
