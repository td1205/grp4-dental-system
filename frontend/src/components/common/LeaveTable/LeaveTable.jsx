import React from 'react';
import { Badge } from '../Badge/Badge';

export function LeaveTable({ leaves, role, onApprove, onReject, onCancel }) {
    return (
        <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {role === 'Admin' && <th style={{ padding: '12px' }}>NHÂN VIÊN</th>}
                    <th style={{ padding: '12px' }}>THỜI GIAN</th>
                    <th style={{ padding: '12px' }}>HÌNH THỨC</th>
                    <th style={{ padding: '12px' }}>LOẠI PHÉP</th>
                    <th style={{ padding: '12px', width: '25%' }}>LÝ DO</th>
                    <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                    <th style={{ padding: '12px', textAlign: role === 'Admin' ? 'right' : 'left' }}>THAO TÁC</th>
                </tr>
            </thead>
            <tbody>
                {leaves.length === 0 ? (
                    <tr>
                        <td colSpan={role === 'Admin' ? 7 : 6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                            Chưa có đơn xin nghỉ nào.
                        </td>
                    </tr>
                ) : leaves.map((leave) => (
                    <tr key={leave._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {role === 'Admin' && (
                            <td style={{ padding: '12px', fontWeight: 600 }}>{leave.staffId?.name || 'N/A'}</td>
                        )}
                        <td style={{ padding: '12px' }}>
                            {new Date(leave.startDate).toLocaleDateString('vi-VN')}
                            {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString('vi-VN')}`}
                        </td>
                        <td style={{ padding: '12px' }}>{leave.duration}</td>
                        <td style={{ padding: '12px' }}>{leave.leaveType}</td>
                        <td style={{ padding: '12px' }}>{leave.reason}</td>
                        <td style={{ padding: '12px' }}>
                            <Badge variant={
                                leave.status === 'Đã duyệt' ? 'success' : 
                                leave.status === 'Từ chối' || leave.status === 'Đã hủy' ? 'danger' : 'warning'
                            }>
                                {leave.status}
                            </Badge>
                            {leave.rejectionReason && (
                                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                                    Lý do: {leave.rejectionReason}
                                </div>
                            )}
                        </td>
                        <td style={{ padding: '12px', textAlign: role === 'Admin' ? 'right' : 'left' }}>
                            {role === 'Admin' ? (
                                <>
                                    {leave.status === 'Chờ duyệt' && (
                                        <>
                                            <button onClick={() => onApprove(leave._id)} className="staff-btn staff-btn--success" style={{ marginRight: '8px' }}>Duyệt</button>
                                            <button onClick={() => onReject(leave._id)} className="staff-btn staff-btn--danger">Từ chối</button>
                                        </>
                                    )}
                                    {leave.status === 'Chờ hủy phép' && (
                                        <button onClick={() => onApprove(leave._id, true)} className="staff-btn staff-btn--primary">
                                            Xác nhận hủy
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    {(leave.status === 'Chờ duyệt' || leave.status === 'Đã duyệt') && (
                                        <button 
                                            onClick={() => onCancel(leave._id)}
                                            className="customer-btn-cancel" 
                                            style={{ padding: '4px 8px', fontSize: '12px' }}
                                        >
                                            Rút đơn
                                        </button>
                                    )}
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
