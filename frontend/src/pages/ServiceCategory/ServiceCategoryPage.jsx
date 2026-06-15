import { useState, useMemo, useEffect } from 'react'
import { serviceApi } from '../../services/serviceApi'
import { ServiceToolbar } from '../../components/service/ServiceToolbar/ServiceToolbar'
import { ServiceCategoryBlock } from '../../components/service/ServiceCategoryBlock/ServiceCategoryBlock'
import { ServiceCategoryFormModal } from '../../components/service/ServiceCategoryFormModal/ServiceCategoryFormModal'
import { ServiceDetailModal } from '../../components/service/ServiceDetailModal/ServiceDetailModal'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Icon } from '../../components/common/Icon/Icon'
import toast, { Toaster } from 'react-hot-toast'
import './ServiceCategoryPage.css'

export function ServiceCategoryPage() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const data = await serviceApi.getAllServices()
      setServices(data.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Không thể tải danh sách dịch vụ')
    } finally {
      setIsLoading(false)
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  // State form
  const [newServiceId, setNewServiceId] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceCategory, setNewServiceCategory] = useState('Khám bệnh')
  const [newServiceDepartment, setNewServiceDepartment] = useState('Khoa Khám Bệnh')
  const [newServiceDuration, setNewServiceDuration] = useState('30')
  const [newServiceDescription, setNewServiceDescription] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editServiceId, setEditServiceId] = useState('')
  const [formError, setFormError] = useState('')

  const [viewServiceItem, setViewServiceItem] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleViewDetail = (item) => {
    setViewServiceItem(item)
    setIsDetailModalOpen(true)
  }

  // Suggest Code
  useEffect(() => {
    if (isModalOpen && !isEditMode && newServiceCategory) {
      const fetchSuggestedCode = async () => {
        try {
          const data = await serviceApi.getSuggestedCode(newServiceCategory)
          if (data && data.suggestedCode) {
            setNewServiceId(data.suggestedCode)
          }
        } catch (err) {
          console.error('Lỗi khi lấy gợi ý mã dịch vụ:', err)
        }
      }
      fetchSuggestedCode()
    }
  }, [isModalOpen, isEditMode, newServiceCategory])

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
  }, [services, searchQuery, filter, showInactive])

  const groupedCategories = useMemo(() => {
    const groups = {
      'Khám bệnh': [], 'Xét nghiệm': [], 'CĐHA': [], 'Phẫu thuật': []
    }
    filteredServices.forEach(s => {
      const cat = s.category || 'Khám bệnh'
      if (groups[cat]) groups[cat].push(s)
      else groups[cat] = [s]
    })
    return groups
  }, [filteredServices])


  const handleDeleteService = (id) => {
    const item = services.find(s => s.id === id)
    if (!item) return

    toast((t) => (
      <div className="confirm-toast">
        <div className="confirm-toast__body">
          <p className="confirm-toast__text">Bạn có chắc chắn muốn ngừng cung cấp dịch vụ y tế này không?</p>
          <p className="confirm-toast__subtext">Dịch vụ sẽ không hiển thị khi bác sĩ chỉ định.</p>
        </div>
        <div className="confirm-toast__footer">
          <button className="confirm-toast__btn confirm-toast__btn--cancel" onClick={() => toast.dismiss(t.id)}>Hủy</button>
          <button className="confirm-toast__btn confirm-toast__btn--confirm" onClick={async () => {
            toast.dismiss(t.id)
            try {
              await serviceApi.deleteService(id)
              fetchServices()
              toast.success('Xóa danh mục dịch vụ thành công')
            } catch (err) {
              console.error(err)
              toast.error('Có lỗi xảy ra khi xóa dịch vụ')
            }
          }}>Xác nhận</button>
        </div>
      </div>
    ), { duration: 8000, position: 'top-right' })
  }

  const handleOpenAddModal = () => {
    setIsEditMode(false)
    setNewServiceId('')
    setNewServiceName('')
    setNewServiceCategory('Khám bệnh')
    setNewServiceDepartment('Khoa Khám Bệnh')
    setNewServiceDuration('30')
    setNewServiceDescription('')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setIsEditMode(true)
    setEditServiceId(item.id)
    setNewServiceId(item.id)
    setNewServiceName(item.name || '')
    setNewServiceCategory(item.category || 'Khám bệnh')
    setNewServiceDepartment(item.department || 'Khoa Khám Bệnh')
    setNewServiceDuration(item.duration?.toString() || '30')
    setNewServiceDescription(item.description || '')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleRestoreService = async (id) => {
    try {
      await serviceApi.restoreService(id)
      fetchServices()
      toast.success('Khôi phục dịch vụ thành công')
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra khi khôi phục dịch vụ')
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!newServiceName.trim()) {
      setFormError('Vui lòng nhập tên dịch vụ')
      return
    }
    
    const durationNum = Number(newServiceDuration);
    if (isNaN(durationNum) || durationNum <= 0 || !Number.isInteger(durationNum)) {
      setFormError('Thời gian trung bình phải là số nguyên dương (phút)')
      return
    }

    try {
      const payload = {
        id: isEditMode ? editServiceId : newServiceId.trim(),
        name: newServiceName.trim(),
        category: newServiceCategory,
        department: newServiceDepartment,
        duration: Number(newServiceDuration) || 30,
        description: newServiceDescription.trim()
      }

      if (isEditMode) {
        await serviceApi.updateService(editServiceId, payload)
        toast.success('Cập nhật thông tin dịch vụ thành công')
      } else {
        await serviceApi.createService(payload)
        toast.success('Thêm mới dịch vụ thành công. Vui lòng thiết lập bảng giá cho dịch vụ này')
      }
      fetchServices()
      setIsModalOpen(false)
    } catch (err) {
      if (err.response?.status === 409) {
        const errMsg = 'Tên dịch vụ này đang được sử dụng. Vui lòng đặt tên khác hoặc thêm hậu tố để phân biệt'
        setFormError(errMsg)
        toast.error(errMsg)
      } else {
        const msg = err.response?.data?.message || `Lỗi kết nối server khi ${isEditMode ? 'cập nhật' : 'tạo'} dịch vụ`
        setFormError(msg)
        toast.error(msg)
      }
    }
  }

  const activeCount = useMemo(() => services.filter(s => s.status === 'active').length, [services])
  const categoriesCount = useMemo(() => new Set(services.filter(s => s.status === 'active').map(s => s.category)).size, [services])
  const avgDuration = useMemo(() => {
    if (filteredServices.length === 0) return 0;
    const total = filteredServices.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
    return Math.round(total / filteredServices.length);
  }, [filteredServices])

  return (
    <>
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
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} style={{ marginRight: '8px' }} />
              Hiển thị dịch vụ đã ngừng hoạt động
            </label>
          </div>
        </header>

        <div className="service-stats">
          <div className="service-stats__card"><p className="service-stats__label">Tổng dịch vụ hiển thị</p><p className="service-stats__value service-stats__value--blue">{filteredServices.length}</p></div>
          <div className="service-stats__card"><p className="service-stats__label">Đang hoạt động</p><p className="service-stats__value service-stats__value--green">{activeCount}</p></div>
          <div className="service-stats__card"><p className="service-stats__label">Số danh mục</p><p className="service-stats__value">{categoriesCount}</p></div>
          <div className="service-stats__card"><p className="service-stats__label">Thời gian TB</p><p className="service-stats__value">{avgDuration} phút</p></div>
        </div>

        <div className="service-categories-list">
          {Object.entries(groupedCategories).map(([catName, list]) => {
            if (filter !== 'all' && filter !== catName) return null
            return (
              <ServiceCategoryBlock key={catName} categoryName={catName} itemsCount={list.length}>
                {list.length > 0 ? (
                  list.map((item) => (
                    <div key={item.id} onDoubleClick={() => handleViewDetail(item)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #f1f5f9', fontSize: '13.5px', color: '#334155', cursor: 'pointer' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                        <span style={{ color: '#94a3b8' }}>|</span><span style={{ color: '#64748b' }}>{item.id}</span>
                        <span style={{ color: '#94a3b8' }}>|</span><span style={{ color: '#64748b', fontSize: '13px' }}>{item.department || 'Khoa Khám Bệnh'}</span>
                        <span style={{ color: '#94a3b8' }}>|</span><span style={{ fontSize: '12px', color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>{item.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}</span>
                        <span style={{ color: '#94a3b8' }}>|</span><span style={{ color: '#64748b', fontSize: '13px' }}>{item.duration || 30} phút</span>
                      </span>
                      {!showInactive ? (
                        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="service-delete-btn" onClick={() => handleViewDetail(item)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Xem chi tiết"><Icon name="eye" size={14} /></button>
                          <button type="button" className="service-delete-btn" onClick={() => handleOpenEditModal(item)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Sửa dịch vụ"><Icon name="edit" size={14} /></button>
                          <button type="button" className="service-delete-btn" onClick={() => handleDeleteService(item.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }} title="Xóa dịch vụ"><Icon name="trash" size={14} /></button>
                        </div>
                      ) : (
                        <div onClick={(e) => e.stopPropagation()}>
                          <PrimaryButton onClick={() => handleRestoreService(item.id)} style={{ fontSize: '12px', padding: '6px 12px' }}>Khôi phục</PrimaryButton>
                        </div>
                      )}
                    </div>
                  ))
                ) : (<p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0' }}>Không tìm thấy dịch vụ nào.</p>)}
              </ServiceCategoryBlock>
            )
          })}
        </div>
      </div>

      <ServiceCategoryFormModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formError={formError}
        newServiceId={newServiceId}
        newServiceName={newServiceName}
        newServiceCategory={newServiceCategory}
        newServiceDepartment={newServiceDepartment}
        newServiceDuration={newServiceDuration}
        newServiceDescription={newServiceDescription}
        setNewServiceId={setNewServiceId}
        setNewServiceName={setNewServiceName}
        setNewServiceCategory={setNewServiceCategory}
        setNewServiceDepartment={setNewServiceDepartment}
        setNewServiceDuration={setNewServiceDuration}
        setNewServiceDescription={setNewServiceDescription}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddService}
      />
      <ServiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        service={viewServiceItem}
      />
      <Toaster />
    </>
  )
}