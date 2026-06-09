import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { StaffToolbar } from '../../components/staff/StaffToolbar.jsx';
import { StaffGrid } from '../../components/staff/StaffGrid/StaffGrid.jsx';
import { StaffTable } from '../../components/staff/StaffTable.jsx';
import { SummaryCards } from '../../components/common/SummaryCards/SummaryCards.jsx';
import { Users, UserCheck, UserX } from 'lucide-react';
import { PaginationBar } from '../../components/staff/PaginationBar.jsx';
import { StaffConfirmModal } from '../../components/staff/StaffConfirmModal.jsx';
import { useStaffQuery } from '../../hooks/useStaffQuery.js';
import { useStaffActions } from '../../hooks/useStaffActions.js';
import { staffApi } from '../../services/staffApi.js';
import { exportStaffsToExcel } from '../../utils/exportStaffExcel.js';
import { AddStaffModal } from '../../components/staff/AddStaffModal/AddStaffModal.jsx';
import { ManagementPageLayout } from '../../components/layout/ManagementPageLayout/ManagementPageLayout';
import { ReassignDoctorModal } from '../../components/staff/ReassignDoctorModal.jsx';
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

export function StaffManagementPage() {
  const navigate = useNavigate();
  const [exportMessage, setExportMessage] = useState('');
  
  const [toasts, setToasts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStaffFormValues, setAddStaffFormValues] = useState({});
  const [viewMode, setViewMode] = useState('grid');

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
    sort,
    setSort,
    page,
    setPage,
    total,
    totalPages,
    staffs,
    isLoading,
    isError,
    refetch,
  } = useStaffQuery();

  const {
    modalState,
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

  const toolbar = (
    <StaffToolbar
      search={search}
      onSearchChange={setSearch}
      role={role}
      onRoleChange={setRole}
      status={status}
      onStatusChange={setStatus}
      sort={sort}
      onSortChange={setSort}
      onExport={handleExport}
      onAdd={handleAdd}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );

  const summaryItems = [
    {
      title: 'Tổng số nhân sự',
      value: total || 0,
      icon: <Users size={24} />,
      color: 'var(--color-link-active)'
    },
    {
      title: 'Đang làm việc (trang hiện tại)',
      value: staffs.filter(s => s.status === 'active').length,
      icon: <UserCheck size={24} />,
      color: 'var(--color-cta)'
    },
    {
      title: 'Đã khóa (trang hiện tại)',
      value: staffs.filter(s => s.status === 'locked').length,
      icon: <UserX size={24} />,
      color: 'var(--color-state-suspended-text)'
    }
  ];

  return (
    <>
      <ManagementPageLayout
        title="Quản lý nhân viên & Bác sĩ"
        subtitle="Quản lý thông tin nhân viên nội bộ (Admin, Lễ tân, Bác sĩ)"
        toolbar={toolbar}
      >
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
          <>
            <SummaryCards items={summaryItems} />
            {viewMode === 'grid' ? (
            <StaffGrid
              staffList={staffs}
              isLoading={isLoading}
              isEmpty={!isLoading && staffs.length === 0}
              onView={(s) => navigate(`/staff/${s.id}/edit`)}
              onEdit={(s) => navigate(`/staff/${s.id}/edit`)}
              onChangePassword={(s) => console.info('changePassword', s.id)}
              onResetPassword={(s) => {
                const confirmed = window.confirm(`Bạn có chắc chắn muốn reset mật khẩu của ${s.fullName} về mặc định (Dentalcare@123)?`);
                if (confirmed) {
                  staffApi.resetPassword(s.id).then(() => {
                    addToast(`Đã reset mật khẩu thành công cho ${s.fullName}.`);
                  }).catch(() => {
                    addToast(`Có lỗi xảy ra khi reset mật khẩu cho ${s.fullName}.`);
                  });
                }
              }}
              onToggleLock={openLockModal}
              onDelete={openDeleteModal}
              onResendMail={async (s) => {
                try {
                  await staffApi.resendEmail(s.id);
                  addToast(`Đã gửi lại email kích hoạt thực tế đến hòm thư của nhân sự!`);
                } catch (error) {
                  addToast(`Có lỗi xảy ra khi gửi email tới ${s.personalEmail || s.fullName}.`);
                }
              }}
            />
            ) : (
            <StaffTable
              staffs={staffs}
              isLoading={isLoading}
              isEmpty={!isLoading && staffs.length === 0}
              onView={(s) => navigate(`/staff/${s.id}/edit`)}
              onEdit={(s) => navigate(`/staff/${s.id}/edit`)}
              onChangePassword={(s) => console.info('changePassword', s.id)}
              onResetPassword={(s) => {
                const confirmed = window.confirm(`Bạn có chắc chắn muốn reset mật khẩu của ${s.fullName} về mặc định (Dentalcare@123)?`);
                if (confirmed) {
                  staffApi.resetPassword(s.id).then(() => {
                    addToast(`Đã reset mật khẩu thành công cho ${s.fullName}.`);
                  }).catch(() => {
                    addToast(`Có lỗi xảy ra khi reset mật khẩu cho ${s.fullName}.`);
                  });
                }
              }}
              onToggleLock={openLockModal}
              onDelete={openDeleteModal}
              onResendMail={async (s) => {
                try {
                  await staffApi.resendEmail(s.id);
                  addToast(`Đã gửi lại email kích hoạt thực tế đến hòm thư của nhân sự!`);
                } catch (error) {
                  addToast(`Có lỗi xảy ra khi gửi email tới ${s.personalEmail || s.fullName}.`);
                }
              }}
            />
            )}
          </>
          )}

          {!isError && !isLoading && (
            <PaginationBar
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </ManagementPageLayout>

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

      <ReassignDoctorModal
        open={modalState?.type === 'reassign'}
        staff={modalState?.staff}
        appointments={modalState?.appointments}
        reason={modalState?.reason}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          addToast('Bàn giao ca và đình chỉ bác sĩ thành công!');
          refetch();
        }}
      />

      <AddStaffModal
        isOpen={isAddModalOpen}
        formValues={addStaffFormValues}
        onFieldChange={(field, value) => setAddStaffFormValues(prev => ({ ...prev, [field]: value }))}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async () => {
          try {
            await staffApi.create(addStaffFormValues);
            setIsAddModalOpen(false);
            setAddStaffFormValues({});
            addToast('🎉 Thêm mới nhân sự thành công! Hệ thống đã tự động gửi email kèm liên kết hướng dẫn đổi mật khẩu kích hoạt đến hòm thư cá nhân của nhân sự.');
            refetch();
          } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi thêm nhân viên';
            addToast(message);
          }
        }}
      />

      <div className="toast-stack-container">
        {toasts?.map((toast) => (
          <div key={toast.id} className="toast-item">
            <CheckCircleIcon />
            <span className="toast-item__message">{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
