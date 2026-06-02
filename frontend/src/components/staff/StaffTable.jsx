import { StaffRow } from './StaffRow';

const COLUMNS = [
  'MÃ NV',
  'HỌ TÊN',
  'EMAIL',
  'SĐT',
  'VAI TRÒ',
  'BẰNG CẤP',
  'TRẠNG THÁI',
  'NGÀY TẠO',
  'THAO TÁC',
];

export function StaffTable({
  staffs,
  isLoading,
  isEmpty,
  onView,
  onEdit,
  onChangePassword,
  onToggleLock,
  onDelete,
}) {
  if (isLoading) {
    return <div className="staff-table__message">Đang tải dữ liệu...</div>;
  }

  if (isEmpty) {
    return <div className="staff-table__message">Không tìm thấy nhân viên phù hợp.</div>;
  }

  return (
    <div className="staff-table-wrap">
      <table className="staff-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff) => (
            <StaffRow
              key={staff.id}
              staff={staff}
              onView={onView}
              onEdit={onEdit}
              onChangePassword={onChangePassword}
              onToggleLock={onToggleLock}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
