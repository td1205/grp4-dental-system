import { Link, useParams } from 'react-router-dom';
import { PersonalInfoSection } from '../components/staff/form/PersonalInfoSection';
import { JobInfoSection } from '../components/staff/form/JobInfoSection';
import { AccountInfoSection } from '../components/staff/form/AccountInfoSection';
import { StaffFormActions } from '../components/staff/form/StaffFormActions';
import { useStaffForm } from '../hooks/useStaffForm';

import { NAV_ITEMS, DEFAULT_USER } from '../constants/navigation';

const ACTIVE_PATH = '/staff';

export function EditStaffPage() {
  const { id } = useParams();
  const {
    values,
    errors,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleCancel,
    isSubmitting,
    isLoading,
    loadError,
  } = useStaffForm({ mode: 'edit', staffId: id });

  return (
    <>
      <div className="staff-add-page">
        <Link to="/staff" className="staff-add-page__back">
          <BackIcon />
          Quay lại danh sách
        </Link>

        {loadError ? (
          <div>
            <p className="staff-add-page__submit-error" role="alert">
              Không tìm thấy nhân viên hoặc không thể tải dữ liệu.
            </p>
          </div>
        ) : (
          <>
            <header className="staff-add-page__header">
              <h1>Chỉnh sửa nhân viên</h1>
              <p>Cập nhật thông tin nhân viên — {id}</p>
            </header>

            {isLoading ? (
              <p className="staff-table__message">Đang tải dữ liệu...</p>
            ) : (
              <form className="staff-add-page__form" onSubmit={handleSubmit} noValidate>
                <div className="staff-add-page__grid">
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

                <StaffFormActions
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  submitLabel="Cập nhật thông tin"
                />
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
