import Icon from '../../common/Icon/Icon'
import './CustomerTable.css'

export default function CustomerTable({ customers, onEdit, onDelete }) {
  return (
    <div className="customer-table-container">
      <table className="customer-table">
        <thead>
          <tr>
            <th>Mã BN</th>
            <th>Họ tên</th>
            <th>Số điện thoại</th>
            <th>CCCD</th>
            <th>Trạng thái</th>
            <th className="customer-table__align-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <tr key={customer.id}>
                <td className="customer-table__id">{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.cccd}</td>
                <td>
                  <span className={`customer-badge customer-badge--${customer.status}`}>
                    {customer.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td className="customer-table__actions customer-table__align-right">
                  <button 
                    type="button" 
                    className="customer-table__btn customer-table__btn--edit"
                    onClick={() => onEdit(customer)}
                    title="Chỉnh sửa"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button 
                    type="button" 
                    className="customer-table__btn customer-table__btn--delete"
                    onClick={() => onDelete(customer.id)}
                    title="Xóa"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="customer-table__empty">
                Không tìm thấy khách hàng phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}