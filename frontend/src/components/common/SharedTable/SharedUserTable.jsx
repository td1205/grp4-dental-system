import { Icon } from '../Icon/Icon'

export function SharedUserTable({
  users = [],
  columns = [],
  isLoading,
  isEmpty,
  onView,
  onEdit,
  onDelete,
  onToggleLock,
  onChangePassword,
  renderCustomActions,
  isCustomer = false
}) {
  if (isLoading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>
  }

  if (isEmpty || users.length === 0) {
    return <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy dữ liệu phù hợp.</div>
  }

  return (
    <div className="table-responsive" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.875rem' }}>
                {col.label}
              </th>
            ))}
            <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.875rem', textAlign: 'right' }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id || user._id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '16px', fontSize: '0.875rem', color: '#1e293b' }}>
                  {col.render ? col.render(user) : user[col.key]}
                </td>
              ))}
              <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(user)}
                    title="Chỉnh sửa"
                    style={{ background: 'none', border: 'none', color: '#2E5FA3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Icon name="edit" size={16} /> <span>Sửa</span>
                  </button>
                )}
                {onView && (
                  <button
                    type="button"
                    onClick={() => onView(user)}
                    title="Xem chi tiết"
                    style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Icon name="eye" size={16} /> <span>Xem</span>
                  </button>
                )}
                {onToggleLock && !isCustomer && (
                  <button
                    type="button"
                    onClick={() => onToggleLock(user)}
                    title={user.status === 'locked' || user.status === 'suspended' ? 'Khôi phục' : 'Đổi trạng thái'}
                    style={{ background: 'none', border: 'none', color: user.status === 'locked' || user.status === 'suspended' ? '#10B981' : '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Icon name={user.status === 'locked' || user.status === 'suspended' ? 'unlock' : 'lock'} size={16} /> 
                    <span>{user.status === 'locked' || user.status === 'suspended' ? 'Khôi phục' : 'Đổi trạng thái'}</span>
                  </button>
                )}
                {onChangePassword && !isCustomer && (
                  <button
                    type="button"
                    onClick={() => onChangePassword(user)}
                    title="Khôi phục mật khẩu"
                    style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Icon name="key" size={16} /> <span>Khôi phục mật khẩu</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(user)}
                    title="Xóa"
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Icon name="trash" size={16} /> <span>Xóa</span>
                  </button>
                )}
                {renderCustomActions && renderCustomActions(user)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
