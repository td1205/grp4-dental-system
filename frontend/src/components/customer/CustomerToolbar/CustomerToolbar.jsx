import Icon from '../../common/Icon/Icon'
import './CustomerToolbar.css'

export default function CustomerToolbar({ searchQuery, onSearchChange, onAddClick }) {
  return (
    <div className="customer-toolbar">
      <div className="customer-toolbar__search-wrap">
        <Icon name="search" className="customer-toolbar__search-icon" size={18} />
        <input
          type="search"
          className="customer-toolbar__search"
          placeholder="Tìm kiếm khách hàng theo tên, SĐT, CCCD..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm khách hàng"
        />
      </div>
      <button type="button" className="customer-toolbar__add" onClick={onAddClick}>
        <Icon name="plus" className="customer-toolbar__add-icon" size={18} />
        Thêm khách hàng mới
      </button>
    </div>
  )
}