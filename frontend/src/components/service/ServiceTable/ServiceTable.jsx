import { Icon } from '../../common/Icon/Icon'
import { PrimaryButton } from '../../ui/Button/PrimaryButton'
import './ServiceTable.css'

export function ServiceTable({ services, onSort, currentSort, showInactive, onEdit, onDelete, onRestore, onViewDetail }) {
  const handleSortClick = (field) => {
    let newSort = `${field}:asc`
    if (currentSort === `${field}:asc`) {
      newSort = `${field}:desc`
    } else if (currentSort === `${field}:desc`) {
      newSort = 'createdAt:desc' // Default
    }
    onSort(newSort)
  }

  const renderSortIcon = (field) => {
    if (currentSort === `${field}:asc`) return <Icon name="chevron-up" size={14} />
    if (currentSort === `${field}:desc`) return <Icon name="chevron-down" size={14} />
    return <Icon name="minus" size={14} color="#cbd5e1" />
  }

  if (services.length === 0) {
    return (
      <div className="service-table-empty">
        <Icon name="inbox" size={48} color="#cbd5e1" />
        <p>Không tìm thấy kết quả</p>
      </div>
    )
  }

  return (
    <div className="service-table-container">
      <table className="service-table">
        <thead>
          <tr>
            <th onClick={() => handleSortClick('id')} className="sortable-th">
              Mã dịch vụ {renderSortIcon('id')}
            </th>
            <th onClick={() => handleSortClick('name')} className="sortable-th">
              Tên dịch vụ {renderSortIcon('name')}
            </th>
            <th onClick={() => handleSortClick('category')} className="sortable-th">
              Loại dịch vụ {renderSortIcon('category')}
            </th>
            <th onClick={() => handleSortClick('department')} className="sortable-th">
              Khoa thực hiện {renderSortIcon('department')}
            </th>
            <th onClick={() => handleSortClick('duration')} className="sortable-th">
              Thời gian TB {renderSortIcon('duration')}
            </th>
            <th>Trạng thái</th>
            <th className="action-th">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item) => (
            <tr key={item.id} onDoubleClick={() => onViewDetail(item)}>
              <td>{item.id}</td>
              <td className="font-medium">{item.name}</td>
              <td>{item.category}</td>
              <td>{item.department || 'Khoa Khám Bệnh'}</td>
              <td>{item.duration || 30} phút</td>
              <td>
                <span className={`status-badge status-${item.status}`}>
                  {item.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button type="button" className="action-btn" onClick={() => onViewDetail(item)} title="Xem chi tiết">
                    <Icon name="eye" size={16} />
                  </button>
                  {!showInactive ? (
                    <>
                      <button type="button" className="action-btn" onClick={() => onEdit(item)} title="Sửa dịch vụ">
                        <Icon name="edit" size={16} />
                      </button>
                      <button type="button" className="action-btn action-btn--danger" onClick={() => onDelete(item.id)} title="Xóa dịch vụ">
                        <Icon name="trash" size={16} />
                      </button>
                    </>
                  ) : (
                    <PrimaryButton onClick={() => onRestore(item.id)} style={{ fontSize: '12px', padding: '4px 8px', minWidth: 'auto', height: '28px' }}>
                      Khôi phục
                    </PrimaryButton>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
