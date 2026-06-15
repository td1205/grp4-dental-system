import { UniversalDataCard } from '../UniversalDataCard/UniversalDataCard'
import { Badge } from '../Badge/Badge'

export function SharedUserGrid({
  users = [],
  isLoading,
  isEmpty,
  mappingConfig,
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
      {users.map((user) => {
        const { title, subtitle, badgeText, badgeVariant, infoLines, statusLabel, statusVariant } = mappingConfig(user);

        // Lấy 2 chữ cái đầu làm avatar
        const words = (title || '').split(' ');
        const initials = words.length > 1 
          ? words[0][0] + words[words.length - 1][0] 
          : (words[0] ? words[0].substring(0, 2) : 'NV');

        const actions = (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
            <div style={{ marginRight: 'auto' }}>
              <Badge label={statusLabel} variant={statusVariant} />
            </div>
            
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(user)}
                title="Chỉnh sửa"
                style={{ background: 'none', border: 'none', color: '#2E5FA3', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Sửa
              </button>
            )}
            
            {onView && (
              <button
                type="button"
                onClick={() => onView(user)}
                title="Xem chi tiết"
                style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Xem
              </button>
            )}

            {onToggleLock && !isCustomer && (
              <button
                type="button"
                onClick={() => onToggleLock(user)}
                title={user.status === 'locked' || user.status === 'suspended' ? 'Khôi phục' : 'Đổi trạng thái'}
                style={{ background: 'none', border: 'none', color: user.status === 'locked' || user.status === 'suspended' ? '#10B981' : '#F59E0B', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {user.status === 'locked' || user.status === 'suspended' ? 'Khôi phục' : 'Đổi trạng thái'}
              </button>
            )}

            {onChangePassword && !isCustomer && (
              <button
                type="button"
                onClick={() => onChangePassword(user)}
                title="Khôi phục mật khẩu"
                style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Khôi phục mật khẩu
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(user)}
                title="Xóa"
                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Xóa
              </button>
            )}

            {renderCustomActions && renderCustomActions(user)}
          </div>
        );

        return (
          <UniversalDataCard
            key={user.id || user._id}
            avatarText={initials.toUpperCase()}
            title={title}
            subtitle={subtitle}
            badge={badgeText ? <Badge label={badgeText} variant={badgeVariant} /> : null}
            infoLines={infoLines}
            actions={actions}
          />
        );
      })}
    </div>
  )
}
