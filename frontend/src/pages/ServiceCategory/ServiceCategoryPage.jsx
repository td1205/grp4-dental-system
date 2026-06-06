import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import ServiceToolbar from '../../components/service/ServiceToolbar/ServiceToolbar'
import ServiceCategoryBlock from '../../components/service/ServiceCategoryBlock/ServiceCategoryBlock'
import './ServiceCategoryPage.css'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'

const ACTIVE_PATH = '/services/categories'

export default function ServiceCategoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

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
            onAddClick={() => console.log('Thêm dịch vụ mới')}
          />
        </header>

        <div className="service-stats">
          <div className="service-stats__card">
            <p className="service-stats__label">Tổng dịch vụ</p>
            <p className="service-stats__value service-stats__value--blue">5</p>
          </div>
          <div className="service-stats__card">
            <p className="service-stats__label">Đang hoạt động</p>
            <p className="service-stats__value service-stats__value--green">5</p>
          </div>
          <div className="service-stats__card">
            <p className="service-stats__label">Danh mục</p>
            <p className="service-stats__value">4</p>
          </div>
          <div className="service-stats__card">
            <p className="service-stats__label">Thời gian TB</p>
            <p className="service-stats__value">69 phút</p>
          </div>
        </div>

        <div className="service-categories-list">
          <ServiceCategoryBlock categoryName="Khám và tư vấn" itemsCount={1}>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>• Khám tổng quát và lập kế hoạch điều trị</div>
          </ServiceCategoryBlock>

          <ServiceCategoryBlock categoryName="Vệ sinh răng miệng" itemsCount={1}>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>• Cạo vôi răng và đánh bóng</div>
          </ServiceCategoryBlock>

          <ServiceCategoryBlock categoryName="Thẩm mỹ" itemsCount={1}>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>• Tẩy trắng răng công nghệ cao</div>
          </ServiceCategoryBlock>

          <ServiceCategoryBlock categoryName="Phẫu thuật" itemsCount={2}>
            <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>• Nhổ răng khôn (mọc ngầm/lệch)</div>
            <div style={{ fontSize: '13px', color: '#4b5563' }}>• Phẫu thuật cắt chóp răng</div>
          </ServiceCategoryBlock>
        </div>
      </div>
    </DashboardLayout>
  )
}