import { Icon } from '../../common/Icon/Icon'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import { MacDropdown } from '../../common/MacDropdown/MacDropdown'
import './ServiceToolbar.css'

export function ServiceToolbar({ searchQuery, onSearchChange, selectedFilter, onFilterChange, onAddClick }) {
  return (
    <div className="service-toolbar">
      <div className="service-toolbar__left">
        <div className="service-toolbar__search-wrap">
          <Icon name="search" className="service-toolbar__search-icon" size={18} />
          <input
            type="search"
            className="service-toolbar__search"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Dropdown bộ lọc danh mục */}
        <div style={{ width: '220px' }}>
          <MacDropdown
            options={[
              { value: 'all', label: 'Tất cả danh mục' },
              { value: 'Khám bệnh', label: 'Khám bệnh' },
              { value: 'Xét nghiệm', label: 'Xét nghiệm' },
              { value: 'CĐHA', label: 'CĐHA' },
              { value: 'Phẫu thuật', label: 'Phẫu thuật' },
            ]}
            value={selectedFilter}
            onChange={onFilterChange}
            ariaLabel="Lọc danh mục"
          />
        </div>
      </div>

      <PrimaryButton onClick={onAddClick}>
        <Icon name="plus" size={18} style={{ marginRight: '8px' }} />
        Thêm dịch vụ mới
      </PrimaryButton>
    </div>
  )
}