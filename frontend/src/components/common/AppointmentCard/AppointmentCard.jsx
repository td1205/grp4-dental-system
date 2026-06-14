import { useState } from 'react';
import './AppointmentCard.css';
import { Badge } from '../Badge/Badge';
import { Icon } from '../Icon/Icon';
import { format } from 'date-fns';

const STATUS_VARIANT = {
  'Chờ tiếp đón': 'warning',
  'Chờ khám': 'primary',
  'Đang khám': 'success',
  'Chờ xác nhận': 'warning',
  'Đã xác nhận': 'success',
  'Đã dời': 'primary',
  'Đã hủy': 'error',
  'Không đến': 'error',
  'Hoàn thành': 'success',
};

export function AppointmentCard({ appointment, onReschedule, onCancel, onUpdateStatus, userRole }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { customerId, doctorId, serviceId, date, time, endTime, status, cancelReason, notes } = appointment;
  const isInactive = ['Đã hủy', 'Không đến', 'Hoàn thành'].includes(status);
  const variant = STATUS_VARIANT[status] || 'warning';

  const dateStr = date ? format(new Date(date), 'dd/MM/yyyy') : '—';

  return (
    <div 
      className={`apt-card${isInactive ? ' apt-card--inactive' : ''}${isExpanded ? ' apt-card--expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: isExpanded ? '1px solid var(--color-cta)' : undefined }}
    >
      <div className="apt-card__header">
        <div className="apt-card__patient">
          <div className="apt-card__avatar">
            {(customerId?.name || 'K').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="apt-card__name">{customerId?.name || 'Khách vãng lai'}</p>
            <p className="apt-card__phone">{customerId?.phone || '—'}</p>
          </div>
        </div>
        <Badge label={status} variant={variant} />
      </div>

      <div className="apt-card__divider" />

      <div className="apt-card__info">
        <div className="apt-card__info-row">
          <span className="apt-card__info-icon"><Icon name="calendar" size={14} /></span>
          <span>{dateStr}</span>
        </div>
        <div className="apt-card__info-row">
          <span className="apt-card__info-icon"><Icon name="schedule" size={14} /></span>
          <span>{time} – {endTime}</span>
        </div>
        <div className="apt-card__info-row">
          <span className="apt-card__info-label">Dịch vụ:</span>
          <span>{serviceId?.name || '—'} {serviceId?.duration ? `(${serviceId.duration}p)` : ''}</span>
        </div>
        <div className="apt-card__info-row">
          <span className="apt-card__info-label">Bác sĩ:</span>
          <span>{doctorId?.name || '—'}</span>
        </div>
        {cancelReason && (
          <div className="apt-card__info-row apt-card__info-row--danger">
            <span className="apt-card__info-label">Lý do hủy:</span>
            <span>{cancelReason}</span>
          </div>
        )}
        {notes && (
          <div className="apt-card__info-row" style={{ fontStyle: 'italic', color: 'var(--staff-text-muted)' }}>
            <span className="apt-card__info-label">Ghi chú:</span>
            <span>{notes}</span>
          </div>
        )}
      </div>

      {!isInactive && isExpanded && (
        <div className="apt-card__actions" onClick={(e) => e.stopPropagation()}>
          {/* Nút tác vụ nhanh theo vai trò */}
          {(userRole === 'Receptionist' || userRole === 'Lễ tân' || userRole === 'Admin') && ['Chờ tiếp đón', 'Chờ xác nhận', 'Đã dời', 'Đã xác nhận'].includes(status) && (
            <button
              type="button"
              className="staff-action-btn"
              style={{ color: '#16a34a' }}
              onClick={() => onUpdateStatus(appointment, 'Chờ khám')}
            >
              <Icon name="check" size={14} /> Tiếp đón
            </button>
          )}

          {(userRole === 'Doctor' || userRole === 'Bác sĩ') && status === 'Chờ khám' && (
            <button
              type="button"
              className="staff-action-btn"
              style={{ color: '#2563eb' }}
              onClick={() => onUpdateStatus(appointment, 'Đang khám')}
            >
              <Icon name="check" size={14} /> Vào khám
            </button>
          )}

          {(userRole === 'Doctor' || userRole === 'Bác sĩ') && status === 'Đang khám' && (
            <button
              type="button"
              className="staff-action-btn"
              style={{ color: '#16a34a' }}
              onClick={() => onUpdateStatus(appointment, 'Hoàn thành')}
            >
              <Icon name="check" size={14} /> Hoàn tất
            </button>
          )}

          {/* Dời lịch / Hủy lịch chỉ hiển thị cho Lễ tân/Admin đối với ca chưa khám */}
          {(userRole === 'Receptionist' || userRole === 'Lễ tân' || userRole === 'Admin') && !['Chờ khám', 'Đang khám'].includes(status) && (
            <>
              <button
                type="button"
                className="staff-action-btn"
                onClick={() => onReschedule(appointment)}
              >
                <Icon name="edit" size={14} /> Dời lịch
              </button>
              <button
                type="button"
                className="staff-action-btn staff-action-btn--danger"
                onClick={() => onCancel(appointment)}
              >
                <Icon name="trash" size={14} /> Hủy lịch
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
