import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import ServiceToolbar from '../../components/service/ServiceToolbar/ServiceToolbar'
import ServiceCategoryBlock from '../../components/service/ServiceCategoryBlock/ServiceCategoryBlock'
import ModalWrapper from '../../components/common/ModalWrapper/ModalWrapper'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import Icon from '../../components/common/Icon/Icon'
import ToastStack from '../../components/common/ToastStack/ToastStack'
import './ServiceCategoryPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/services/categories'

const API_URL = 'http://localhost:5000/api/services';

export default function ServiceCategoryPage() {
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
      alert('Không thể tải danh sách dịch vụ')
    } finally {
      setIsLoading(false)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  // State form thêm dịch vụ mới
  const [newServiceId, setNewServiceId] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceCategory, setNewServiceCategory] = useState('Khám và tư vấn')
  const [newServiceDuration, setNewServiceDuration] = useState('30')
  const [newServiceDescription, setNewServiceDescription] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editServiceId, setEditServiceId] = useState('')
  const [formError, setFormError] = useState('')

  // Lấy danh sách dịch vụ active và lọc theo từ khóa tìm kiếm, bộ lọc
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    
    let list = showInactive 
      ? services.filter(s => s.status === 'inactive')
      : services.filter(s => s.status === 'active')
    
    if (filter !== 'all') {
      list = list.filter(s => s.category === filter)
    }
    
    if (q) {
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
    }
    
    return list
  }, [services, searchQuery, filter])

  // Phân nhóm dịch vụ theo danh mục để hiển thị Accordion
  const groupedCategories = useMemo(() => {
    const groups = {
      'Khám và tư vấn': [],
      'Vệ sinh răng miệng': [],
      'Thẩm mỹ': [],
      'Phẫu thuật': []
    }
    
    filteredServices.forEach(s => {
      if (groups[s.category]) {
        groups[s.category].push(s)
      } else {
        groups[s.category] = [s]
      }
    })
    
    return groups
  }, [filteredServices])

  // Xóa dịch vụ (Xóa logic)
  const handleDeleteService = async (id) => {
    const item = services.find(s => s.id === id)
    if (!item) return
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${item.name}"? Dịch vụ sẽ ngừng hoạt động và ẩn khỏi danh sách.`)) {
      try {
        await axios.delete(`${API_URL}/${id}`)
        fetchServices() // Reload data
      } catch (err) {
        console.error(err)
        alert('Có lỗi xảy ra khi xóa dịch vụ')
      }
    }
  }

  // Mở modal thêm dịch vụ mới
  const handleOpenAddModal = () => {
    setIsEditMode(false)
    setNewServiceId('')
    setNewServiceName('')
    setNewServiceCategory('Khám và tư vấn')
    setNewServiceDuration('30')
    setNewServiceDescription('')
    setFormError('')
    setIsModalOpen(true)
  }

  // Mở modal sửa dịch vụ
  const handleOpenEditModal = (item) => {
    setIsEditMode(true)
    setEditServiceId(item.id)
    setNewServiceId(item.id)
    setNewServiceName(item.name || '')
    setNewServiceCategory(item.category || 'Khám và tư vấn')
    setNewServiceDuration(item.duration?.toString() || '30')
    setNewServiceDescription(item.description || '')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleRestoreService = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/restore`)
      fetchServices()
      addToast('Khôi phục dịch vụ thành công')
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi khôi phục dịch vụ')
    }
  }

  // Lưu dịch vụ mới hoặc cập nhật
  const handleAddService = async (e) => {
    e.preventDefault()
    if (!newServiceName.trim()) {
      setFormError('Vui lòng nhập tên dịch vụ')
      return
    }

    try {
      const payload = {
        id: isEditMode ? editServiceId : newServiceId.trim(),
        name: newServiceName.trim(),
        category: newServiceCategory,
        duration: Number(newServiceDuration) || 30,
        description: newServiceDescription.trim()
      }

      if (isEditMode) {
        await axios.put(`${API_URL}/${editServiceId}`, payload)
        addToast('Cập nhật thông tin dịch vụ thành công')
      } else {
        await axios.post(API_URL, payload)
        addToast('Thêm mới dịch vụ thành công. Vui lòng thiết lập bảng giá cho dịch vụ này')
      }
      fetchServices()
      setIsModalOpen(false)
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError('Mã dịch vụ đã tồn tại trong hệ thống')
        addToast('Mã dịch vụ đã tồn tại trong hệ thống', 'error')
      } else {
        setFormError(`Lỗi kết nối server khi ${isEditMode ? 'cập nhật' : 'tạo'} dịch vụ`)
      }
    }
  }

  // Thống kê
  const activeCount = useMemo(() => services.filter(s => s.status === 'active').length, [services])
  const categoriesCount = useMemo(() => {
    const active = services.filter(s => s.status === 'active')
    const unique = new Set(active.map(s => s.category))
    return unique.size
  }, [services])

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="service-page">
        <header className="service-page__header">
          <h1 className="service-page__title">Danh mục dịch vụ</h1>
          <ServiceToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilter={filter}
            onFilterChange={setFilter}
            onAddClick={handleOpenAddModal}
          />
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer', color: '#64748b' }}>
              <input 
                type="checkbox" 
                checked={showInactive} 
                onChange={(e) => setShowInactive(e.target.checked)} 
                style={{ marginRight: '8px' }} 
              />
              Hiển thị dịch vụ đã ngừng hoạt động
            </label>
          </div>
        </header>

        <div className="service-stats">
          <div className="service-stats__card">
            <p className="service-stats__label">Tổng dịch vụ hiển thị</p>
            <p className="service-stats__value service-stats__value--blue">{filteredServices.length}</p>
          </div>
          <div className="service-stats__card">
            <p className="service-stats__label">Đang hoạt động hệ thống</p>
            <p className="service-stats__value service-stats__value--green">{activeCount}</p>
          </div>
          <div className="service-stats__card">
            <p className="service-stats__label">Số danh mục</p>
            <p className="service-stats__value">{categoriesCount}</p>
          </div>
          <div className="service-stats__card">
            <p className="service-stats__label">Thời gian TB</p>
            <p className="service-stats__value">45 phút</p>
          </div>
        </div>

        <div className="service-categories-list">
          {Object.entries(groupedCategories).map(([catName, list]) => {
            if (filter !== 'all' && filter !== catName) return null

            return (
              <ServiceCategoryBlock key={catName} categoryName={catName} itemsCount={list.length}>
                {list.length > 0 ? (
                  list.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 4px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '13.5px',
                        color: '#334155'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                        <span style={{ color: '#94a3b8' }}>|</span>
                        <span style={{ color: '#64748b' }}>{item.id}</span>
                        <span style={{ color: '#94a3b8' }}>|</span>
                        <span style={{ fontSize: '12px', color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
                          {item.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                        </span>
                        <span style={{ color: '#94a3b8' }}>|</span>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>{item.duration || 30} phút</span>
                      </span>
                      {!showInactive ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="service-delete-btn"
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            title="Liên kết"
                          >
                            <Icon name="link" size={14} />
                          </button>
                          <button
                            type="button"
                            className="service-delete-btn"
                            onClick={() => handleOpenEditModal(item)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            title="Sửa dịch vụ"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                          <button
                            type="button"
                            className="service-delete-btn"
                            onClick={() => handleDeleteService(item.id)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            title="Xóa dịch vụ"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      ) : (
                        <PrimaryButton 
                          onClick={() => handleRestoreService(item.id)}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Khôi phục
                        </PrimaryButton>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0' }}>Không tìm thấy dịch vụ nào trong danh mục này.</p>
                )}
              </ServiceCategoryBlock>
            )
          })}
        </div>
      </div>

      {/* Modal Thêm/Sửa Dịch Vụ Mới */}
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Chỉnh sửa thông tin dịch vụ" : "Thêm dịch vụ mới"}
        footer={
          <>
            <button type="button" className="customer-btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
            <PrimaryButton onClick={handleAddService}>{isEditMode ? "Cập nhật dịch vụ" : "Lưu dịch vụ"}</PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleAddService} id="add-service-form">
          <div className="service-modal__body" style={{ padding: 0 }}>
            {formError && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0', padding: '8px', background: '#fef2f2', borderRadius: '4px', borderLeft: '3px solid #ef4444' }}>{formError}</p>
            )}
            
            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="svc-id" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Mã dịch vụ {isEditMode ? '' : <span className="required" style={{ color: '#dc2626' }}>*</span>}</label>
              <input
                id="svc-id"
                type="text"
                placeholder="Ví dụ: DV001 (Để trống hệ thống sẽ tự sinh)"
                value={newServiceId}
                onChange={(e) => setNewServiceId(e.target.value)}
                disabled={isEditMode}
                title={isEditMode ? "Không thể sửa mã dịch vụ" : ""}
              />
            </div>

            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="svc-name" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Tên dịch vụ <span className="required" style={{ color: '#dc2626' }}>*</span></label>
              <input
                id="svc-name"
                type="text"
                placeholder="Ví dụ: Trám răng thẩm mỹ công nghệ mới"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                required
              />
            </div>

            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="svc-category" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Danh mục dịch vụ</label>
              <select
                id="svc-category"
                value={newServiceCategory}
                onChange={(e) => setNewServiceCategory(e.target.value)}
              >
                <option value="Khám và tư vấn">Khám và tư vấn</option>
                <option value="Vệ sinh răng miệng">Vệ sinh răng miệng</option>
                <option value="Thẩm mỹ">Thẩm mỹ</option>
                <option value="Phẫu thuật">Phẫu thuật</option>
              </select>
            </div>

            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="svc-duration" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Thời gian điều trị (phút)</label>
              <input
                id="svc-duration"
                type="number"
                placeholder="30"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
              />
            </div>

            <div className="service-modal__field" style={{ marginBottom: '16px' }}>
              <label htmlFor="svc-desc" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Mô tả chi tiết</label>
              <textarea
                id="svc-desc"
                placeholder="Nhập mô tả cho dịch vụ..."
                value={newServiceDescription}
                onChange={(e) => setNewServiceDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
      
      <ToastStack toasts={toasts} />
    </DashboardLayout>
  )
}