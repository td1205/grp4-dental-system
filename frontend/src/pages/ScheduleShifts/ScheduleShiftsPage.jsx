
import { NAV_ITEMS, DEFAULT_USER } from '../../constants/navigation'
import { Icon } from '../../components/common/Icon/Icon'

const ACTIVE_PATH = '/schedule/shifts'

export function ScheduleShiftsPage() {
  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
  const mockShifts = [
    { staff: 'Trần Thị Bình', role: 'Bác sĩ', schedule: ['Sáng', 'Chiều', 'Sáng', 'Chiều', 'Sáng', 'Sáng', 'Nghỉ'] },
    { staff: 'Lê Minh Cường', role: 'Bác sĩ', schedule: ['Chiều', 'Sáng', 'Chiều', 'Sáng', 'Chiều', 'Nghỉ', 'Chiều'] },
    { staff: 'Phạm Thu Dung', role: 'Lễ tân', schedule: ['Cả ngày', 'Cả ngày', 'Cả ngày', 'Nghỉ', 'Cả ngày', 'Cả ngày', 'Nghỉ'] }
  ]

  return (
    <>
      <div className="staff-page" id="schedule-shifts-page">
        <header className="staff-page__header">
          <h1 className="staff-page__title">Thiết lập ca làm việc</h1>
          <p>Phân chia ca trực, ca làm việc hàng tuần cho nhân viên phòng khám</p>
        </header>

        <div className="staff-card">
          <div className="staff-toolbar">
            <button type="button" className="staff-btn staff-btn--primary">
              <Icon name="plus" size={16} /> Thêm lịch phân ca
            </button>
          </div>

          <div className="staff-table-wrap">
            <table className="staff-table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>NHÂN VIÊN</th>
                  <th>VAI TRÒ</th>
                  {daysOfWeek?.map((day) => (
                    <th key={day} style={{ textAlign: 'center' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockShifts?.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.staff}</td>
                    <td>{row.role}</td>
                    {row.schedule?.map((shift, sIdx) => (
                      <td key={sIdx} style={{ textAlign: 'center' }}>
                        <span className={`staff-badge`} style={{
                          backgroundColor: shift === 'Nghỉ' ? '#f1f5f9' : shift.includes('Sáng') ? '#e0f2fe' : shift.includes('Chiều') ? '#dbeafe' : '#dcfce7',
                          color: shift === 'Nghỉ' ? '#64748b' : shift.includes('Sáng') ? '#0369a1' : shift.includes('Chiều') ? '#1d4ed8' : '#15803d'
                        }}>
                          {shift}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
