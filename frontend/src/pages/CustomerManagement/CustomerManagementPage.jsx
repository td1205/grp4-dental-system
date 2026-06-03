import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import CustomerToolbar from '../../components/customer/CustomerToolbar/CustomerToolbar'
import CustomerTable from '../../components/customer/CustomerTable/CustomerTable'
import './CustomerManagementPage.css'

const ACTIVE_PATH = '/customers'

const NAV_ITEMS = [
  {
    id: 'users',
    label: 'Quản lý người dùng',
    icon: 'users',
    path: '/users',
    children: [
      { id: 'staff', label: 'Quản lý nhân viên', path: '/staff' },
      { id: 'customers', label: 'Quản lý khách hàng', path: '/customers' },
    ],
  },
  { id: 'services', label: 'Dịch vụ', icon: 'services', path: '/services' },
  { id: 'schedule', label: 'Lịch làm việc', icon: 'schedule', path: '/schedule' },
  { id: 'salary', label: 'Lương', icon: 'salary', path: '/salary' },
  { id: 'revenue', label: 'Thống kê doanh thu', icon: 'stats', path: '/revenue' },
]

const ADMIN_USER = {
  initials: 'AU',
  name: 'Admin User',
  email: 'admin@dentalcare.vn',
}

// Khởi tạo dữ liệu mẫu chính xác theo hình ảnh bạn cung cấp
const INITIAL_CUSTOMERS = [
  {
    id: 'BN001',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    cccd: '001234567890',
    status: 'active',
  },
  {
    id: 'BN002',
    name: 'Trần Thị B',
    phone: '0901234568',
    cccd: '001234567891',
    status: 'active',
  },
]

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [searchQuery, setSearchQuery] = useState('')

  // Bộ lọc tìm kiếm theo Tên, SĐT hoặc CCCD
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.cccd.includes(q)
    )
  }, [customers, searchQuery])

  const handleOpenAddModal = () => {
    console.log('Mở modal thêm khách hàng mới')
    // Logic mở modal sẽ phát triển ở các bước tiếp theo
  }

  const handleEditCustomer = (customer) => {
    console.log('Sửa khách hàng:', customer)
  }

  const handleDeleteCustomer = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng ${id}?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={ADMIN_USER}>
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
      </section>
    </DashboardLayout>
  )
}