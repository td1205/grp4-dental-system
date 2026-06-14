import { useState } from 'react';
import apiClient from '../../../services/apiClient';
import { PrimaryButton } from '../../ui/Button/PrimaryButton';
import toast from 'react-hot-toast';
import { format, startOfWeek, addWeeks } from 'date-fns';

export function CopyShiftModal({ isOpen, onClose, onSuccess, currentWeek }) {
    const [sourceDate, setSourceDate] = useState(format(startOfWeek(currentWeek || new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    const [targetDate, setTargetDate] = useState(format(startOfWeek(addWeeks(currentWeek || new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async (ignoreHolidays = false) => {
        setIsLoading(true);
        try {
            const res = await apiClient.post('/shifts/copy', {
                sourceDate,
                targetDate,
                ignoreHolidays
            });
            toast.success(res.data.message || 'Sao chép thành công!');
            onSuccess();
            onClose();
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.hasHoliday) {
                if (window.confirm(err.response.data.message)) {
                    handleCopy(true);
                }
            } else {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi sao chép lịch');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="shift-modal-overlay" onClick={onClose}>
            <div className="shift-modal-box" onClick={e => e.stopPropagation()}>
                <div className="shift-modal-header">
                    <h2>Sao chép lịch tuần</h2>
                    <button className="shift-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="shift-modal-body">
                    <p style={{marginBottom: '16px', color: '#6b7280', fontSize: '14px', lineHeight: '1.5'}}>
                        Tính năng này sẽ sao chép toàn bộ ca trực của tuần nguồn sang tuần đích tương ứng. Hệ thống sẽ tự động rà soát trùng lặp và ngày nghỉ lễ.
                    </p>
                    
                    <div className="shift-form-row">
                        <div className="shift-form-field" style={{ flex: 1 }}>
                            <label style={{ whiteSpace: 'nowrap' }}>Ngày trong tuần nguồn <span className="required">*</span></label>
                            <input type="date" value={sourceDate} onChange={e => setSourceDate(e.target.value)} required style={{ width: '100%' }} />
                        </div>
                        <div className="shift-form-field" style={{ flex: 1 }}>
                            <label style={{ whiteSpace: 'nowrap' }}>Ngày trong tuần đích <span className="required">*</span></label>
                            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div className="shift-modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="customer-btn-cancel" onClick={onClose}>Hủy</button>
                        <PrimaryButton type="button" onClick={() => handleCopy(false)} disabled={isLoading}>
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận sao chép'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
