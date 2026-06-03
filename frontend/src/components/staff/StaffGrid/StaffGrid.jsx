import StaffCard from '../StaffCard/StaffCard'
import './StaffGrid.css'

export default function StaffGrid({ staffList, onResendMail }) {
  if (staffList.length === 0) {
    return (
      <div className="staff-grid">
        <p className="staff-grid__empty">Không tìm thấy nhân viên phù hợp.</p>
      </div>
    )
  }

  return (
    <div className="staff-grid">
      {staffList.map((staff) => (
        <StaffCard key={staff.id} staff={staff} onResendMail={onResendMail} />
      ))}
    </div>
  )
}
