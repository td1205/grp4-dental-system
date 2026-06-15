import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'

import { ModalWrapper } from '../../components/common/ModalWrapper/ModalWrapper'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Button } from '../../components/ui/Button/Button'
import { Icon } from '../../components/common/Icon/Icon'
import toast, { Toaster } from 'react-hot-toast'
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
  const [newInsurancePrice, setNewInsurancePrice] = useState('')
  const [newEffectiveDate, setNewEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [adjustError, setAdjustError] = useState('')
  const [historyService, setHistoryService] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const getPriceInfo = (history) => {
    if (!history || history.length === 0) return { active: null, pending: null };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let active = null;
    let pending = null;

    const sorted = [...history].sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));
    
    for (const p of sorted) {
      const d = new Date(p.effectiveDate);
      d.setHours(0, 0, 0, 0);
      if (d <= today) {
        active = p;
      } else {
        pending = p; // Only the last future price (should only be 1 based on validation)
      }
    }
    return { active, pending };
  }

  const displayedServices = useMemo(() => {
    const activeServices = services.filter(s => s.status === 'active')
    return activeTab === 'all'
      ? activeServices.filter(s => s.priceHistory && s.priceHistory.length > 0)
      : activeServices.filter(s => !s.priceHistory || s.priceHistory.length === 0)
  }, [services, activeTab])

  const handleOpenAdjustModal = (service) => {
    setSelectedService(service)
    const { active, pending } = getPriceInfo(service.priceHistory)
    const basePrice = pending || active;

    setNewPrice(basePrice ? (basePrice.regularPrice || basePrice.price).replace(/\D/g, '') : '')
    setNewInsurancePrice(basePrice ? (basePrice.insurancePrice || '0').replace(/\D/g, '') : '')
    setNewEffectiveDate(new Date().toISOString().slice(0, 10))
    setAdjustError('')
    setIsAdjustModalOpen(true)
  }

  const handleSavePrice = async (e) => {
    e.preventDefault()
    
    const regularNum = Number(newPrice)
    const insuranceNum = Number(newInsurancePrice)

    if (!newPrice || isNaN(regularNum) || regularNum <= 0 || !newInsurancePrice || isNaN(insuranceNum) || insuranceNum < 0) {
      setAdjustError('Số tiền nhập vào phải là số nguyên dương')
      return
    }

    if (insuranceNum > regularNum) {
      setAdjustError('Giá BHYT chi trả không được phép lớn hơn Giá dịch vụ thường')
      return
    }

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const selectedDate = new Date(newEffectiveDate)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < todayDate) {
      setAdjustError('Ngày áp dụng giá mới phải lớn hơn hoặc bằng ngày hiện tại')
      return
    }

    const existingHistory = selectedService?.priceHistory || []
    
    // Check exact date conflict
    const exactConflict = existingHistory.some(h => {
      const hDate = new Date(h.effectiveDate)
      hDate.setHours(0, 0, 0, 0)
      return hDate.getTime() === selectedDate.getTime()
    })

    if (exactConflict) {
      setAdjustError('Thời gian hiệu lực này gây xung đột với một phiên bản giá đã được thiết lập trước đó. Vui lòng kiểm tra lại')
      return
    }

    // Check if there is already a pending price
    const hasPendingPrice = existingHistory.some(h => {
      const hDate = new Date(h.effectiveDate)
      hDate.setHours(0, 0, 0, 0)
      return hDate > todayDate
    })

    if (hasPendingPrice && selectedDate > todayDate) {
      setAdjustError('Thời gian hiệu lực này gây xung đột với một phiên bản giá đã được thiết lập trước đó. Vui lòng kiểm tra lại')
      return
    }

    try {
      const cleanPrice = regularNum.toLocaleString('vi-VN')
      const cleanInsurancePrice = insuranceNum.toLocaleString('vi-VN')
      const payload = {
        price: cleanPrice,
        insurancePrice: cleanInsurancePrice,
        effectiveDate: newEffectiveDate
      }

      await axios.post(`${API_URL}/${selectedService.id}/prices`, payload)
      fetchServices()
      setIsAdjustModalOpen(false)
      toast.success('Cấu hình giá dịch vụ thành công')
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
                <th>ĐƠN GIÁ BHYT (VND)</th>
                <th>NGÀY HIỆU LỰC</th>
                <th className="price-table__align-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {displayedServices.map((item) => {
                const { active, pending } = getPriceInfo(item.priceHistory)
                
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ fontWeight: 500 }}>
                      {item.name}
                      {pending && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '12px' }}>Có bản ghi chờ</span>}
                    </td>
                    <td style={{ fontWeight: 600 }}>{active ? (active.regularPrice || active.price) : 'Chưa thiết lập'}</td>
                    <td style={{ fontWeight: 600, color: '#059669' }}>{active ? (active.insurancePrice || '0') : 'Chưa thiết lập'}</td>
                    <td>{active ? new Date(active.effectiveDate).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="price-table__align-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {item.priceHistory?.length > 0 && <Button variant="secondary" onClick={() => { setHistoryService(item); setIsHistoryModalOpen(true); }} style={{ height: '32px', fontSize: '12px' }}>Lịch sử ({item.priceHistory.length})</Button>}
                      <Button variant="primary" onClick={() => handleOpenAdjustModal(item)} style={{ height: '32px', fontSize: '12px' }}>{item.priceHistory?.length > 0 ? 'Điều chỉnh giá' : 'Cấu hình giá'}</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalWrapper isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={selectedService?.priceHistory?.length > 0 ? "Điều chỉnh biểu giá" : "Cấu hình giá lần đầu"} footer={
        <>
          <button className="customer-btn-cancel" onClick={() => setIsAdjustModalOpen(false)}>Hủy</button>
          <PrimaryButton onClick={handleSavePrice}>{selectedService?.priceHistory?.length > 0 ? "Xác nhận cập nhật" : "Lưu bảng giá"}</PrimaryButton>
        </>
      }>
        <form onSubmit={handleSavePrice}>
          {adjustError && (
            <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 16px 0', padding: '8px', background: '#fef2f2', borderRadius: '4px', borderLeft: '3px solid #ef4444' }}>{adjustError}</p>
          )}
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>Dịch vụ: <strong>{selectedService?.name}</strong></p>
          {selectedService?.priceHistory?.length > 0 && (() => {
            const { active, pending } = getPriceInfo(selectedService.priceHistory);
            return (
              <div style={{ padding: '8px', background: '#f8fafc', fontSize: '12px', marginBottom: '16px' }}>
                {active && <div>Phiên bản đang áp dụng: <strong>{active.regularPrice || active.price} VND</strong> (từ {new Date(active.effectiveDate).toLocaleDateString('vi-VN')})</div>}
                {pending && <div style={{ color: '#d97706', marginTop: '4px' }}>Đang có 1 phiên bản chờ hiệu lực: <strong>{pending.regularPrice || pending.price} VND</strong> (từ {new Date(pending.effectiveDate).toLocaleDateString('vi-VN')})</div>}
              </div>
            );
          })()}
          <div style={{ marginBottom: '16px' }}>
            <label>Đơn giá thường mới (VND) *</label>
            <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Đơn giá BHYT chi trả (VND) *</label>
            <input type="number" value={newInsurancePrice} onChange={(e) => setNewInsurancePrice(e.target.value)} required />
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
            <span style={{ flex: 1 }}>ĐƠN GIÁ BHYT</span>
            <span style={{ width: '100px' }}>NGÀY HIỆU LỰC</span>
          </div>
          {[...(historyService?.priceHistory || [])].reverse().map((hist, index) => (
            <div key={index} style={{ display: 'flex', padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ width: '80px' }}>v{hist.version || index + 1}</span>
              <span style={{ flex: 1 }}>{hist.regularPrice || '0'} VND</span>
              <span style={{ flex: 1, color: '#059669' }}>{hist.insurancePrice || '0'} VND</span>
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

      <Toaster />
    </>
  )
}