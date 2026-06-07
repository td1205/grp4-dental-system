import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import Icon from '../../components/common/Icon/Icon'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import './ServicePricePage.css'

const ACTIVE_PATH = '/services/prices'

const SEED_SERVICES = [
  {
    id: 'DV001',
    name: 'Khám tổng quát và lập kế hoạch điều trị',
    category: 'Khám và tư vấn',
    status: 'active',
    priceHistory: [
      { version: 1, price: '200.000', bhyt: '150.000', effectiveDate: '2026-01-01' }
    ]
  },
  {
    id: 'DV002',
    name: 'Cạo vôi răng và đánh bóng',
    category: 'Vệ sinh răng miệng',
    status: 'active',
    priceHistory: [
      { version: 1, price: '300.000', bhyt: '250.000', effectiveDate: '2026-01-01' }
    ]
  },
  {
    id: 'DV003',
    name: 'Tẩy trắng răng công nghệ cao',
    category: 'Thẩm mỹ',
    status: 'active',
    priceHistory: [
      { version: 1, price: '2.000.000', bhyt: '0', effectiveDate: '2026-01-01' }
    ]
  },
  {
    id: 'DV004',
    name: 'Nhổ răng khôn (mọc ngầm/lệch)',
    category: 'Phẫu thuật',
    status: 'active',
    priceHistory: []
  },
  {
    id: 'DV005',
    name: 'Phẫu thuật cắt chóp răng',
    category: 'Phẫu thuật',
    status: 'active',
    priceHistory: []
  }
]

