import { ModalWrapper } from '../../common/ModalWrapper/ModalWrapper';
import { Badge } from '../../common/Badge/Badge';

export function ServiceDetailModal({ isOpen, onClose, service }) {
  if (!service) return null;

  const { id, name, category, department, duration, description, status } = service;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết dịch vụ"
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
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Mã dịch vụ</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{id}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Loại dịch vụ</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{category || 'Không xác định'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Khoa chuyên môn</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{department || 'Khoa Khám Bệnh'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Thời gian thực hiện</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{duration ? `${duration} phút` : 'Chưa có'}</p>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Mô tả chi tiết</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{description || 'Không có mô tả'}</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
