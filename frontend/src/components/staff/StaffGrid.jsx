import { StaffCard } from './StaffCard';
import './StaffCard.css';

export function StaffGrid({
  staffs,
  isLoading,
  isEmpty,
  onView,
  onEdit,
  onChangePassword,
  onToggleLock,
  onDelete,
  onResendMail,
}) {
  if (isLoading) {
    return <div className="staff-table__message">Đang tải dữ liệu...</div>;
  }

  if (isEmpty) {
    return <div className="staff-table__message">Không tìm thấy nhân viên phù hợp.</div>;
  }

  return (
    <div className="staff-grid">
      {staffs.map((staff) => (
        <StaffCard
          key={staff.id}
          staff={staff}
          onView={onView}
          onEdit={onEdit}
          onChangePassword={onChangePassword}
          onToggleLock={onToggleLock}
          onDelete={onDelete}
          onResendMail={onResendMail}
        />
      ))}
    </div>
  );
}