export default function ServicePricePage() {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('dental_services')
    if (saved) return JSON.parse(saved)
    localStorage.setItem('dental_services', JSON.stringify(SEED_SERVICES))
    return SEED_SERVICES
  })

  const [activeTab, setActiveTab] = useState('all') // 'all' (Tất cả biểu giá) hoặc 'no-price' (Dịch vụ chưa có giá)
  
  // Trạng thái modal Điều chỉnh giá
  const [selectedService, setSelectedService] = useState(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [newBhyt, setNewBhyt] = useState('')
  const [newEffectiveDate, setNewEffectiveDate] = useState('2026-06-08')
  const [adjustError, setAdjustError] = useState('')

  // Trạng thái modal Xem lịch sử giá
  const [historyService, setHistoryService] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // Chỉ hiển thị các dịch vụ đang hoạt động (active)
  const displayedServices = useMemo(() => {
    const activeServices = services.filter(s => s.status === 'active')
    
    if (activeTab === 'all') {
      // Có ít nhất một biểu giá trong lịch sử
      return activeServices.filter(s => s.priceHistory && s.priceHistory.length > 0)
    } else {
      // Chưa có biểu giá nào trong lịch sử
      return activeServices.filter(s => !s.priceHistory || s.priceHistory.length === 0)
    }
  }, [services, activeTab])

  // Mở modal điều chỉnh giá
  const handleOpenAdjustModal = (service) => {
    setSelectedService(service)
    const latestPrice = service.priceHistory && service.priceHistory.length > 0
      ? service.priceHistory[service.priceHistory.length - 1]
      : null
    
    setNewPrice(latestPrice ? latestPrice.price.replace(/\D/g, '') : '')
    setNewBhyt(latestPrice ? latestPrice.bhyt.replace(/\D/g, '') : '')
    setNewEffectiveDate(new Date().toISOString().slice(0, 10))
    setAdjustError('')
    setIsAdjustModalOpen(true)
  }

  // Lưu biểu giá mới (Sinh ra version mới)
  const handleSavePrice = (e) => {
    e.preventDefault()
    if (!newPrice.trim()) {
      setAdjustError('Vui lòng nhập đơn giá thường')
      return
    }

    const priceHistory = [...(selectedService.priceHistory || [])]
    const nextVersion = priceHistory.length + 1
    const cleanPrice = Number(newPrice.replace(/\D/g, '')).toLocaleString('vi-VN')
    const cleanBhyt = newBhyt.trim() ? Number(newBhyt.replace(/\D/g, '')).toLocaleString('vi-VN') : '0'

    // Tạo phiên bản giá mới (không ghi đè lịch sử giá cũ)
    const newVersion = {
      version: nextVersion,
      price: cleanPrice,
      bhyt: cleanBhyt,
      effectiveDate: newEffectiveDate || new Date().toISOString().slice(0, 10)
    }

    const updated = services.map(s => {
      if (s.id === selectedService.id) {
        return {
          ...s,
          priceHistory: [...priceHistory, newVersion]
        }
      }
      return s
    })

    setServices(updated)
    localStorage.setItem('dental_services', JSON.stringify(updated))
    setIsAdjustModalOpen(false)
  }

  // Xem lịch sử giá
  const handleOpenHistoryModal = (service) => {
    setHistoryService(service)
    setIsHistoryModalOpen(true)
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="price-page">
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
            Dịch vụ chưa có giá ({services.filter(s => s.status === 'active' && (!s.priceHistory || s.priceHistory.length === 0)).length})
          </button>
        </div>

        {/* Bảng hiển thị giá dịch vụ */}
        <div className="price-table-container">
          <table className="price-table">
            <thead>
              <tr>
                <th>MÃ DV</th>
                <th>TÊN DỊCH VỤ</th>
                <th>ĐƠN GIÁ THƯỜNG (VND)</th>
                <th>BHYT CHI TRẢ (VND)</th>
                <th>NGÀY HIỆU LỰC</th>
                <th>TRẠNG THÁI</th>
                <th className="price-table__align-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {displayedServices.length > 0 ? (
                displayedServices.map((item) => {
                  const latestPrice = item.priceHistory && item.priceHistory.length > 0
                    ? item.priceHistory[item.priceHistory.length - 1]
                    : null

                  return (
                    <tr key={item.id}>
                      <td className="price-table__id">{item.id}</td>
                      <td className="price-table__name" style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ fontWeight: 600, color: latestPrice ? '#0f172a' : '#94a3b8' }}>
                        {latestPrice ? latestPrice.price : 'Chưa thiết lập'}
                      </td>
                      <td style={{ color: latestPrice && latestPrice.bhyt !== '0' ? '#2563eb' : '#94a3b8' }}>
                        {latestPrice ? latestPrice.bhyt : 'Chưa thiết lập'}
                      </td>
                      <td>{latestPrice ? latestPrice.effectiveDate : '—'}</td>
                      <td>
                        <span className={`price-badge ${latestPrice ? 'price-badge--active' : 'customer-badge--locked'}`} style={{ fontSize: '11px' }}>
                          {latestPrice ? 'Đang áp dụng' : 'Chưa áp dụng giá'}
                        </span>
                      </td>
                      <td className="price-table__align-right" style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', alignItems: 'center' }}>
                        {latestPrice && (
                          <button
                            type="button"
                            className="price-table__btn-action"
                            style={{ color: '#64748b', fontSize: '13px' }}
                            onClick={() => handleOpenHistoryModal(item)}
                          >
                            Lịch sử ({item.priceHistory.length})
                          </button>
                        )}
                        <button
                          type="button"
                          className="price-table__btn-action"
                          onClick={() => handleOpenAdjustModal(item)}
                        >
                          {latestPrice ? 'Điều chỉnh giá' : 'Cấu hình giá'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="price-table__empty">
                    Không có dịch vụ nào trong tab này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Điều Chỉnh Giá */}
      {isAdjustModalOpen && selectedService && (
        <div className="service-modal-overlay">
          <div className="service-modal" style={{ maxWidth: '460px' }}>
            <header className="service-modal__header">
              <h2>Điều chỉnh biểu giá dịch vụ</h2>
              <button type="button" className="service-modal__close-btn" onClick={() => setIsAdjustModalOpen(false)}>
                <Icon name="x" size={18} />
              </button>
            </header>

            <form onSubmit={handleSavePrice}>
              <div className="service-modal__body">
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Dịch vụ: <strong style={{ color: '#0f172a' }}>{selectedService.name} ({selectedService.id})</strong>
                </p>
                
                {selectedService.priceHistory && selectedService.priceHistory.length > 0 && (
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#475569', borderLeft: '3px solid #2563eb' }}>
                    Phiên bản hiện tại (v{selectedService.priceHistory.length}):{' '}
                    <strong>{selectedService.priceHistory[selectedService.priceHistory.length - 1].price} VND</strong> (BHYT:{' '}
                    <strong>{selectedService.priceHistory[selectedService.priceHistory.length - 1].bhyt} VND</strong>)
                  </div>
                )}

                {adjustError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{adjustError}</p>
                )}

                <div className="service-modal__field">
                  <label htmlFor="adj-price">Đơn giá thường mới (VND) <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    id="adj-price"
                    type="number"
                    placeholder="Nhập giá tự túc mới"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="service-modal__field">
                  <label htmlFor="adj-bhyt">Đơn giá BHYT chi trả mới (VND)</label>
                  <input
                    id="adj-bhyt"
                    type="number"
                    placeholder="Nhập giá bảo hiểm mới"
                    value={newBhyt}
                    onChange={(e) => setNewBhyt(e.target.value)}
                  />
                </div>

                <div className="service-modal__field">
                  <label htmlFor="adj-date">Ngày bắt đầu hiệu lực <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    id="adj-date"
                    type="date"
                    value={newEffectiveDate}
                    onChange={(e) => setNewEffectiveDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <footer className="service-modal__footer">
                <button type="button" className="customer-btn-cancel" onClick={() => setIsAdjustModalOpen(false)}>Hủy</button>
                <button type="submit" className="customer-btn-submit">Cập nhật giá</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lịch Sử Biểu Giá */}
      {isHistoryModalOpen && historyService && (
        <div className="service-modal-overlay">
          <div className="service-modal" style={{ maxWidth: '500px' }}>
            <header className="service-modal__header">
              <h2>Lịch sử thay đổi giá</h2>
              <button type="button" className="service-modal__close-btn" onClick={() => setIsHistoryModalOpen(false)}>
                <Icon name="x" size={18} />
              </button>
            </header>

            <div className="service-modal__body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
                Dịch vụ: <strong style={{ color: '#0f172a' }}>{historyService.name}</strong>
              </p>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <span>PHIÊN BẢN</span>
                  <span>ĐƠN GIÁ thường</span>
                  <span>BHYT</span>
                  <span>NGÀY HIỆU LỰC</span>
                </div>
                
                {/* Hiển thị các phiên bản từ mới nhất đến cũ nhất */}
                {[...(historyService.priceHistory || [])].reverse().map((hist) => (
                  <div className="history-item" key={hist.version}>
                    <span className="history-item__version">v{hist.version} {hist.version === historyService.priceHistory.length ? '(Hiện tại)' : ''}</span>
                    <span style={{ fontWeight: 600 }}>{hist.price} VND</span>
                    <span style={{ color: hist.bhyt !== '0' ? '#2563eb' : '#94a3b8' }}>{hist.bhyt} VND</span>
                    <span style={{ color: '#64748b' }}>{hist.effectiveDate}</span>
                  </div>
                ))}
              </div>
            </div>

            <footer className="service-modal__footer">
              <button type="button" className="customer-btn-submit" onClick={() => setIsHistoryModalOpen(false)}>Đóng</button>
            </footer>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}