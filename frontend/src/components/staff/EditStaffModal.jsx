import { Modal } from '../common/Modal/Modal';
import { PersonalInfoSection } from './form/PersonalInfoSection';
import { JobInfoSection } from './form/JobInfoSection';
import { AccountInfoSection } from './form/AccountInfoSection';
import { StaffFormActions } from './form/StaffFormActions';
import { useStaffForm } from '../../hooks/useStaffForm';

export function EditStaffModal({ isOpen, onClose, staffId }) {
  const {
    values,
    errors,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    isLoading,
    loadError,
  } = useStaffForm({
    mode: 'edit',
    staffId,
    onSuccess: onClose,
    onCancel: onClose,
  });

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={`Chỉnh sửa nhân viên ${staffId}`}
      onClose={onClose}
    >
      {loadError ? (
        <p className="staff-add-page__submit-error" role="alert">
          Không tìm thấy nhân viên hoặc không thể tải dữ liệu.
        </p>
      ) : isLoading ? (
        <p className="staff-table__message">Đang tải dữ liệu...</p>
      ) : (
        <form className="staff-add-page__form" onSubmit={handleSubmit} noValidate>
          <div className="staff-add-page__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="staff-add-page__column">
              <PersonalInfoSection
                values={values}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
              />
            </div>

            <div className="staff-add-page__column staff-add-page__column--side">
              <JobInfoSection
                values={values}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
              />
              <AccountInfoSection
                values={values}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                isEdit
              />
            </div>
          </div>

          {submitError ? (
            <p className="staff-add-page__submit-error" role="alert">
              {submitError}
            </p>
          ) : null}

          <div style={{ marginTop: '20px' }}>
            <StaffFormActions
              onCancel={onClose}
              isSubmitting={isSubmitting}
              submitLabel="Cập nhật thông tin"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
