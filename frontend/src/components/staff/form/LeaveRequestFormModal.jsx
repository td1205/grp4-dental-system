import React, { useState } from 'react';
import { ModalWrapper } from '../../common/ModalWrapper/ModalWrapper';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MacDropdown } from '../../common/MacDropdown/MacDropdown';

export function LeaveRequestFormModal({ isOpen, onClose, initialDate, onSuccess }) {
    const [formData, setFormData] = useState({
        startDate: initialDate ? format(new Date(initialDate), 'yyyy-MM-dd') : '',
        endDate: initialDate ? format(new Date(initialDate), 'yyyy-MM-dd') : '',
        duration: 'Cả ngày',
        leaveType: 'Phép năm',
        reason: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            return toast.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
        }

        setIsLoading(true);
        try {
            await apiClient.post('/leaves/register', formData);
            toast.success('Đã gửi đơn xin nghỉ thành công! Vui lòng chờ phê duyệt.');
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi tạo đơn xin nghỉ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Khởi tạo đơn xin nghỉ phép"
            width="500px"
        >
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="shift-form-field">
                        <label>Ngày bắt đầu <span className="required">*</span></label>
                        <input 
                            type="date" 
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                    </div>
                    <div className="shift-form-field">
                        <label>Ngày kết thúc <span className="required">*</span></label>
                        <input 
                            type="date" 
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="shift-form-field">
                        <label>Hình thức nghỉ <span className="required">*</span></label>
                        <MacDropdown 
                            value={formData.duration}
                            onChange={(val) => setFormData({...formData, duration: val})}
                            options={[
                                { value: "Cả ngày", label: "Cả ngày" },
                                { value: "Sáng", label: "Nửa ngày (Sáng)" },
                                { value: "Chiều", label: "Nửa ngày (Chiều)" }
                            ]}
                        />
                    </div>
                    <div className="shift-form-field">
                        <label>Loại nghỉ <span className="required">*</span></label>
                        <MacDropdown 
                            value={formData.leaveType}
                            onChange={(val) => setFormData({...formData, leaveType: val})}
                            options={[
                                { value: "Phép năm", label: "Phép năm" },
                                { value: "Việc riêng", label: "Việc riêng" },
                                { value: "Nghỉ bệnh", label: "Nghỉ bệnh" }
                            ]}
                        />
                    </div>
                </div>

                <div className="shift-form-field" style={{ marginBottom: '24px' }}>
                    <label>Lý do xin nghỉ <span className="required">*</span></label>
                    <textarea 
                        required
                        rows={3}
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Nhập lý do chi tiết..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="customer-btn-cancel" onClick={onClose}>Hủy</button>
                    <button type="submit" className="staff-btn staff-btn--success" disabled={isLoading}>
                        {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}
