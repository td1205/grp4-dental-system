import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import CustomerToolbar from '../../components/customer/CustomerToolbar/CustomerToolbar'
import CustomerTable from '../../components/customer/CustomerTable/CustomerTable'
import CustomerModal from '../../components/customer/CustomerModal/CustomerModal'
import ToastStack from '../../components/common/ToastStack/ToastStack'
import ManagementPageLayout from '../../components/layout/ManagementPageLayout/ManagementPageLayout'
import { StaffConfirmModal } from '../../components/staff/StaffConfirmModal'
import { customerApi } from '../../services/customerApi'
import './CustomerManagementPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/customers'

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [toasts, setToasts] = useState([])

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
      const res = await customerApi.getAll({ search: searchQuery })
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

  const handleSaveCustomer = async (formData) => {
    try {
      if (formData.id) {
        // Edit
        await customerApi.update(formData.id, formData)
        addToast('Cập nhật thông tin khách hàng thành công!')
      } else {
        // Create
        const res = await customerApi.create(formData)
        if (res && res.needRestore) {
          setConfirmModalConfig({
            title: 'Khôi phục tài khoản',
            message: res.message,
            confirmLabel: 'Đồng ý khôi phục',
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
    const patient = customers.find((c) => c.id === id)
    if (!patient) return

    setConfirmModalConfig({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa khách hàng ${patient.name} (${id})? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa',
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
    />
  );

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={currentUser}>
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
          <CustomerTable
            customers={customers}
            isLoading={isLoading}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            showDelete={showDelete}
          />
        )}
      </ManagementPageLayout>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
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
    </DashboardLayout>
  )
}