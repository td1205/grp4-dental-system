import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import Icon from '../../components/common/Icon/Icon'

const ACTIVE_PATH = '/schedule/leaves'

export default function ScheduleLeavesPage() {
  const mockLeaves = [
    { id: 1, staff: 'Trần Thị Bình', role: 'Bác sĩ', range: '10/06/2026 - 12/06/2026', type: 'Phép năm', status: 'approved' },
    { id: 2, staff: 'Phạm Thu Dung', role: 'Lễ tân', range: '15/06/2026', type: 'Việc riêng', status: 'pending' },
    { id: 3, staff: 'Lê Minh Cường', role: 'Bác sĩ', range: '18/06/2026 - 20/06/2026', type: 'Nghỉ bệnh', status: 'approved' }
  ]

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="staff-page" id="schedule-leaves-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Quản lý lịch nghỉ</h1>
          <p>Duyệt và lập lịch nghỉ của Bác sĩ và Nhân viên phòng khám</p>
        </header>

        <div className="staff-card">
          <div className="staff-toolbar">
            <button type="button" className="staff-btn staff-btn--primary">
              <Icon name="plus" size={16} /> Đăng ký nghỉ phép
            </button>
          </div>

          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>NHÂN VIÊN</th>
                  <th>VAI TRÒ</th>
                  <th>THỜI GIAN NGHỈ</th>
                  <th>LOẠI PHÉP</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td style={{ fontWeight: 600 }}>{leave.staff}</td>
                    <td>{leave.role}</td>
                    <td>{leave.range}</td>
                    <td>{leave.type}</td>
                    <td>
                      <span className={`staff-badge staff-badge--status ${leave.status === 'approved' ? 'staff-badge--status-active' : 'staff-badge--status-pending'}`}>
                        {leave.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="staff-btn staff-btn--outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        Chi tiết
                      </button>
                    </td>
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
