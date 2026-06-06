import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import CustomerToolbar from '../../components/customer/CustomerToolbar/CustomerToolbar'
import CustomerTable from '../../components/customer/CustomerTable/CustomerTable'
import './CustomerManagementPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/customers'

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
      </section>
    </DashboardLayout>
  )
}