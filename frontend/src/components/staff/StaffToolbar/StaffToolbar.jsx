import Icon from '../../common/Icon/Icon'
import './StaffToolbar.css'

export default function StaffToolbar({ searchQuery, onSearchChange, onAddClick }) {
  return (
    <div className="staff-toolbar">
      <div className="staff-toolbar__search-wrap">
        <Icon name="search" className="staff-toolbar__search-icon" size={18} />
        <input
          type="search"
          className="staff-toolbar__search"
          placeholder="Tìm kiếm nhân viên..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm nhân viên"
        />
      </div>
      <button type="button" className="staff-toolbar__add" onClick={onAddClick}>
        <Icon name="plus" className="staff-toolbar__add-icon" size={18} />
        Thêm nhân viên mới
      </button>
    </div>
  )
}
