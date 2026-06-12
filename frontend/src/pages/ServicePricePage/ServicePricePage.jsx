import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'

import { ModalWrapper } from '../../components/common/ModalWrapper/ModalWrapper'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Icon } from '../../components/common/Icon/Icon'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import './ServicePricePage.css'

const ACTIVE_PATH = '/services/prices'
const API_URL = 'http://localhost:5001/api/services'

export function ServicePricePage() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(API_URL)
      setServices(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

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
  const handleSavePrice = async (e) => {
    e.preventDefault()
    if (!newPrice.trim()) {
      setAdjustError('Vui lòng nhập đơn giá thường')
      return
    }

    try {
      const cleanPrice = Number(newPrice.replace(/\D/g, '')).toLocaleString('vi-VN')
      const cleanBhyt = newBhyt.trim() ? Number(newBhyt.replace(/\D/g, '')).toLocaleString('vi-VN') : '0'

      const payload = {
        price: cleanPrice,
        bhyt: cleanBhyt,
        effectiveDate: newEffectiveDate || new Date().toISOString().slice(0, 10)
      }

      await axios.post(`${API_URL}/${selectedService.id}/prices`, payload)
      fetchServices()
      setIsAdjustModalOpen(false)
    } catch (err) {
      console.error(err)
      setAdjustError('Có lỗi xảy ra khi lưu bảng giá mới')
    }
  }

  // Xem lịch sử giá
  const handleOpenHistoryModal = (service) => {
    setHistoryService(service)
    setIsHistoryModalOpen(true)
  }

  return (
    <>
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
                displayedServices?.map((item) => {
                  const latestPrice = item.priceHistory && item.priceHistory.length > 0
                    ? item.priceHistory[item.priceHistory.length - 1]
                    : null

                  return (
                    <tr key={item.id}>
                      <td className="price-table__id">{item.id}</td>
                      <td className="price-table__name" style={{ fontWeight: 500 }}>{item.name}</td>
                      <td style={{ fontWeight: 600, color: latestPrice ? '#0f172a' : '#94a3b8' }}>
                        {latestPrice ? (latestPrice.regularPrice || latestPrice.price) : 'Chưa thiết lập'}
                      </td>
                      <td style={{ color: latestPrice && (latestPrice.insurancePrice || latestPrice.bhyt) !== '0' ? '#2563eb' : '#94a3b8' }}>
                        {latestPrice ? (latestPrice.insurancePrice || latestPrice.bhyt) : 'Chưa thiết lập'}
                      </td>
                      <td>{latestPrice ? new Date(latestPrice.effectiveDate).toLocaleDateString('vi-VN') : '—'}</td>
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
      <ModalWrapper
        isOpen={isAdjustModalOpen && selectedService !== null}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Điều chỉnh biểu giá dịch vụ"
        maxWidth="460px"
        footer={
          <>
            <button type="button" className="customer-btn-cancel" onClick={() => setIsAdjustModalOpen(false)}>Hủy</button>
            <PrimaryButton onClick={handleSavePrice}>Cập nhật giá</PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleSavePrice} id="adjust-price-form">
          <div className="service-modal__body" style={{ padding: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Dịch vụ: <strong style={{ color: '#0f172a' }}>{selectedService?.name} ({selectedService?.id})</strong>
            </p>

            {selectedService?.priceHistory && selectedService.priceHistory.length > 0 && (
              <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#475569', borderLeft: '3px solid #2563eb', marginBottom: '16px' }}>
                Phiên bản hiện tại (v{selectedService.priceHistory.length}):{' '}
                <strong>{selectedService.priceHistory[selectedService.priceHistory.length - 1].regularPrice || selectedService.priceHistory[selectedService.priceHistory.length - 1].price} VND</strong> (BHYT:{' '}
                <strong>{selectedService.priceHistory[selectedService.priceHistory.length - 1].insurancePrice || selectedService.priceHistory[selectedService.priceHistory.length - 1].bhyt} VND</strong>)
              </div>
            )}

            {adjustError && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 16px 0' }}>{adjustError}</p>
            )}

            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="adj-price" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Đơn giá thường mới (VND) <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                id="adj-price"
                type="number"
                placeholder="Nhập giá tự túc mới"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />
            </div>

            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="adj-bhyt" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Đơn giá BHYT chi trả mới (VND)</label>
              <input
                id="adj-bhyt"
                type="number"
                placeholder="Nhập giá bảo hiểm mới"
                value={newBhyt}
                onChange={(e) => setNewBhyt(e.target.value)}
              />
            </div>

            <div className="service-modal__field">
              <label htmlFor="adj-date" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Ngày bắt đầu hiệu lực <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                id="adj-date"
                type="date"
                value={newEffectiveDate}
                onChange={(e) => setNewEffectiveDate(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </ModalWrapper>

      {/* Modal Lịch Sử Biểu Giá */}
      <ModalWrapper
        isOpen={isHistoryModalOpen && historyService !== null}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Lịch sử thay đổi giá"
        maxWidth="500px"
        footer={
          <PrimaryButton onClick={() => setIsHistoryModalOpen(false)}>Đóng</PrimaryButton>
        }
      >
        <div className="service-modal__body" style={{ maxHeight: '380px', overflowY: 'auto', padding: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Dịch vụ: <strong style={{ color: '#0f172a' }}>{historyService?.name}</strong>
          </p>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <span style={{ width: '80px' }}>PHIÊN BẢN</span>
              <span style={{ flex: 1 }}>ĐƠN GIÁ thường</span>
              <span style={{ flex: 1 }}>BHYT</span>
              <span style={{ width: '100px' }}>NGÀY HIỆU LỰC</span>
            </div>

            {/* Hiển thị các phiên bản từ mới nhất đến cũ nhất */}
            {[...(historyService?.priceHistory || [])].reverse().map((hist) => (
              <div className="history-item" key={hist.version} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
                <span className="history-item__version" style={{ width: '80px' }}>v{hist.version} {hist.version === historyService.priceHistory.length ? '(Hiện tại)' : ''}</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{hist.regularPrice || hist.price} VND</span>
                <span style={{ color: (hist.insurancePrice || hist.bhyt) !== '0' ? '#2563eb' : '#94a3b8', flex: 1 }}>{hist.insurancePrice || hist.bhyt} VND</span>
                <span style={{ color: '#64748b', width: '100px' }}>{new Date(hist.effectiveDate).toLocaleDateString('vi-VN')}</span>
              </div>
            ))}
          </div>
        </div>
      </ModalWrapper>
    </>
  )
}