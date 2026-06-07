import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import Icon from '../../components/common/Icon/Icon'

const ACTIVE_PATH = '/revenue'

export default function RevenueStatsPage() {
  const stats = [
    { month: 'Tháng 1', sales: '120.000.000', patients: 150, services: 320 },
    { month: 'Tháng 2', sales: '145.000.000', patients: 180, services: 380 },
    { month: 'Tháng 3', sales: '190.000.000', patients: 220, services: 460 },
    { month: 'Tháng 4', sales: '210.000.000', patients: 240, services: 510 },
    { month: 'Tháng 5', sales: '280.000.000', patients: 310, services: 650 }
  ]

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="staff-page" id="revenue-stats-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Thống kê doanh thu</h1>
          <p>Xem báo cáo doanh số, số lượng bệnh nhân khám và sử dụng dịch vụ tại phòng khám</p>
        </header>

        <div className="service-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="service-stats__card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p className="service-stats__label" style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Tổng doanh thu tháng 5</p>
            <p className="service-stats__value service-stats__value--green" style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>280M VND</p>
          </div>
          <div className="service-stats__card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p className="service-stats__label" style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Tổng lượt khám</p>
            <p className="service-stats__value service-stats__value--blue" style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 700, color: '#2563eb' }}>310 bệnh nhân</p>
          </div>
          <div className="service-stats__card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p className="service-stats__label" style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Dịch vụ dùng nhiều nhất</p>
            <p className="service-stats__value" style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Vệ sinh răng miệng</p>
          </div>
        </div>

        <div className="staff-card">
          <header className="staff-page__header">
            <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 600 }}>Lịch sử kinh doanh theo tháng</h2>
          </header>

          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>THÁNG</th>
                  <th>DOANH THU (VND)</th>
                  <th>LƯỢT BỆNH NHÂN</th>
                  <th>SỐ CA DỊCH VỤ THỰC HIỆN</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.month}</td>
                    <td style={{ fontWeight: 600, color: '#16a34a' }}>{row.sales}</td>
                    <td>{row.patients}</td>
                    <td>{row.services}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
