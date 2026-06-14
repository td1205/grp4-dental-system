import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '../../common/ModalWrapper/ModalWrapper';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';

export function EmergencyLeaveModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        staffId: '',
        startDate: '',
        endDate: '',
        duration: 'Cả ngày',
        leaveType: 'Việc riêng',
        reason: 'Sự cố y khoa / Ốm đau khẩn cấp'
    });
    const [staffs, setStaffs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStaffs();
        }
    }, [isOpen]);

    const fetchStaffs = async () => {
        try {
            const res = await apiClient.get('/users?role=Doctor,Receptionist');
            setStaffs(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, staffId: res.data[0]._id }));
            }
        } catch (err) {
            console.error('Lỗi tải nhân viên:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post('/leaves/emergency-leave', formData);
            toast.success('Ghi nhận vắng mặt khẩn cấp thành công!');
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi xử lý');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Ghi nhận vắng mặt khẩn cấp"
            width="500px"
        >
            <form onSubmit={handleSubmit}>
                <div className="shift-form-field" style={{ marginBottom: '16px' }}>
                    <label>Nhân sự <span className="required">*</span></label>
                    <select 
                        required
                        value={formData.staffId}
                        onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    >
                        {staffs.map(staff => (
                            <option key={staff._id} value={staff._id}>
                                {staff.name} - {staff.role}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="shift-form-field">
                        <label>Từ ngày <span className="required">*</span></label>
                        <input 
                            type="date" required
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                    </div>
                    <div className="shift-form-field">
                        <label>Đến ngày <span className="required">*</span></label>
                        <input 
                            type="date" required
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="shift-form-field">
                        <label>Hình thức <span className="required">*</span></label>
                        <select 
                            value={formData.duration}
                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        >
                            <option value="Cả ngày">Cả ngày</option>
                            <option value="Sáng">Sáng</option>
                            <option value="Chiều">Chiều</option>
                        </select>
                    </div>
                    <div className="shift-form-field">
                        <label>Loại vắng mặt <span className="required">*</span></label>
                        <select 
                            value={formData.leaveType}
                            onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                        >
                            <option value="Việc riêng">Việc riêng</option>
                            <option value="Nghỉ bệnh">Nghỉ bệnh</option>
                        </select>
                    </div>
                </div>

                <div className="shift-form-field" style={{ marginBottom: '24px' }}>
                    <label>Lý do khẩn cấp <span className="required">*</span></label>
                    <textarea 
                        required rows={3}
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="customer-btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" className="staff-btn staff-btn--danger" disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : 'Ghi nhận ngay'}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}
