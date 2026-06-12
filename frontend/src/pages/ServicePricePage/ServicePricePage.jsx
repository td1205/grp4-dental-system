import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'

import { ModalWrapper } from '../../components/common/ModalWrapper/ModalWrapper'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Icon } from '../../components/common/Icon/Icon'
import './ServicePricePage.css'

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

  const [activeTab, setActiveTab] = useState('all')
  const [selectedService, setSelectedService] = useState(null)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [newEffectiveDate, setNewEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [adjustError, setAdjustError] = useState('')
  const [historyService, setHistoryService] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const displayedServices = useMemo(() => {
    const activeServices = services.filter(s => s.status === 'active')
    return activeTab === 'all'
      ? activeServices.filter(s => s.priceHistory && s.priceHistory.length > 0)
      : activeServices.filter(s => !s.priceHistory || s.priceHistory.length === 0)
  }, [services, activeTab])

  const handleOpenAdjustModal = (service) => {
    setSelectedService(service)
    const latestPrice = service.priceHistory && service.priceHistory.length > 0
      ? service.priceHistory[service.priceHistory.length - 1]
      : null

    setNewPrice(latestPrice ? (latestPrice.regularPrice || latestPrice.price).replace(/\D/g, '') : '')
    setNewEffectiveDate(new Date().toISOString().slice(0, 10))
    setAdjustError('')
    setIsAdjustModalOpen(true)
  }

  const handleSavePrice = async (e) => {
    e.preventDefault()
    if (!newPrice.trim()) {
      setAdjustError('Vui lòng nhập đơn giá thường')
      return
    }

    try {
      const cleanPrice = Number(newPrice.replace(/\D/g, '')).toLocaleString('vi-VN')
      const payload = {
        price: cleanPrice,
        effectiveDate: newEffectiveDate
      }

      await axios.post(`${API_URL}/${selectedService.id}/prices`, payload)
      fetchServices()
      setIsAdjustModalOpen(false)
    } catch (err) {
      console.error(err)
      setAdjustError('Có lỗi xảy ra khi lưu bảng giá mới')
    }
  }

  return (
    <>
      <div className="price-page">
        <header className="price-page__header">
          <h1 className="price-page__title">Bảng giá dịch vụ</h1>
        </header>

        <div className="price-page__tabs">
          <button type="button" className={`price-page__tab ${activeTab === 'all' ? 'price-page__tab--active' : ''}`} onClick={() => setActiveTab('all')}>Tất cả biểu giá</button>
          <button type="button" className={`price-page__tab ${activeTab === 'no-price' ? 'price-page__tab--active' : ''}`} onClick={() => setActiveTab('no-price')}>
            Dịch vụ chưa có giá ({services.filter(s => s.status === 'active' && (!s.priceHistory || s.priceHistory.length === 0)).length})
          </button>
        </div>

        <div className="price-table-container">
          <table className="price-table">
            <thead>
              <tr>
                <th>MÃ DV</th>
                <th>TÊN DỊCH VỤ</th>
                <th>ĐƠN GIÁ THƯỜNG (VND)</th>
                <th>NGÀY HIỆU LỰC</th>
                <th className="price-table__align-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {displayedServices.map((item) => {
                const latestPrice = item.priceHistory?.length > 0 ? item.priceHistory[item.priceHistory.length - 1] : null
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontWeight: 600 }}>{latestPrice ? (latestPrice.regularPrice || latestPrice.price) : 'Chưa thiết lập'}</td>
                    <td>{latestPrice ? new Date(latestPrice.effectiveDate).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="price-table__align-right">
                      {latestPrice && <button onClick={() => { setHistoryService(item); setIsHistoryModalOpen(true); }}>Lịch sử ({item.priceHistory.length})</button>}
                      <button onClick={() => handleOpenAdjustModal(item)}>{latestPrice ? 'Điều chỉnh giá' : 'Cấu hình giá'}</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalWrapper isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Điều chỉnh biểu giá" footer={
        <>
          <button className="customer-btn-cancel" onClick={() => setIsAdjustModalOpen(false)}>Hủy</button>
          <PrimaryButton onClick={handleSavePrice}>Cập nhật giá</PrimaryButton>
        </>
      }>
        <form onSubmit={handleSavePrice}>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>Dịch vụ: <strong>{selectedService?.name}</strong></p>
          {selectedService?.priceHistory?.length > 0 && (
            <div style={{ padding: '8px', background: '#f8fafc', fontSize: '12px', marginBottom: '16px' }}>
              Phiên bản hiện tại: <strong>{selectedService.priceHistory[selectedService.priceHistory.length - 1].regularPrice} VND</strong>
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label>Đơn giá thường mới (VND) *</label>
            <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
          </div>
          <div>
            <label>Ngày hiệu lực *</label>
            <input type="date" value={newEffectiveDate} onChange={(e) => setNewEffectiveDate(e.target.value)} required />
          </div>
        </form>
      </ModalWrapper>


      <ModalWrapper isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Lịch sử giá" footer={<PrimaryButton onClick={() => setIsHistoryModalOpen(false)}>Đóng</PrimaryButton>}>
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', padding: '10px', background: '#f8fafc', fontWeight: 600, fontSize: '12px', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ width: '80px' }}>PHIÊN BẢN</span>
            <span style={{ flex: 1 }}>ĐƠN GIÁ THƯỜNG</span>
            <span style={{ width: '100px' }}>NGÀY HIỆU LỰC</span>
          </div>
          {[...(historyService?.priceHistory || [])].reverse().map((hist, index) => (
            <div key={index} style={{ display: 'flex', padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ width: '80px' }}>v{hist.version || index + 1}</span>
              <span style={{ flex: 1 }}>{hist.regularPrice || '0'} VND</span>
              <span style={{ width: '100px' }}>
                {/* Kiểm tra ngày hợp lệ trước khi hiển thị */}
                {hist.effectiveDate && !isNaN(new Date(hist.effectiveDate))
                  ? new Date(hist.effectiveDate).toLocaleDateString('vi-VN')
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      </ModalWrapper>
    </>
  )
}