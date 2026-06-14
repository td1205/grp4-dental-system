import { ModalWrapper } from '../common/ModalWrapper/ModalWrapper';
import { Badge } from '../common/Badge/Badge';

export function CustomerDetailModal({ isOpen, onClose, customer }) {
  if (!customer) return null;

  const { id, name, dateOfBirth, phone, cccd, address, email, status, createdAt } = customer;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ sơ khách hàng"
      footer={
        <button type="button" className="customer-btn-cancel" onClick={onClose}>Đóng</button>
      }
    >
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f3e8ff', color: '#7e22ce',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
          }}>
            {name.substring(0, 1)}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>{name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Badge label={status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'} variant={status === 'active' ? 'success' : 'error'} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Mã bệnh nhân</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{id}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Ngày tạo hồ sơ</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Số điện thoại</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{phone}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Email</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{email || 'Không có'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Ngày sinh</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>CCCD</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{cccd}</p>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Địa chỉ</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{address}</p>
          </div>
        </div>
        
        <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Lịch sử khám/điều trị</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>Chưa có dữ liệu lịch sử điều trị cho khách hàng này.</p>
        </div>
      </div>
    </ModalWrapper>
  );
}
