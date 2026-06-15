import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { StaffToolbar } from '../../components/staff/StaffToolbar.jsx';
import { SharedUserGrid } from '../../components/common/SharedGrid/SharedUserGrid.jsx';
import { SharedUserTable } from '../../components/common/SharedTable/SharedUserTable.jsx';
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
import { Icon } from '../../components/common/Icon/Icon.jsx';
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
  const [isEditMode, setIsEditMode] = useState(false);
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
    openResetPasswordModal,
    closeModal,
    confirmModal,
    isModalLoading,
  } = useStaffActions({ onSuccessAction: addToast });

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
    setIsEditMode(false);
    setAddStaffFormValues({});
    setIsAddModalOpen(true);
  };

  const handleEdit = (staff) => {
    const roleMap = {
      'Doctor': 'Doctor',
      'Receptionist': 'Receptionist',
      'Admin': 'Admin',
      'doctor': 'Doctor',
      'receptionist': 'Receptionist',
      'admin': 'Admin'
    };
    
    setAddStaffFormValues({
      id: staff.id || staff._id,
      name: staff.name || staff.fullName || '',
      birthday: staff.birthday ? new Date(staff.birthday).toISOString().split('T')[0] : '',
      phone: staff.phone || '',
      cccd: staff.cccd || '',
      gender: staff.gender || '',
      email: staff.email || staff.personalEmail || '',
      address: staff.address || '',
      role: roleMap[staff.role] || staff.role,
      department: staff.department || '',
      startDate: staff.startDate ? new Date(staff.startDate).toISOString().split('T')[0] : '',
      specialty: staff.specialty || '',
      academicDegree: staff.academicDegree || '',
      academicTitle: staff.academicTitle || '',
      qualification: staff.qualification || '',
    });
    setIsEditMode(true);
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
            {(() => {
              const STATUS_VARIANT = {
                active: 'success',
                pending: 'warning',
                locked: 'error',
                inactive: 'error',
              };

              const SPECIALTY_VARIANT = {
                Implant: 'implant',
                Orthodontics: 'orthodontics',
                'Lễ tân': 'reception',
              };

              const staffMappingConfig = (staff) => ({
                title: staff.name || staff.fullName || '',
                subtitle: staff.id || staff.ma_nhan_vien,
                badgeText: staff.specialty,
                badgeVariant: SPECIALTY_VARIANT[staff.specialty] ?? 'reception',
                statusLabel: staff.status === 'active' ? 'Hoạt động' : staff.status === 'locked' ? 'Bị khóa' : 'Chờ kích hoạt',
                statusVariant: STATUS_VARIANT[staff.status] ?? 'success',
                infoLines: [
                  { label: 'Email', value: staff.email || staff.personalEmail },
                  { label: 'SĐT', value: staff.phone }
                ]
              });

              const staffColumns = [
                { key: 'id', label: 'MÃ NV', render: (s) => s.id || s.ma_nhan_vien },
                { key: 'name', label: 'HỌ TÊN', render: (s) => s.name || s.fullName },
                { key: 'email', label: 'EMAIL', render: (s) => s.email || s.personalEmail },
                { key: 'phone', label: 'SĐT' },
                { key: 'role', label: 'VAI TRÒ', render: (s) => String(s.role).toLowerCase() === 'doctor' ? 'Bác sĩ' : String(s.role).toLowerCase() === 'receptionist' ? 'Lễ tân' : 'Quản trị viên' },
                { key: 'specialty', label: 'CHUYÊN KHOA/BẰNG CẤP', render: (s) => s.specialty || '-' },
                { key: 'status', label: 'TRẠNG THÁI', render: (s) => {
                    const lbl = s.status === 'active' ? 'Đang hoạt động' : s.status === 'locked' ? 'Tạm khóa' : 'Chờ kích hoạt';
                    return <span className={`staff-badge staff-badge--${s.status}`}>{lbl}</span>
                } }
              ];

              const renderCustomActions = (s) => {
                if (s.status === 'pending') {
                  return (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await staffApi.resendEmail(s.id || s._id);
                          addToast(`Đã gửi lại email kích hoạt thực tế đến hòm thư của nhân sự!`);
                        } catch (error) {
                          addToast(`Có lỗi xảy ra khi gửi email tới ${s.personalEmail || s.fullName}.`);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#0D8A72', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Icon name="mail" size={16} /> Gửi lại email
                    </button>
                  )
                }
                return null;
              };

              const activeStaffs = staffs.filter(s => s.status !== 'inactive');
              return viewMode === 'grid' ? (
            <SharedUserGrid
              users={activeStaffs}
              isLoading={isLoading}
              isEmpty={!isLoading && activeStaffs.length === 0}
              mappingConfig={staffMappingConfig}
              onView={handleEdit}
              onEdit={handleEdit}
              onToggleLock={openLockModal}
              onChangePassword={openResetPasswordModal}
              onDelete={openDeleteModal}
              renderCustomActions={renderCustomActions}
            />
            ) : (
            <SharedUserTable
              users={activeStaffs}
              columns={staffColumns}
              isLoading={isLoading}
              isEmpty={!isLoading && activeStaffs.length === 0}
              onView={handleEdit}
              onEdit={handleEdit}
              onToggleLock={openLockModal}
              onChangePassword={openResetPasswordModal}
              onDelete={openDeleteModal}
              renderCustomActions={renderCustomActions}
            />
            )
            })()}
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
            if (isEditMode) {
              await staffApi.update(addStaffFormValues.id, addStaffFormValues);
              addToast('🎉 Cập nhật thông tin nhân sự thành công!');
            } else {
              await staffApi.create(addStaffFormValues);
              addToast('🎉 Thêm mới nhân sự thành công! Hệ thống đã tự động gửi email kèm liên kết hướng dẫn đổi mật khẩu kích hoạt đến hòm thư cá nhân của nhân sự.');
            }
            setIsAddModalOpen(false);
            setAddStaffFormValues({});
            refetch();
          } catch (error) {
            const message = error.response?.data?.message || (isEditMode ? 'Có lỗi xảy ra khi cập nhật nhân viên' : 'Có lỗi xảy ra khi thêm nhân viên');
            addToast(message);
          }
        }}
        isEdit={isEditMode}
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
