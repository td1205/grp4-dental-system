import { useState, useEffect } from 'react'
import apiClient from '../../services/apiClient'
import { Icon } from '../../components/common/Icon/Icon'
import { LeaveTable } from '../../components/common/LeaveTable/LeaveTable'
import toast from 'react-hot-toast'
import { EmergencyLeaveModal } from '../../components/staff/form/EmergencyLeaveModal'

export function LeaveList() {
    const [leaves, setLeaves] = useState([])
    const [isEmergencyOpen, setIsEmergencyOpen] = useState(false)

    useEffect(() => { fetchLeaves() }, [])

    const fetchLeaves = async () => {
        try {
            const res = await apiClient.get('/leaves')
            setLeaves(res.data.data.filter(l => l.leaveType !== 'Nghỉ lễ'))
        } catch (err) { console.error(err) }
    }
    const handleApprove = async (id, isCancelRequest = false) => {
        try {
            if (isCancelRequest) {
                await apiClient.put(`/leaves/${id}/approve-cancel`)
                toast.success('Đã xác nhận hủy đơn')
            } else {
                await apiClient.put(`/leaves/${id}/approve`)
                toast.success('Đã duyệt đơn nghỉ phép')
            }
            fetchLeaves()
        } catch (err) { toast.error('Lỗi khi duyệt') }
    }

    const handleReject = async (id) => {
        const reason = window.prompt('Vui lòng nhập lý do từ chối:');
        if (!reason) return; // Cancelled or empty
        try {
            await apiClient.put(`/leaves/${id}/reject`, { rejectionReason: reason })
            toast.success('Đã từ chối đơn')
            fetchLeaves()
        } catch (err) { toast.error('Lỗi khi từ chối') }
    }

    return (
        <div className="staff-table-wrap">
            {/* Toolbar đồng bộ */}
            <div className="staff-toolbar" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    type="button" 
                    className="staff-btn staff-btn--danger"
                    onClick={() => setIsEmergencyOpen(true)}
                >
                    <Icon name="plus" size={16} /> Ghi nhận vắng mặt khẩn cấp
                </button>
            </div>

            <LeaveTable 
                leaves={leaves} 
                role="Admin" 
                onApprove={handleApprove} 
                onReject={handleReject} 
            />

            {isEmergencyOpen && (
                <EmergencyLeaveModal 
                    isOpen={isEmergencyOpen}
                    onClose={() => setIsEmergencyOpen(false)}
                    onSuccess={fetchLeaves}
                />
            )}
        </div>
    )
}