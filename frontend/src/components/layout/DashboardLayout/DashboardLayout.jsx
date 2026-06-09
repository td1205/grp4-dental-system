import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../Sidebar/Sidebar'
import { NAV_ITEMS, DEFAULT_USER } from '../../../constants/navigation'
import './DashboardLayout.css'

export function DashboardLayout() {
  const location = useLocation();
  const activePath = location.pathname;
  
  const currentUser = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  })();

  return (
    <div className="dashboard-layout">
      <Sidebar navItems={NAV_ITEMS} activePath={activePath} user={currentUser} />
      <main className="dashboard-layout__main">
        <div className="dashboard-layout__content"><Outlet /></div>
      </main>
    </div>
  )
}
