import { useState, useEffect } from 'react';
import { staffApi } from '../../services/staffApi';
import './ReassignDoctorModal.css';

export function ReassignDoctorModal({ open, staff, appointments, reason, onClose, onSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && staff) {
      // Fetch all active doctors
      staffApi.getAll({ role: 'doctor', status: 'active', limit: 100 })
        .then(res => {
          // Lọc bỏ bác sĩ đang bị đình chỉ (chính là staff hiện tại)
          const availableDoctors = (res.data || []).filter(d => d.id !== staff.id);
          setDoctors(availableDoctors);
          if (availableDoctors.length > 0) {
            setSelectedDoctorId(availableDoctors[0].id);
          }
        })
        .catch(() => setError('Lỗi khi tải danh sách bác sĩ'));
    }
  }, [open, staff]);

  if (!open || !staff) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Vui lòng chọn bác sĩ tiếp quản');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await staffApi.reassignAndSuspend(staff.id, { newDoctorId: selectedDoctorId, reason });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi bàn giao ca');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="staff-modal-overlay">
      <div className="staff-modal staff-modal--reassign">
        <div className="staff-modal__header">
          <h3>Bàn giao ca làm việc</h3>
          <button className="staff-modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="staff-modal__content">
          <div className="reassign-alert">
            Không thể đình chỉ ngay do Bác sĩ <strong>{staff.fullName}</strong> đang phụ trách <strong>{appointments?.length || 0}</strong> ca điều trị/lịch hẹn. Vui lòng chỉ định Bác sĩ tiếp quản.
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Chọn Bác sĩ tiếp quản:</label>
              <select 
                value={selectedDoctorId} 
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="form-control"
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.specialty || 'Đa khoa'})
                  </option>
                ))}
              </select>
            </div>
            
            {error && <div className="form-error">{error}</div>}
            
            <div className="staff-modal__actions">
              <button type="button" className="staff-btn staff-btn--outline" onClick={onClose} disabled={isLoading}>
                Hủy
              </button>
              <button type="submit" className="staff-btn staff-btn--primary" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận bàn giao'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
