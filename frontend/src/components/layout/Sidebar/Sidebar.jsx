import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../common/Icon/Icon'
import './Sidebar.css'

const NAV_ICON_MAP = {
  users: 'users',
  services: 'briefcase',
  schedule: 'calendar',
  salary: 'circle-dollar-sign',
  stats: 'bar-chart-3',
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

export default function Sidebar({ navItems, activePath, user }) {
  const [expandedIds, setExpandedIds] = useState(() =>
    getInitialExpandedIds(navItems, activePath),
  )
  const [pressedNavId, setPressedNavId] = useState(null)

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

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1 className="sidebar__logo">Dental Care</h1>
        <p className="sidebar__tagline">Hệ thống quản lý</p>
      </div>

      <nav className="sidebar__nav" aria-label="Điều hướng chính">
        <ul className="sidebar__nav-list">
          {navItems.map((item) => {
            const hasChildren = item.children?.length > 0
            const isExpanded = hasChildren && expandedIds.has(item.id)
            const isLeafPressed = !hasChildren && pressedNavId === item.id

            return (
              <li key={item.id} className="sidebar__nav-item">
                <button
                  type="button"
                  className={`sidebar__nav-link${isLeafPressed ? ' sidebar__nav-link--pressed' : ''}`}
                  aria-expanded={hasChildren ? isExpanded : undefined}
                  onClick={
                    hasChildren
                      ? () => toggleExpanded(item.id)
                      : () => setPressedNavId(item.id)
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
                    {item.children.map((child) => (
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

      <div className="sidebar__user">
        <button type="button" className="sidebar__user-card">
          <span className="sidebar__user-avatar">{user.initials}</span>
          <span className="sidebar__user-info">
            <p className="sidebar__user-name">{user.name}</p>
            <p className="sidebar__user-email">{user.email}</p>
          </span>
          <Icon name="chevron-up" className="sidebar__user-chevron" size={16} />
        </button>
      </div>
    </aside>
  )
}