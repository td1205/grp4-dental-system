import { useState } from 'react';
import apiClient from '../../../services/apiClient';
import { PrimaryButton } from '../../ui/Button/PrimaryButton';
import toast from 'react-hot-toast';

const ROOMS = ['Phòng khám 1', 'Phòng khám 2', 'Phòng khám 3', 'Phòng phẫu thuật'];

export function ShiftFormModal({ isOpen, onClose, onSave, staffList, initialData, existingShifts = [] }) {
    const [formData, setFormData] = useState({
        staffId: initialData?.staffId?._id || initialData?.staffId || '',
        receptionistId: '',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : (new Date().toISOString().split('T')[0]),
        startTime: initialData?.startTime || '08:00',
        endTime: initialData?.endTime || '12:00',
        room: initialData?.room || ROOMS[0],
        role: initialData?.role || 'Bác sĩ'
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.staffId) {
            toast.error('Vui lòng chọn nhân viên chính!');
            return;
        }

        const hasRec = existingShifts.some(shift => 
            shift.role === 'Lễ tân' && 
            shift.staffId &&
            shift.date.split('T')[0] === formData.date && 
            shift.startTime <= formData.startTime && 
            shift.endTime >= formData.endTime
        );

        if (formData.role === 'Bác sĩ' && !formData.receptionistId && !initialData?._id && !hasRec) {
            toast.error('Ca trực phải có tối thiểu 01 Lễ tân. Vui lòng chọn Lễ tân trực cùng!');
            return;
        }
        if (formData.endTime <= formData.startTime) {
            toast.error('Giờ kết thúc phải sau giờ bắt đầu!');
            return;
        }

        const submitData = { ...formData };
        if (submitData.role === 'Lễ tân') {
            submitData.room = 'Quầy Lễ Tân';
        }

        setIsLoading(true);
        try {
            if (initialData?._id) {
                await apiClient.put(`/shifts/${initialData._id}`, submitData);
                toast.success('Cập nhật lịch trực thành công!');
            } else {
                await apiClient.post('/shifts', submitData);
                toast.success('Lưu lịch trực thành công!');
            }
            onSave();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch');
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm helper kiểm tra xem ca (startTime, endTime) có giao với khoảng (sStart, sEnd)
    const isTimeOverlap = (start1, end1, start2, end2) => {
        return (start1 < end2) && (end1 > start2);
    };

    // Smart Filtering cho Bác sĩ
    const filteredStaff = staffList?.filter(s => {
        const r = (s.role || '').toLowerCase();
        let matchesRole = true;
        if (formData.role === 'Bác sĩ') matchesRole = r.includes('bác sĩ') || r.includes('doctor');
        if (formData.role === 'Lễ tân') matchesRole = r.includes('lễ tân') || r.includes('receptionist');
        
        if (!matchesRole) return false;

        // Check trùng lịch trong existingShifts cùng ngày
        const hasConflict = existingShifts.some(shift => {
            if (initialData?._id && shift._id === initialData._id) return false; // ignore current shift if editing
            if (shift.date.split('T')[0] !== formData.date) return false;
            if (shift.staffId?._id === s._id || shift.staffId === s._id) {
                return isTimeOverlap(formData.startTime, formData.endTime, shift.startTime, shift.endTime);
            }
            return false;
        });

        return !hasConflict; // Chỉ trả về những người chưa bận
    }) || [];

    // Danh sách Lễ tân khả dụng (cho dropdown Lễ tân trực cùng)
    const availableReceptionists = staffList?.filter(s => {
        const r = (s.role || '').toLowerCase();
        if (!r.includes('lễ tân') && !r.includes('receptionist')) return false;

        const hasConflict = existingShifts.some(shift => {
            if (shift.date.split('T')[0] !== formData.date) return false;
            if (shift.staffId?._id === s._id || shift.staffId === s._id) {
                return isTimeOverlap(formData.startTime, formData.endTime, shift.startTime, shift.endTime);
            }
            return false;
        });

        return !hasConflict;
    }) || [];

    // Smart Filtering cho Phòng khám
    const availableRooms = ROOMS.filter(r => {
        const isOccupied = existingShifts.some(shift => {
            if (initialData?._id && shift._id === initialData._id) return false;
            if (shift.date.split('T')[0] !== formData.date) return false;
            if (shift.room === r) {
                return isTimeOverlap(formData.startTime, formData.endTime, shift.startTime, shift.endTime);
            }
            return false;
        });
        return !isOccupied;
    });

    // Tự động tìm Lễ tân đã có ca trong khung giờ này
    const existingRecShift = existingShifts.find(shift => 
        shift.role === 'Lễ tân' && 
        shift.staffId &&
        shift.date.split('T')[0] === formData.date && 
        shift.startTime <= formData.startTime && 
        shift.endTime >= formData.endTime
    );

    return (
        <div className="shift-modal-overlay" onClick={onClose}>
            <div className="shift-modal-box" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="shift-modal-header">
                    <h2>{initialData?._id ? 'Cập nhật ca làm việc' : 'Khởi tạo ca làm việc'}</h2>
                    <button className="shift-modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="shift-modal-body">
                    <div className="shift-form-row">
                        <div className="shift-form-field">
                            <label>Vai trò <span className="required">*</span></label>
                            <select value={formData.role} onChange={e => handleChange('role', e.target.value)}>
                                <option value="Bác sĩ">Bác sĩ</option>
                                <option value="Lễ tân">Lễ tân</option>
                            </select>
                        </div>
                        <div className="shift-form-field">
                            <label>{formData.role === 'Bác sĩ' ? 'Bác sĩ' : 'Nhân viên'} <span className="required">*</span></label>
                            <select value={formData.staffId} onChange={e => handleChange('staffId', e.target.value)}>
                                <option value="">-- Chọn nhân viên --</option>
                                {filteredStaff.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {formData.role === 'Bác sĩ' && !initialData?._id && (
                        <div className="shift-form-row">
                            <div className="shift-form-field" style={{ width: '100%' }}>
                                <label>Lễ tân trực cùng <span className="required">*</span></label>
                                {existingRecShift ? (
                                    <div style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', color: '#166534' }}>
                                        Đã có Lễ tân <strong>{existingRecShift.staffId?.name || existingRecShift.staffId}</strong> trực trong khung giờ này (Hệ thống tự động chọn).
                                    </div>
                                ) : (
                                    <select value={formData.receptionistId} onChange={e => handleChange('receptionistId', e.target.value)} required>
                                        <option value="">-- Chọn lễ tân để tạo ca trực cùng --</option>
                                        {availableReceptionists.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="shift-form-field">
                        <label>Ngày làm việc <span className="required">*</span></label>
                        <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
                    </div>

                    <div className="shift-form-row">
                        <div className="shift-form-field">
                            <label>Giờ bắt đầu <span className="required">*</span></label>
                            <input type="time" value={formData.startTime} onChange={e => handleChange('startTime', e.target.value)} required />
                        </div>
                        <div className="shift-form-field">
                            <label>Giờ kết thúc <span className="required">*</span></label>
                            <input type="time" value={formData.endTime} onChange={e => handleChange('endTime', e.target.value)} required />
                        </div>
                    </div>

                    {formData.role !== 'Lễ tân' && (
                        <div className="shift-form-field">
                            <label>Phòng khám <span className="required">*</span></label>
                            <select value={formData.room} onChange={e => handleChange('room', e.target.value)}>
                                {availableRooms.map(r => <option key={r} value={r}>{r}</option>)}
                                {!availableRooms.includes(formData.room) && formData.room && (
                                    <option value={formData.room} disabled>{formData.room} (Đang bận)</option>
                                )}
                            </select>
                        </div>
                    )}

                    <div className="shift-modal-footer">
                        <button type="button" className="customer-btn-cancel" onClick={onClose}>Hủy</button>
                        <PrimaryButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu lịch'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
