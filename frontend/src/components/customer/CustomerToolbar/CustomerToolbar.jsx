import { Icon } from '../../common/Icon/Icon'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import { LayoutGrid, List } from 'lucide-react';
import './CustomerToolbar.css'

export function CustomerToolbar({ searchQuery, onSearchChange, onAddClick, viewMode, onViewModeChange }) {
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
      <div className="view-toggle-group" style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          style={{
            padding: '8px 12px',
            background: viewMode === 'grid' ? 'var(--color-bg-page)' : '#fff',
            color: viewMode === 'grid' ? 'var(--color-link-active)' : 'var(--color-text-sub)',
            border: 'none',
            borderRight: '1px solid var(--color-border)',
            cursor: 'pointer'
          }}
          aria-label="Dạng lưới"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('table')}
          style={{
            padding: '8px 12px',
            background: viewMode === 'table' ? 'var(--color-bg-page)' : '#fff',
            color: viewMode === 'table' ? 'var(--color-link-active)' : 'var(--color-text-sub)',
            border: 'none',
            cursor: 'pointer'
          }}
          aria-label="Dạng danh sách"
        >
          <List size={18} />
        </button>
      </div>

      <PrimaryButton onClick={onAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon name="plus" size={18} />
        Thêm khách hàng mới
      </PrimaryButton>
    </div>
  )
}