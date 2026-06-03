import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import Badge from '../../components/common/Badge/Badge'
import './ServicePricePage.css'

const ACTIVE_PATH = '/services/prices'

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
  { 
    id: 'services', 
    label: 'Dịch vụ', 
    icon: 'services', 
    path: '/services',
    children: [
      { id: 'service-list', label: 'Danh sách dịch vụ', path: '/services' },
      { id: 'service-prices', label: 'Bảng giá dịch vụ', path: '/services/prices' },
    ]
  },
  { id: 'schedule', label: 'Lịch làm việc', icon: 'schedule', path: '/schedule' },
  { id: 'salary', label: 'Lương', icon: 'salary', path: '/salary' },
  { id: 'revenue', label: 'Thống kê doanh thu', icon: 'stats', path: '/revenue' },
]

const ADMIN_USER = {
  initials: 'AU',
  name: 'Admin User',
  email: 'admin@dentalcare.vn',
}

const INITIAL_PRICES = [
  {
    id: 'DV001',
    name: 'Khám và tư vấn nha khoa tổng quát',
    price: 200000,
    insurancePrice: 150000,
    effectiveDate: '1/1/2026',
    status: 'active',
  },
  {
    id: 'DV002',
    name: 'Vệ sinh răng miệng định kỳ',
    price: 300000,
    insurancePrice: 250000,
    effectiveDate: '1/1/2026',
    status: 'active',
  },
  {
    id: 'DV003',
    name: 'Tẩy trắng răng',
    price: 2000000,
    insurancePrice: 0,
    effectiveDate: '1/1/2026',
    status: 'active',
  },
]

export default function ServicePricePage() {
  const [activeTab, setActiveTab] = useState('all')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={ADMIN_USER}>
      <div className="service-price-page">
        <header className="service-price-page__header">
          <h1 className="service-price-page__title">Bảng giá dịch vụ</h1>
        </header>

        <nav className="service-price-page__tabs">
          <button
            className={`service-price-page__tab ${activeTab === 'all' ? 'service-price-page__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả biểu giá
          </button>
          <button
            className={`service-price-page__tab ${activeTab === 'no-price' ? 'service-price-page__tab--active' : ''}`}
            onClick={() => setActiveTab('no-price')}
          >
            Dịch vụ chưa có giá
          </button>
        </nav>

        <div className="service-price-page__table-container">
          <table className="service-price-table">
            <thead>
              <tr>
                <th>Mã DV</th>
                <th>Tên dịch vụ</th>
                <th>Đơn giá (VND)</th>
                <th>BHYT (VND)</th>
                <th>Ngày hiệu lực</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_PRICES.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.insurancePrice)}</td>
                  <td>{item.effectiveDate}</td>
                  <td>
                    <Badge label="Đang áp dụng" variant="success" />
                  </td>
                  <td>
                    <button className="service-price-page__action-btn">
                      Điều chỉnh giá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
