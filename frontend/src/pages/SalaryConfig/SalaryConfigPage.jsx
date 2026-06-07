import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import Icon from '../../components/common/Icon/Icon'

const ACTIVE_PATH = '/salary/config'

export default function SalaryConfigPage() {
  const configs = [
    { id: 1, role: 'Bác sĩ chính', base: '25.000.000', shiftRate: '200.000', patientRate: '5% doanh thu ca bệnh' },
    { id: 2, role: 'Bác sĩ phụ tá', base: '12.000.000', shiftRate: '100.000', patientRate: '2% doanh thu ca bệnh' },
    { id: 3, role: 'Lễ tân', base: '8.000.000', shiftRate: '50.000', patientRate: '0%' }
  ]

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="staff-page" id="salary-config-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Cấu hình lương & Hệ số ca bệnh</h1>
          <p>Thiết lập định mức lương cơ bản và tỷ lệ hoa hồng theo ca bệnh của nhân viên</p>
        </header>

        <div className="staff-card">
          <div className="staff-toolbar">
            <button type="button" className="staff-btn staff-btn--primary">
              <Icon name="plus" size={16} /> Thêm cấu hình
            </button>
          </div>

          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>VAI TRÒ</th>
                  <th>LƯƠNG CƠ BẢN (VND)</th>
                  <th>PHỤ CẤP CA TRỰC (VND)</th>
                  <th>HỆ SỐ HOA HỒNG CA BỆNH</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => (
                  <tr key={config.id}>
                    <td style={{ fontWeight: 600 }}>{config.role}</td>
                    <td>{config.base}</td>
                    <td>{config.shiftRate}</td>
                    <td>
                      <span className="staff-badge staff-badge--role staff-badge--role-doctor">
                        {config.patientRate}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="staff-action-btn" title="Cập nhật cấu hình">
                        <Icon name="edit" size={16} />
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
