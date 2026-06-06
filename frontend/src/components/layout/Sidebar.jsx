import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { NavIcon } from './NavIcon';

export function Sidebar({ user }) {
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
          {NAV_ITEMS.map((item) => (
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
