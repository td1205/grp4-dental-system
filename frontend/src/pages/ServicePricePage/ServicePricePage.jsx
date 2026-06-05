import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import './ServicePricePage.css'

const ACTIVE_PATH = '/services/prices'

const INITIAL_PRICES = [
  {
    id: 'DV001',
    name: 'Khám và tư vấn nha khoa tổng quát',
    price: '200.000',
    bhyt: '150.000',
    effectiveDate: '1/1/2026',
    status: 'active',
  },
  {
    id: 'DV002',
    name: 'Vệ sinh răng miệng định kỳ',
    price: '300.000',
    bhyt: '250.000',
    effectiveDate: '1/1/2026',
    status: 'active',
  },
  {
    id: 'DV003',
    name: 'Tẩy trắng răng',
    price: '2.000.000',
    bhyt: '0',
    effectiveDate: '1/1/2026',
    status: 'active',
  },
]

export default function ServicePricePage() {
  const [activeTab, setActiveTab] = useState('all') // 'all' hoặc 'no-price'

  // Lọc dữ liệu theo tab (Hiện tại hiển thị dữ liệu mẫu cho tab tất cả)
  const displayedPrices = activeTab === 'all' ? INITIAL_PRICES : []

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="price-page">
        {/* Tiêu đề trang */}
        <header className="price-page__header">
          <h1 className="price-page__title">Bảng giá dịch vụ</h1>
        </header>

        {/* Thanh chuyển đổi Tabs */}
        <div className="price-page__tabs">
          <button
            type="button"
            className={`price-page__tab ${activeTab === 'all' ? 'price-page__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả biểu giá
          </button>
          <button
            type="button"
            className={`price-page__tab ${activeTab === 'no-price' ? 'price-page__tab--active' : ''}`}
            onClick={() => setActiveTab('no-price')}
          >
            Dịch vụ chưa có giá
          </button>
        </div>

        {/* Bảng hiển thị giá dịch vụ */}
        <div className="price-table-container">
          <table className="price-table">
            <thead>
              <tr>
                <th>MÃ DV</th>
                <th>TÊN DỊCH VỤ</th>
                <th>ĐƠN GIÁ (VND)</th>
                <th>BHYT (VND)</th>
                <th>NGÀY HIỆU LỰC</th>
                <th>TRẠNG THÁI</th>
                <th className="price-table__align-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {displayedPrices.length > 0 ? (
                displayedPrices.map((item) => (
                  <tr key={item.id}>
                    <td className="price-table__id">{item.id}</td>
                    <td className="price-table__name">{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.bhyt}</td>
                    <td>{item.effectiveDate}</td>
                    <td>
                      <span className={`price-badge price-badge--${item.status}`}>
                        Đang áp dụng
                      </span>
                    </td>
                    <td className="price-table__align-right">
                      <button type="button" className="price-table__btn-action">
                        Điều chỉnh giá
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="price-table__empty">
                    Không có dữ liệu hiển thị.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}