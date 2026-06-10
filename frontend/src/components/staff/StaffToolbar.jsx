import { ROLE_OPTIONS, STATUS_OPTIONS } from '../../constants/staff';
import { MacDropdown } from '../common/MacDropdown/MacDropdown.jsx';
import { Input } from '../ui/Input/Input.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { LayoutGrid, List } from 'lucide-react';

export function StaffToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onAdd,
  onExport,
  viewMode,
  onViewModeChange,
}) {
  const SORT_OPTIONS = [
    { value: 'createdAt:desc', label: 'Mới nhất' },
    { value: 'createdAt:asc', label: 'Cũ nhất' },
    { value: 'fullName:asc', label: 'Tên: A-Z' },
    { value: 'fullName:desc', label: 'Tên: Z-A' },
    { value: 'role:asc', label: 'Theo chức vụ' },
  ];

  return (
    <div className="staff-toolbar">
      <div className="staff-toolbar__search">
        <Input
          icon={<SearchIcon />}
          type="search"
          placeholder="Tìm kiếm nhân viên..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm nhân viên"
        />
      </div>

      <MacDropdown
        options={ROLE_OPTIONS}
        value={role}
        onChange={onRoleChange}
        placeholder="Tất cả vai trò"
        ariaLabel="Lọc theo vai trò"
      />

      <MacDropdown
        options={STATUS_OPTIONS}
        value={status}
        onChange={onStatusChange}
        placeholder="Tất cả trạng thái"
        ariaLabel="Lọc theo trạng thái"
      />

      <MacDropdown
        options={SORT_OPTIONS}
        value={sort}
        onChange={onSortChange}
        ariaLabel="Sắp xếp nhân viên"
      />

      <Button variant="secondary" onClick={onExport}>
        <ExportIcon />
        Xuất Excel
      </Button>

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

      <Button variant="primary" onClick={onAdd}>
        <PlusIcon />
        Thêm nhân viên mới
      </Button>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
