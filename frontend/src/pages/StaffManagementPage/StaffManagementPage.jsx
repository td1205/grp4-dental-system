import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation';
import { StaffToolbar } from '../../components/staff/StaffToolbar.jsx';
import { StaffGrid } from '../../components/staff/StaffGrid.jsx';
import { PaginationBar } from '../../components/staff/PaginationBar.jsx';
import { StaffConfirmModal } from '../../components/staff/StaffConfirmModal.jsx';
import { useStaffQuery } from '../../hooks/useStaffQuery.js';
import { useStaffActions } from '../../hooks/useStaffActions.js';
import { staffApi } from '../../services/staffApi.js';
import { exportStaffsToExcel } from '../../utils/exportStaffExcel.js';
import AddStaffModal from '../../components/staff/AddStaffModal/AddStaffModal.jsx';
import './StaffManagementPage.css';

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const ACTIVE_PATH = '/staff';

export default function StaffManagementPage() {
  const navigate = useNavigate();
  const [exportMessage, setExportMessage] = useState('');
  
  const [toasts, setToasts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStaffFormValues, setAddStaffFormValues] = useState({});

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

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

  const handleAdd = () => {
    setAddStaffFormValues({});
    setIsAddModalOpen(true);
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="staff-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Quản lý nhân viên & Bác sĩ</h1>
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
              <code>cd backend && npm run dev</code>).
            </div>
          ) : (
            <StaffGrid
              staffs={staffs}
              isLoading={isLoading}
              isEmpty={!isLoading && staffs.length === 0}
              onView={(s) => navigate(`/staff/${s.id}/edit`)}
              onEdit={(s) => navigate(`/staff/${s.id}/edit`)}
              onChangePassword={(s) => console.info('changePassword', s.id)}
              onToggleLock={openLockModal}
              onDelete={openDeleteModal}
              onResendMail={(email) => addToast(`Đã gửi lại email thành công tới ${email}!`)}
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

        <AddStaffModal
          isOpen={isAddModalOpen}
          formValues={addStaffFormValues}
          onFieldChange={(field, value) => setAddStaffFormValues(prev => ({ ...prev, [field]: value }))}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={() => {
            console.info('Submitting AddStaff form...', addStaffFormValues);
            setIsAddModalOpen(false);
            setAddStaffFormValues({});
            addToast('Đã lưu thông tin nhân viên mới!');
          }}
        />

        <div className="toast-stack-container">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast-item">
              <CheckCircleIcon />
              <span className="toast-item__message">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
