import { ROLE_OPTIONS, STATUS_OPTIONS } from '../../constants/staff';

export function StaffToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onExport,
  onAdd,
}) {
  return (
    <div className="staff-toolbar">
      <div className="staff-toolbar__search">
        <span className="staff-toolbar__search-icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="search"
          className="staff-toolbar__input"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Tìm kiếm nhân viên"
        />
      </div>

      <select
        className="staff-toolbar__select"
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        aria-label="Lọc theo vai trò"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className="staff-toolbar__select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Lọc theo trạng thái"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button type="button" className="staff-btn staff-btn--outline" onClick={onExport}>
        <ExportIcon />
        Xuất Excel
      </button>

      <button type="button" className="staff-btn staff-btn--primary" onClick={onAdd}>
        <PlusIcon />
        Thêm nhân viên mới
      </button>
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
