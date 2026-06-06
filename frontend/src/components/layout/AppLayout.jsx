import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DEFAULT_USER } from '../../constants/navigation';

export function AppLayout({ user = DEFAULT_USER }) {
  return (
    <div className="app-shell">
      <Sidebar user={user} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
