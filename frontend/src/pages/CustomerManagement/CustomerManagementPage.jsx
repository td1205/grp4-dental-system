import { useState, useEffect, useMemo } from 'react'

import { CustomerToolbar } from '../../components/customer/CustomerToolbar/CustomerToolbar'
import { SharedUserGrid } from '../../components/common/SharedGrid/SharedUserGrid'
import { SharedUserTable } from '../../components/common/SharedTable/SharedUserTable'
import { CustomerModal } from '../../components/customer/CustomerModal/CustomerModal'
import { CustomerDetailsModal } from '../../components/customer/CustomerDetailsModal/CustomerDetailsModal'
import { SummaryCards } from '../../components/common/SummaryCards/SummaryCards'
import { Users, UserCheck, UserX } from 'lucide-react'
import { ToastStack } from '../../components/common/ToastStack/ToastStack'
import { ManagementPageLayout } from '../../components/layout/ManagementPageLayout/ManagementPageLayout'
import { StaffConfirmModal } from '../../components/staff/StaffConfirmModal'
import { customerApi } from '../../services'
import './CustomerManagementPage.css'
import { DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/customers'

export function CustomerManagementPage() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [toasts, setToasts] = useState([])
  const [viewMode, setViewMode] = useState('grid')

  const [confirmModalConfig, setConfirmModalConfig] = useState(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // Get User Role
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('dental_user') || JSON.stringify(DEFAULT_USER))
    } catch {
      return DEFAULT_USER
    }
  }, [])
  const showDelete = currentUser.role !== 'Receptionist'

  const fetchCustomers = async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const res = await customerApi.getAll({ search: searchQuery });
      setCustomers(res.data || [])
    } catch (err) {
      console.error(err)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchQuery])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleOpenAddModal = () => {
    setSelectedCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsDetailsModalOpen(true)
  }

  const handleSaveCustomer = async (formData) => {
    try {
      if (formData._id) {
        // Edit
        await customerApi.update(formData._id, formData)
        addToast('Cập nhật thông tin khách hàng thành công!')
      } else {
        // Create
        const res = await customerApi.create(formData)
        if (res && res.needRestore) {
          setConfirmModalConfig({
            title: 'Khôi phục tài khoản',
            message: res.message,
            confirmLabel: 'Khôi phục',
            variant: 'primary',
            onConfirm: async () => {
              setIsConfirmLoading(true)
              try {
                await customerApi.restore(res.data.id)
                addToast('Khôi phục khách hàng thành công!')
                setConfirmModalConfig(null)
                setIsModalOpen(false)
                fetchCustomers()
              } catch (err) {
                addToast('Có lỗi xảy ra khi khôi phục.', 'error')
              } finally {
                setIsConfirmLoading(false)
              }
            }
          })
          return;
        }
        addToast('🎉 Khởi tạo hồ sơ khách hàng thành công trên hệ thống!')
      }
      setIsModalOpen(false)
      fetchCustomers()
    } catch (err) {
      if (err.response?.status === 409) {
        addToast('Không thể lưu: Số CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống', 'error')
      } else {
        addToast('Có lỗi xảy ra khi lưu thông tin.', 'error')
      }
    }
  }

  const handleDeleteCustomer = (id) => {
    const patient = customers.find((c) => c._id === id)
    if (!patient) return

    setConfirmModalConfig({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa tài khoản khách hàng này?',
      confirmLabel: 'Xác nhận',
      variant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true)
        try {
          await customerApi.remove(id)
          addToast('Đã xóa khách hàng thành công!')
          setConfirmModalConfig(null)
          fetchCustomers()
        } catch (err) {
          addToast('Có lỗi xảy ra khi xóa khách hàng.', 'error')
        } finally {
          setIsConfirmLoading(false)
        }
      }
    })
  }

  const toolbar = (
    <CustomerToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onAddClick={handleOpenAddModal}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );

  const summaryItems = [
    {
      title: 'Tổng số khách hàng',
      value: customers.length,
      icon: <Users size={24} />,
      color: 'var(--color-link-active)'
    },
    {
      title: 'Đang hoạt động',
      value: customers.filter(c => c.status === 'active').length,
      icon: <UserCheck size={24} />,
      color: 'var(--color-cta)'
    },
    {
      title: 'Đã ngừng hoạt động/Khóa',
      value: customers.filter(c => c.status !== 'active').length,
      icon: <UserX size={24} />,
      color: 'var(--color-state-suspended-text)'
    }
  ];

  const activeCustomers = useMemo(() => customers.filter(c => c.status === 'active'), [customers]);

  return (
    <>
      <ManagementPageLayout
        title="Quản lý khách hàng"
        subtitle="Quản lý thông tin và hồ sơ bệnh án của khách hàng"
        toolbar={toolbar}
      >
        {isError ? (
          <div className="customer-table__message customer-table__message--error">
            Không thể tải danh sách khách hàng. Hãy kiểm tra kết nối tới Backend.
          </div>
        ) : (
          <>
            <SummaryCards items={summaryItems} />
            {(() => {
              const customerMappingConfig = (customer) => ({
                title: customer.name || '',
                subtitle: customer.id,
                badgeText: '',
                badgeVariant: 'default',
                statusLabel: customer.status === 'active' ? 'Đang hoạt động' : customer.status === 'inactive' ? 'Ngừng hoạt động' : 'Tạm khóa',
                statusVariant: customer.status === 'active' ? 'success' : 'error',
                infoLines: [
                  { label: 'SĐT', value: customer.phone },
                  { label: 'CCCD', value: customer.cccd }
                ]
              });

              const customerColumns = [
                { key: 'id', label: 'MÃ BN' },
                { key: 'name', label: 'HỌ TÊN' },
                { key: 'phone', label: 'SĐT' },
                { key: 'cccd', label: 'CCCD' },
                { key: 'status', label: 'TRẠNG THÁI', render: (c) => {
                    const lbl = c.status === 'active' ? 'Đang hoạt động' : c.status === 'inactive' ? 'Ngừng hoạt động' : 'Tạm khóa';
                    return <span className={`customer-badge customer-badge--${c.status}`}>{lbl}</span>
                } }
              ];

              return viewMode === 'grid' ? (
                <SharedUserGrid
                  users={activeCustomers}
                  isLoading={isLoading}
                  isEmpty={!isLoading && activeCustomers.length === 0}
                  mappingConfig={customerMappingConfig}
                  onEdit={handleEditCustomer}
                  onDelete={showDelete ? handleDeleteCustomer : undefined}
                  onView={handleViewCustomer}
                  isCustomer={true}
                />
              ) : (
                <SharedUserTable
                  users={activeCustomers}
                  columns={customerColumns}
                  isLoading={isLoading}
                  isEmpty={!isLoading && activeCustomers.length === 0}
                  onEdit={handleEditCustomer}
                  onDelete={showDelete ? handleDeleteCustomer : undefined}
                  onView={handleViewCustomer}
                  isCustomer={true}
                />
              )
            })()}
          </>
        )}
      </ManagementPageLayout>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        customer={selectedCustomer}
      />

      {confirmModalConfig && (
        <StaffConfirmModal
          open={!!confirmModalConfig}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          confirmLabel={confirmModalConfig.confirmLabel}
          onConfirm={confirmModalConfig.onConfirm}
          onCancel={() => setConfirmModalConfig(null)}
          isLoading={isConfirmLoading}
          variant={confirmModalConfig.variant}
        />
      )}

      <ToastStack toasts={toasts} />
    </>
  )
}