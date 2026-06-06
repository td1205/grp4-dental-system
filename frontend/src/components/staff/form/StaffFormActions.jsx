/**
 * Form footer actions — cancel returns to list; save submits parent form.
 */
export function StaffFormActions({
  onCancel,
  isSubmitting = false,
  submitLabel = 'Lưu thông tin',
}) {
  return (
    <div className="staff-form-actions">
      <button
        type="button"
        className="staff-btn staff-btn--outline staff-form-actions__btn"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <CloseIcon />
        Hủy
      </button>
      <button
        type="submit"
        className="staff-btn staff-btn--primary staff-form-actions__btn"
        disabled={isSubmitting}
      >
        <SaveIcon />
        {isSubmitting ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}
