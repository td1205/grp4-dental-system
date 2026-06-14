import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '../../common/ModalWrapper/ModalWrapper';
import apiClient from '../../../services/apiClient';
import toast from 'react-hot-toast';
import { LeaveTable } from '../../common/LeaveTable/LeaveTable';

export function MyLeaveRequestsModal({ isOpen, onClose }) {
    const [leaves, setLeaves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchLeaves();
        }
    }, [isOpen]);

    const fetchLeaves = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/leaves');
            // Filter out system holidays, only keep personal ones
            setLeaves(res.data.data.filter(l => l.leaveType !== 'Nghỉ lễ'));
        } catch (err) {
            toast.error('Lỗi tải danh sách đơn xin nghỉ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelLeave = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn xin nghỉ này?')) return;
        try {
            const res = await apiClient.put(`/leaves/${id}/cancel`);
            toast.success(res.data.message);
            fetchLeaves();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi hủy đơn');
        }
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Lịch sử xin nghỉ phép"
            width="800px"
        >
            {isLoading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <LeaveTable 
                        leaves={leaves} 
                        role="Staff" 
                        onCancel={handleCancelLeave} 
                    />
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="customer-btn-cancel" onClick={onClose}>Đóng</button>
            </div>
        </ModalWrapper>
    );
}
