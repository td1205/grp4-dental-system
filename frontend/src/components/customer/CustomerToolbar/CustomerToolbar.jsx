import Icon from '../../common/Icon/Icon'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
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
      <PrimaryButton onClick={onAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon name="plus" size={18} />
        Thêm khách hàng mới
      </PrimaryButton>
    </div>
  )
}