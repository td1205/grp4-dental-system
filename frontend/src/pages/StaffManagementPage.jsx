import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffToolbar } from '../components/staff/StaffToolbar';
import { StaffTable } from '../components/staff/StaffTable';
import { PaginationBar } from '../components/staff/PaginationBar';
import { StaffConfirmModal } from '../components/staff/StaffConfirmModal';
import { useStaffQuery } from '../hooks/useStaffQuery';
import { useStaffActions } from '../hooks/useStaffActions';
import { staffApi } from '../services/staffApi';
import { exportStaffsToExcel } from '../utils/exportStaffExcel';

export default function StaffManagementPage() {
  const navigate = useNavigate();
  const [exportMessage, setExportMessage] = useState('');

  const {
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    page,
    setPage,
    total,
    totalPages,
    staffs,
    isLoading,
    isError,
  } = useStaffQuery();

  const {
    modalOpen,
    modalConfig,
    openLockModal,
    openDeleteModal,
    closeModal,
    confirmModal,
    isModalLoading,
  } = useStaffActions();

  const handleExport = async () => {
    setExportMessage('');
    try {
      const result = await staffApi.getAll({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page: 1,
        limit: 500,
      });
      const exportResult = exportStaffsToExcel(result.data);
      setExportMessage(exportResult.message);
    } catch {
      setExportMessage('Không thể xuất file. Hãy kiểm tra kết nối backend.');
    }
  };

  const handleAdd = () => navigate('/staff/new');

  return (
    <div className="staff-page">
      <header className="staff-page__header">
        <h1>Quản lý tài khoản nhân viên</h1>
        <p>Quản lý thông tin nhân viên nội bộ (Admin, Lễ tân, Bác sĩ)</p>
      </header>

      <div className="staff-card">
        <StaffToolbar
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          status={status}
          onStatusChange={setStatus}
          onExport={handleExport}
          onAdd={handleAdd}
        />

        {exportMessage ? (
          <p
            className={`staff-page__toast${
              exportMessage.includes('Không') ? ' staff-page__toast--error' : ''
            }`}
            role="status"
          >
            {exportMessage}
          </p>
        ) : null}

        {isError ? (
          <div className="staff-table__message staff-table__message--error">
            Không thể tải danh sách nhân viên. Hãy chạy backend tại cổng 3000 (
            <code>cd backend &amp;&amp; npm run dev</code>).
          </div>
        ) : (
          <StaffTable
            staffs={staffs}
            isLoading={isLoading}
            isEmpty={!isLoading && staffs.length === 0}
            onView={(s) => navigate(`/staff/${s.id}/edit`)}
            onEdit={(s) => navigate(`/staff/${s.id}/edit`)}
            onChangePassword={(s) => console.info('changePassword', s.id)}
            onToggleLock={openLockModal}
            onDelete={openDeleteModal}
          />
        )}

        {!isError && !isLoading && (
          <PaginationBar
            total={total}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {modalConfig ? (
        <StaffConfirmModal
          open={modalOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          onConfirm={confirmModal}
          onCancel={closeModal}
          isLoading={isModalLoading}
          variant={modalConfig.variant}
        />
      ) : null}
    </div>
  );
}
