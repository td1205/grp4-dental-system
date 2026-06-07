import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import ServiceToolbar from '../../components/service/ServiceToolbar/ServiceToolbar'
import ServiceCategoryBlock from '../../components/service/ServiceCategoryBlock/ServiceCategoryBlock'
import Icon from '../../components/common/Icon/Icon'
import './ServiceCategoryPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/services/categories'

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

const CATEGORY_MAP = {
  kham: 'Khám và tư vấn',
  'rang-mieng': 'Vệ sinh răng miệng',
  'tham-my': 'Thẩm mỹ',
  'phau-thuat': 'Phẫu thuật'
}

export default function ServiceCategoryPage() {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('dental_services')
    if (saved) return JSON.parse(saved)
    localStorage.setItem('dental_services', JSON.stringify(SEED_SERVICES))
    return SEED_SERVICES
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // State form thêm dịch vụ mới
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceCategory, setNewServiceCategory] = useState('Khám và tư vấn')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceBhyt, setNewServiceBhyt] = useState('')
  const [newServiceDate, setNewServiceDate] = useState('2026-01-01')
  const [formError, setFormError] = useState('')

  // Lấy danh sách dịch vụ active và lọc theo từ khóa tìm kiếm, bộ lọc
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    
    // Chỉ lấy dịch vụ đang hoạt động
    let list = services.filter(s => s.status === 'active')
    
    if (filter !== 'all') {
      const categoryName = CATEGORY_MAP[filter]
      list = list.filter(s => s.category === categoryName)
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
  const handleDeleteService = (id) => {
    const item = services.find(s => s.id === id)
    if (!item) return
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${item.name}"? Dịch vụ sẽ ngừng hoạt động và ẩn khỏi danh sách.`)) {
      const updated = services.map(s => s.id === id ? { ...s, status: 'inactive' } : s)
      setServices(updated)
      localStorage.setItem('dental_services', JSON.stringify(updated))
    }
  }

  // Mở modal thêm dịch vụ mới
  const handleOpenAddModal = () => {
    setNewServiceName('')
    setNewServiceCategory('Khám và tư vấn')
    setNewServicePrice('')
    setNewServiceBhyt('')
    setNewServiceDate('2026-01-01')
    setFormError('')
    setIsModalOpen(true)
  }

  // Lưu dịch vụ mới
  const handleAddService = (e) => {
    e.preventDefault()
    if (!newServiceName.trim()) {
      setFormError('Vui lòng nhập tên dịch vụ')
      return
    }

    // Tự sinh mã dịch vụ tăng dần
    const maxNum = services.reduce((max, s) => {
      const num = parseInt(s.id.replace('DV', ''), 10)
      return !isNaN(num) && num > max ? num : max
    }, 0)
    const nextId = `DV${String(maxNum + 1).padStart(3, '0')}`

    // Lịch sử giá (nếu điền đơn giá thường)
    const priceHistory = []
    if (newServicePrice.trim()) {
      priceHistory.push({
        version: 1,
        price: Number(newServicePrice.replace(/\D/g, '')).toLocaleString('vi-VN'),
        bhyt: newServiceBhyt.trim() ? Number(newServiceBhyt.replace(/\D/g, '')).toLocaleString('vi-VN') : '0',
        effectiveDate: newServiceDate || new Date().toISOString().slice(0, 10)
      })
    }

    const newService = {
      id: nextId,
      name: newServiceName.trim(),
      category: newServiceCategory,
      status: 'active',
      priceHistory
    }

    const updated = [...services, newService]
    setServices(updated)
    localStorage.setItem('dental_services', JSON.stringify(updated))
    setIsModalOpen(false)
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
            // Nếu lọc danh mục cụ thể hoặc không có dịch vụ nào, chỉ hiển thị những cái khớp
            if (filter !== 'all' && CATEGORY_MAP[filter] !== catName) return null

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
                      <span>
                        <strong style={{ color: '#0f172a', marginRight: '6px' }}>{item.id}</strong> - {item.name}
                        {item.priceHistory && item.priceHistory.length > 0 ? (
                          <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: '8px', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                            Đã cấu hình giá
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#d97706', marginLeft: '8px', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                            Chưa có giá
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="service-delete-btn"
                        onClick={() => handleDeleteService(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Xóa dịch vụ"
                      >
                        <Icon name="trash" size={14} />
                      </button>
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

      {/* Modal Thêm Dịch Vụ Mới */}
      {isModalOpen && (
        <div className="service-modal-overlay">
          <div className="service-modal">
            <header className="service-modal__header">
              <h2>Thêm dịch vụ mới</h2>
              <button type="button" className="service-modal__close-btn" onClick={() => setIsModalOpen(false)}>
                <Icon name="x" size={18} />
              </button>
            </header>
            
            <form onSubmit={handleAddService}>
              <div className="service-modal__body">
                {formError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '0 0 8px 0' }}>{formError}</p>
                )}
                
                <div className="service-modal__field">
                  <label htmlFor="svc-name">Tên dịch vụ <span className="required" style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    id="svc-name"
                    type="text"
                    placeholder="Ví dụ: Trám răng thẩm mỹ công nghệ mới"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    required
                  />
                </div>

                <div className="service-modal__field">
                  <label htmlFor="svc-category">Danh mục dịch vụ</label>
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

                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>THIẾT LẬP GIÁ KHỞI TẠO (TÙY CHỌN)</p>
                  
                  <div className="service-modal__field">
                    <label htmlFor="svc-price">Đơn giá thường (VND)</label>
                    <input
                      id="svc-price"
                      type="number"
                      placeholder="Ví dụ: 500000"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                    />
                  </div>

                  <div className="service-modal__field">
                    <label htmlFor="svc-bhyt">Đơn giá BHYT chi trả (VND)</label>
                    <input
                      id="svc-bhyt"
                      type="number"
                      placeholder="Ví dụ: 300000"
                      value={newServiceBhyt}
                      onChange={(e) => setNewServiceBhyt(e.target.value)}
                    />
                  </div>

                  <div className="service-modal__field">
                    <label htmlFor="svc-date">Ngày bắt đầu hiệu lực</label>
                    <input
                      id="svc-date"
                      type="date"
                      value={newServiceDate}
                      onChange={(e) => setNewServiceDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <footer className="service-modal__footer">
                <button type="button" className="customer-btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="customer-btn-submit">Lưu lại</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}