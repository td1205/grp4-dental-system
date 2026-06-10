import { UniversalDataCard } from '../../common/UniversalDataCard/UniversalDataCard'
import { Badge } from '../../common/Badge/Badge'
import { Icon } from '../../common/Icon/Icon'
import './CustomerGrid.css'

export function CustomerGrid({ customers, isLoading, onEdit, onDelete, showDelete = true }) {
  if (isLoading) {
    return <div className="customer-grid__loading">Đang tải dữ liệu...</div>
  }

  if (!customers || customers?.length === 0) {
    return <div className="customer-grid__empty">Không tìm thấy khách hàng phù hợp.</div>
  }

  return (
    <div className="customer-grid">
      {customers?.map((customer) => {
        let statusLabel = 'Tạm khóa';
        let statusVariant = 'error';
        if (customer.status === 'active') {
          statusLabel = 'Đang hoạt động';
          statusVariant = 'success';
        } else if (customer.status === 'inactive') {
          statusLabel = 'Ngừng hoạt động';
          statusVariant = 'error';
        }

        const actions = (
          <>
            <button 
              type="button" 
              className="customer-table__btn customer-table__btn--edit"
              onClick={() => onEdit(customer)}
              title="Chỉnh sửa"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--color-link-active, #2E5FA3)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              <Icon name="edit" size={16} /> <span>Chỉnh sửa</span>
            </button>
            {showDelete && (
              <button 
                type="button" 
                className="customer-table__btn customer-table__btn--delete"
                onClick={() => onDelete(customer.id)}
                title="Xóa"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                <Icon name="trash" size={16} /> <span>Xóa</span>
              </button>
            )}
          </>
        );

        // Lấy 2 chữ cái đầu làm avatar
        const words = (customer.name || customer.fullName || '').split(' ');
        const initials = words.length > 1 
          ? words[0][0] + words[words.length - 1][0] 
          : (words[0] ? words[0].substring(0, 2) : 'KH');

        return (
          <UniversalDataCard
            key={customer.id}
            avatarText={initials.toUpperCase()}
            title={customer.name || customer.fullName}
            subtitle={customer.id}
            badge={<Badge label={statusLabel} variant={statusVariant} />}
            infoLines={[
              { label: 'SĐT', value: customer.phone },
              { label: 'CCCD', value: customer.cccd }
            ]}
            actions={actions}
          />
        );
      })}
    </div>
  )
}
