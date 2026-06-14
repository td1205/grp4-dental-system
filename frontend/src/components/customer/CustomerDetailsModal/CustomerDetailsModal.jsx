import { Icon } from '../../common/Icon/Icon'
import { formatDateForDisplay } from '../../../utils/staffFormMappers'
import './CustomerDetailsModal.css'

export function CustomerDetailsModal({ isOpen, onClose, customer }) {
  if (!isOpen || !customer) return null

  // medicalHistory có thể là string hoặc empty array
  const hasMedicalHistory = customer.medicalHistory && customer.medicalHistory.length > 0;

  return (
    <div className="customer-modal-overlay">
      <div className="customer-modal customer-modal--details">
        <header className="customer-modal__header">
          <h2>Hồ sơ chi tiết khách hàng</h2>
          <button type="button" className="customer-modal__close-btn" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </header>

        <div className="customer-modal__body">
          <div className="details-section">
            <h3 className="details-section__title"><Icon name="user" size={16} /> Thông tin hành chính</h3>
            <div className="details-grid">
              <div className="details-item">
                <span className="details-label">Mã bệnh nhân</span>
                <span className="details-value">{customer.id}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Họ và tên</span>
                <span className="details-value">{customer.name || customer.fullName}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Ngày sinh</span>
                <span className="details-value">{formatDateForDisplay(customer.dob || customer.dateOfBirth)}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Số điện thoại</span>
                <span className="details-value">{customer.phone}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Số CCCD</span>
                <span className="details-value">{customer.cccd}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Email</span>
                <span className="details-value">{customer.email || '—'}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Trạng thái</span>
                <span className={`details-value status-badge status-badge--${customer.status}`}>
                  {customer.status === 'active' ? 'Đang hoạt động' : customer.status === 'inactive' ? 'Ngừng hoạt động' : 'Tạm khóa'}
                </span>
              </div>
              <div className="details-item details-item--full">
                <span className="details-label">Địa chỉ</span>
                <span className="details-value">{customer.address || '—'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3 className="details-section__title"><Icon name="activity" size={16} /> Lịch sử khám bệnh / Giao dịch</h3>
            <div className="details-history">
              {hasMedicalHistory ? (
                <div className="history-content">
                  {typeof customer.medicalHistory === 'string' 
                    ? <p>{customer.medicalHistory}</p> 
                    : <pre>{JSON.stringify(customer.medicalHistory, null, 2)}</pre>}
                </div>
              ) : (
                <div className="history-empty">
                  Chưa có lịch sử khám bệnh.
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="customer-modal__footer" style={{ justifyContent: 'center' }}>
          <button type="button" className="customer-btn-cancel" onClick={onClose} style={{ minWidth: '120px' }}>
            Đóng
          </button>
        </footer>
      </div>
    </div>
  )
}
