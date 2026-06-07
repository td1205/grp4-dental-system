import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import CustomerToolbar from '../../components/customer/CustomerToolbar/CustomerToolbar'
import CustomerTable from '../../components/customer/CustomerTable/CustomerTable'
import CustomerModal from '../../components/customer/CustomerModal/CustomerModal'
import Toast from '../../components/common/Toast/Toast'
import './CustomerManagementPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/customers'

const INITIAL_CUSTOMERS = [
  {
    id: 'BN001',
    name: 'Nguyễn Văn A',
    dob: '1995-05-15',
    phone: '0901234567',
    cccd: '001234567890',
    address: 'Hà Nội',
    email: 'nguyenvana@gmail.com',
    status: 'active',
  },
  {
    id: 'BN002',
    name: 'Trần Thị B',
    dob: '1998-09-20',
    phone: '0901234568',
    cccd: '001234567891',
    address: 'Hải Phòng',
    email: 'tranthib@gmail.com',
    status: 'active',
  },
]

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('dental_customers')
    if (saved) return JSON.parse(saved)
    // Seed initial patients
    localStorage.setItem('dental_customers', JSON.stringify(INITIAL_CUSTOMERS))
    return INITIAL_CUSTOMERS
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [toast, setToast] = useState({ message: '', type: '' })

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    // Ẩn khách hàng có trạng thái "Ngừng hoạt động" (inactive) khỏi danh sách tra cứu thông thường
    const visibleCustomers = customers.filter((c) => c.status !== 'inactive')
    if (!q) return visibleCustomers
    return visibleCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.cccd.includes(q)
    )
  }, [customers, searchQuery])

  const handleOpenAddModal = () => {
    setSelectedCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsModalOpen(true)
  }

  const handleSaveCustomer = (formData) => {
    const cleanPhone = formData.phone.trim().replace(/\s/g, '')
    const cleanCccd = formData.cccd.trim()

    // Ngoại lệ: Chặn hành động và báo lỗi nếu trùng lặp Số CCCD hoặc Số điện thoại
    const duplicatePhone = customers.find(
      (c) => c.phone.trim().replace(/\s/g, '') === cleanPhone && c.id !== formData.id
    )
    const duplicateCccd = customers.find(
      (c) => c.cccd.trim() === cleanCccd && c.id !== formData.id
    )

    if (duplicatePhone) {
      setToast({ message: 'Không thể lưu: Số điện thoại này đã tồn tại trên hệ thống cho khách hàng khác!', type: 'error' })
      return
    }
    if (duplicateCccd) {
      setToast({ message: 'Không thể lưu: Số CCCD này đã tồn tại trên hệ thống cho khách hàng khác!', type: 'error' })
      return
    }

    let updated
    if (formData.id) {
      // Chỉnh sửa thông tin
      updated = customers.map((c) => (c.id === formData.id ? formData : c))
    } else {
      // Thêm mới: tự động sinh mã bệnh nhân BNxxx tăng dần
      const maxNum = customers.reduce((max, c) => {
        const num = parseInt(c.id.replace('BN', ''), 10)
        return !isNaN(num) && num > max ? num : max
      }, 0)
      const nextId = `BN${String(maxNum + 1).padStart(3, '0')}`
      const newCust = { ...formData, id: nextId }
      updated = [...customers, newCust]
    }

    setCustomers(updated)
    localStorage.setItem('dental_customers', JSON.stringify(updated))
    setIsModalOpen(false)
  }

  const handleDeleteCustomer = (id) => {
    const patient = customers.find((c) => c.id === id)
    if (!patient) return

    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng ${patient.name} (${id})?`)) {
      // Áp dụng XÓA LOGIC (Soft Delete).
      // Chuyển trạng thái thành "Ngừng hoạt động" (inactive) và ẩn khỏi danh sách tra cứu thông thường.
      const updated = customers.map((c) =>
        c.id === id ? { ...c, status: 'inactive' } : c
      )
      setCustomers(updated)
      localStorage.setItem('dental_customers', JSON.stringify(updated))
    }
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <section className="customer-page">
        <header className="customer-page__header">
          <h1 className="customer-page__title">Quản lý khách hàng</h1>
          <CustomerToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={handleOpenAddModal}
          />
        </header>

        <CustomerTable
          customers={filteredCustomers}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />

        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCustomer}
          customer={selectedCustomer}
        />
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: '' })} 
        />
      </section>
    </DashboardLayout>
  )
}