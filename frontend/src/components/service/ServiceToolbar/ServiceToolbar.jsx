import Icon from '../../common/Icon/Icon'
import './ServiceToolbar.css'

export default function ServiceToolbar({ searchQuery, onSearchChange, selectedFilter, onFilterChange, onAddClick }) {
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
        <div className="service-toolbar__select-wrap">
          <Icon name="filter" className="service-toolbar__filter-icon" size={16} />
          <select 
            className="service-toolbar__select"
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="kham">Khám và tư vấn</option>
            <option value="rang-mieng">Vệ sinh răng miệng</option>
            <option value="tham-my">Thẩm mỹ</option>
            <option value="phau-thuat">Phẫu thuật</option>
          </select>
        </div>
      </div>

      <button type="button" className="service-toolbar__add" onClick={onAddClick}>
        <Icon name="plus" size={18} />
        Thêm dịch vụ mới
      </button>
    </div>
  )
}