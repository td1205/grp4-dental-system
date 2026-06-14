import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';


import { getNavItems, DEFAULT_USER } from '../../../constants/navigation';
import './DashboardLayout.css';

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

  // Gọi hàm lấy danh sách menu dựa trên role của user hiện tại
  const navItems = getNavItems(currentUser.role);

  return (
    <div className="dashboard-layout">
      {/* Truyền navItems động vào Sidebar */}
      <Sidebar
        navItems={navItems}
        user={currentUser}
        activePath={activePath}
      />
      <main className="dashboard-layout__main">
        <div className="dashboard-layout__content"><Outlet /></div>
      </main>
    </div>
  )
}