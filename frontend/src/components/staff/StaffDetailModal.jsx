import { ModalWrapper } from '../common/ModalWrapper/ModalWrapper';
import { Badge } from '../common/Badge/Badge';
import { ROLE_LABELS, STATUS_LABELS } from '../../constants/staff';

export function StaffDetailModal({ isOpen, onClose, staff }) {
  if (!staff) return null;

  const { id, fullName, email, personalEmail, phone, role, status, specialty, department, startDate, address, gender, idNumber } = staff;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ sơ nhân viên"
      footer={
        <button type="button" className="customer-btn-cancel" onClick={onClose}>Đóng</button>
      }
    >
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold'
          }}>
            {fullName.substring(0, 1)}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>{fullName}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Badge label={ROLE_LABELS[role] ?? role} variant="orthodontics" />
              <Badge label={STATUS_LABELS[status] ?? status} variant={status === 'active' ? 'success' : 'warning'} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Mã nhân viên</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{id}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Ngày tham gia</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{new Date(startDate).toLocaleDateString('vi-VN')}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Phòng ban / Khoa</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{department || 'Chưa phân bổ'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Chuyên khoa</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{specialty || 'Không có'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Email làm việc</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{email}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Email cá nhân</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{personalEmail || 'Không có'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Số điện thoại</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{phone}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>CCCD</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{idNumber}</p>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Địa chỉ</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{address}</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
