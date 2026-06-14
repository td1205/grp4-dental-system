import { Link } from 'react-router-dom';
import { PersonalInfoSection } from '../components/staff/form/PersonalInfoSection';
import { JobInfoSection } from '../components/staff/form/JobInfoSection';
import { AccountInfoSection } from '../components/staff/form/AccountInfoSection';
import { StaffFormActions } from '../components/staff/form/StaffFormActions';
import { useStaffForm } from '../hooks/useStaffForm';

const ACTIVE_PATH = '/staff';

export function AddStaffPage() {
  const {
    values,
    errors,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    handleCancel,
    isSubmitting,
  } = useStaffForm();

  return (
    <>
      <div className="staff-add-page">
        <Link to="/staff" className="staff-add-page__back">
          <BackIcon />
          Quay lại danh sách
        </Link>

        <header className="staff-add-page__header">
          <h1>Thêm nhân viên mới</h1>
          <p>Nhập thông tin để tạo tài khoản nhân viên mới</p>
        </header>

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
              />
            </div>
          </div>

          {submitError ? (
            <p className="staff-add-page__submit-error" role="alert">
              {submitError}
            </p>
          ) : null}

          <StaffFormActions onCancel={handleCancel} isSubmitting={isSubmitting} />
        </form>
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
