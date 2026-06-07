import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout'
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import Icon from '../../components/common/Icon/Icon'

const ACTIVE_PATH = '/salary/payslips'

export default function SalaryPayslipsPage() {
  const payslips = [
    { id: 'PL001', doctor: 'Trần Thị Bình', month: '05/2026', base: '25.000.000', commissions: '8.400.000', allowance: '1.200.000', total: '34.600.000', status: 'paid' },
    { id: 'PL002', doctor: 'Lê Minh Cường', month: '05/2026', base: '25.000.000', commissions: '11.500.000', allowance: '1.000.000', total: '37.500.000', status: 'paid' },
    { id: 'PL003', doctor: 'Võ Thị Phương', month: '05/2026', base: '25.000.000', commissions: '4.200.000', allowance: '800.000', total: '30.000.000', status: 'pending' }
  ]

  return (
    <DashboardLayout navItems={NAV_ITEMS} activePath={ACTIVE_PATH} user={DEFAULT_USER}>
      <div className="staff-page" id="salary-payslips-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Phiếu lương bác sĩ</h1>
          <p>Danh sách và trạng thái chi trả bảng lương hàng tháng của Bác sĩ</p>
        </header>

        <div className="staff-card">
          <div className="staff-toolbar">
            <button type="button" className="staff-btn staff-btn--outline">
              <Icon name="mail" size={16} /> Gửi mail bảng lương hàng loạt
            </button>
          </div>

          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>MÃ PHIẾU</th>
                  <th>BÁC SĨ</th>
                  <th>THÁNG LƯƠNG</th>
                  <th>LƯƠNG CƠ BẢN (VND)</th>
                  <th>HOA HỒNG (VND)</th>
                  <th>PHỤ CẤP (VND)</th>
                  <th>THỰC LĨNH (VND)</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td style={{ fontWeight: 600 }}>{payslip.id}</td>
                    <td style={{ fontWeight: 600 }}>{payslip.doctor}</td>
                    <td>{payslip.month}</td>
                    <td>{payslip.base}</td>
                    <td>{payslip.commissions}</td>
                    <td>{payslip.allowance}</td>
                    <td style={{ fontWeight: 600, color: 'var(--staff-primary)' }}>{payslip.total}</td>
                    <td>
                      <span className={`staff-badge staff-badge--status ${payslip.status === 'paid' ? 'staff-badge--status-active' : 'staff-badge--status-pending'}`}>
                        {payslip.status === 'paid' ? 'Đã chi trả' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="staff-btn staff-btn--outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        In phiếu
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
