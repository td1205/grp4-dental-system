import Sidebar from '../Sidebar/Sidebar'
import './DashboardLayout.css'

export default function DashboardLayout({
  children,
  navItems,
  activePath,
  user,
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar navItems={navItems} activePath={activePath} user={user} />
      <main className="dashboard-layout__main">
        <div className="dashboard-layout__content">{children}</div>
      </main>
    </div>
  )
}
