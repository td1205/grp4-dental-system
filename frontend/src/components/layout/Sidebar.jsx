import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { NavIcon } from './NavIcon';

export function Sidebar({ user, navItems, activePath }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isDropdownOpen) {
      axios.get('http://localhost:5001/api/audit-logs')
        .then(res => setAuditLogs(res.data))
        .catch(err => console.error('Failed to fetch audit logs', err));
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLog = (log) => {
    const actionMap = { CREATE: 'TẠO MỚI', UPDATE: 'CẬP NHẬT', DELETE: 'XÓA' };
    const date = new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${log.performedBy} vừa ${actionMap[log.action]} ${log.collectionName} - ${date}`;
  };

  return (
    <aside className="sidebar" aria-label="Điều hướng chính">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          <ToothLogo />
        </span>
        <span className="sidebar__brand-name">DentalCare</span>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {navItems?.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
                end={item.path === '/dashboard'}
              >
                <span className="sidebar__link-icon" aria-hidden="true">
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__user">
        <div className="sidebar__avatar" aria-hidden="true">
          {user.initials}
        </div>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user.name}</span>
          <span className="sidebar__user-role">{user.role}</span>
        </div>
        <div className="sidebar__notification" ref={dropdownRef}>
          <button
            className="sidebar__bell-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Thông báo"
          >
            <Bell size={20} />
            <span className="sidebar__bell-dot"></span>
          </button>

          {isDropdownOpen && (
            <div className="sidebar__notification-dropdown">
              <div className="sidebar__notification-header">
                <h4>Hoạt động gần đây</h4>
              </div>
              <div className="sidebar__notification-list">
                {auditLogs.length > 0 ? (
                  auditLogs?.map(log => (
                    <div key={log._id} className="sidebar__notification-item">
                      <p>{formatLog(log)}</p>
                    </div>
                  ))
                ) : (
                  <div className="sidebar__notification-empty">Không có hoạt động nào</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ToothLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4c-4 0-7 2.5-7 7 0 2 .5 3.5 1 5.5.8 2.5 1.5 4.5 2 6.5.4 1.5 1.2 3 2.5 3.5 1 .4 2-.2 2.5-1.2.5-1 1.5-1 2 0 .8 1.2 2 1.8 3 .8 1.2 0 2.5-1 3-1.5.8-3.2 1.5-5.5 2-8 .5-2 1-4 1-6 0-4.5-3-7-7-7z"
        fill="currentColor"
      />
    </svg>
  );
}