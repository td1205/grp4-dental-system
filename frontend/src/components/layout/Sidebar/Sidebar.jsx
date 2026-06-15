import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Icon } from '../../common/Icon/Icon'
import { AuditLogModal } from '../../common/AuditLogModal/AuditLogModal'
import './Sidebar.css'

const NAV_ICON_MAP = {
  users: 'users',
  services: 'briefcase',
  schedule: 'calendar',
  salary: 'circle-dollar-sign',
  stats: 'bar-chart-3',
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// SỬA HÀM NÀY: Duyệt qua tất cả các mục, mục nào có children thì mở hết
function getInitialExpandedIds(navItems, activePath) {
  const ids = new Set()
  navItems.forEach((item) => {
    // CHỈ mở rộng nhóm menu nào có chứa trang con đang được kích hoạt (active)
    if (item.children?.some((child) => child.path === activePath)) {
      ids.add(item.id)
    }
  })
  return ids
}

export function Sidebar({ navItems, activePath, user }) {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState(() => {
    const saved = sessionStorage.getItem('sidebarExpandedIds');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    return getInitialExpandedIds(navItems, activePath);
  })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)

  // Lưu state vào sessionStorage
  useEffect(() => {
    sessionStorage.setItem('sidebarExpandedIds', JSON.stringify([...expandedIds]));
  }, [expandedIds]);

  // Tự động bung mở menu khi user truy cập link trực tiếp
  useEffect(() => {
    const currentActiveIds = getInitialExpandedIds(navItems, activePath);
    setExpandedIds(prev => {
      const next = new Set(prev);
      let changed = false;
      currentActiveIds.forEach(id => {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activePath, navItems]);

  const toggleExpanded = (itemId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <div className="sidebar__logo">Dental Care</div>
          <div className="sidebar__tagline">Hệ thống quản lý</div>
          <div className="sidebar__logo-icon">D</div>
        </div>
        <button 
          className="sidebar__toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={24} color="currentColor" />
          ) : (
            <PanelLeftClose size={24} color="currentColor" />
          )}
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Điều hướng chính">
        <ul className="sidebar__nav-list">
          {navItems?.map((item) => {
            const hasChildren = item.children?.length > 0
            const isExpanded = hasChildren && expandedIds.has(item.id)
            const isActive = !hasChildren && item.path === activePath

            return (
              <li key={item.id} className="sidebar__nav-item">
                <button
                  type="button"
                  className={`sidebar__nav-link${isActive ? ' sidebar__nav-link--pressed' : ''}`}
                  aria-expanded={hasChildren ? isExpanded : undefined}
                  onClick={
                    hasChildren
                      ? () => toggleExpanded(item.id)
                      : () => {
                          if (item.path) navigate(item.path);
                        }
                  }
                >
                  <Icon
                    name={NAV_ICON_MAP[item.icon] ?? 'users'}
                    className="sidebar__nav-icon"
                    size={18}
                  />
                  <span className="sidebar__nav-label">{item.label}</span>
                  
                  {hasChildren && (
                    <Icon
                      name="chevron-down"
                      className={`sidebar__nav-chevron${isExpanded ? ' sidebar__nav-chevron--open' : ''}`}
                      size={16}
                    />
                  )}
                </button>

                {hasChildren ? (
                  <ul
                    className={`sidebar__subnav${isExpanded ? ' sidebar__subnav--open' : ''}`}
                    aria-hidden={!isExpanded}
                  >
                    {item.children?.map((child) => (
                      <li key={child.id} className="sidebar__subnav-item">
                        <Link
                          to={child.path}
                          className={`sidebar__subnav-link${child.path === activePath ? ' sidebar__subnav-link--pressed' : ''}`}
                          tabIndex={isExpanded ? undefined : -1}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user-card">
          <span className="sidebar__user-avatar">{user?.initials || getInitials(user?.fullName || user?.name)}</span>
          {!isCollapsed && (
            <span className="sidebar__user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p className="sidebar__user-name" style={{ flex: 1, minWidth: 0, margin: 0 }}>{user?.fullName || user?.name || 'Admin User'}</p>
                <button 
                  type="button" 
                  onClick={() => setIsAuditModalOpen(true)}
                  title="Lịch sử hoạt động"
                  style={{ flexShrink: 0, background: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="clock" size={14} />
                </button>
              </div>
              <p className="sidebar__user-email">{user?.email || 'admin@dentalcare.vn'}</p>
            </span>
          )}
        </div>
        
        <button 
          type="button" 
          className="sidebar__logout-btn" 
          onClick={handleLogout}
          title="Đăng xuất"
        >
          <Icon name="log-out" size={18} />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>

      {isAuditModalOpen && (
        <AuditLogModal 
          isOpen={isAuditModalOpen} 
          onClose={() => setIsAuditModalOpen(false)} 
          user={user} 
        />
      )}
    </aside>
  )
}