import { useState, useEffect } from 'react'
import axios from 'axios'
import { Icon } from '../../components/common/Icon/Icon'
import { Badge } from '../../components/common/Badge/Badge' // Import ở đây

export function LeaveList() {
    const [leaves, setLeaves] = useState([])

    useEffect(() => { fetchLeaves() }, [])

    const fetchLeaves = async () => {
        try {
            const res = await axios.get('/api/leaves')
            setLeaves(res.data.data.filter(l => l.leaveType !== 'Nghỉ lễ'))
        } catch (err) { console.error(err) }
    }

    const handleApprove = async (id) => {
        await axios.put(`/api/leaves/${id}/approve`)
        fetchLeaves()
    }

    return (
        <div className="staff-table-wrap">
            {/* Toolbar đồng bộ */}
            <div className="staff-toolbar" style={{ marginBottom: '16px' }}>
                <button type="button" className="staff-btn staff-btn--primary">
                    <Icon name="plus" size={16} /> Đăng ký nghỉ phép
                </button>
            </div>

            <table className="staff-table">
                <thead>
                    <tr>
                        <th>NHÂN VIÊN</th>
                        <th>THỜI GIAN</th>
                        <th>LOẠI PHÉP</th>
                        <th>TRẠNG THÁI</th>
                        <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map((leave) => (
                        <tr key={leave._id}>
                            <td style={{ fontWeight: 600 }}>{leave.staffId?.name || 'N/A'}</td>
                            <td>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                            <td>{leave.leaveType}</td>
                            <td>
                                <Badge variant={leave.status === 'Đã duyệt' ? 'success' : 'warning'}>
                                    {leave.status}
                                </Badge>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                {leave.status === 'Chờ duyệt' && (
                                    <>
                                        <button onClick={() => handleApprove(leave._id)} className="staff-btn staff-btn--success" style={{ marginRight: '8px' }}>Duyệt</button>
                                        <button className="staff-btn staff-btn--danger">Từ chối</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}