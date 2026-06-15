import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import './DoctorDashboardPage.css';

export const DoctorDashboardPage = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Lấy thông tin user hiện tại (Bác sĩ) và danh sách lịch hẹn
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user info from localStorage
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    setUser(JSON.parse(userStr));
                }

                // Fetch appointments for today
                const res = await apiClient.get('/appointments');
                const apts = res.data.data || [];
                
                // Format data for the UI
                const formattedPatients = apts.map((apt, index) => ({
                    id: apt._id,
                    stt: (index + 1).toString().padStart(2, '0'),
                    ma_bn: apt.customerId?.id || 'Không rõ',
                    name: apt.customerId?.name || 'Bệnh nhân',
                    time: apt.time,
                    service: apt.serviceId?.name || 'Khám bệnh',
                    status: apt.status
                }));
                
                setPatients(formattedPatients);
            } catch (err) {
                setError('Không thể tải dữ liệu hàng đợi. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đang khám': return 'status-examining';
            case 'Chờ khám': return 'status-waiting';
            case 'Chờ tiếp đón': return 'status-pending';
            case 'Đã hoàn thành': return 'status-completed';
            default: return '';
        }
    };

    return (
        <div className="doctor-dashboard">
            <div className="dashboard-header">
                <h2>Trạm làm việc Bác sĩ</h2>
                <div className="date-display">Ngày hiện tại: {new Date().toLocaleDateString('vi-VN')}</div>
            </div>

            <div className="dashboard-content">
                {/* Cột trái: Danh sách Hàng đợi */}
                <div className="queue-section">
                    <div className="section-header">
                        <h3>Hàng đợi lâm sàng</h3>
                        <span className="badge">{patients.length} Bệnh nhân</span>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                            Đang tải danh sách hàng đợi...
                        </p>
                    ) : error ? (
                        <p className="error-text" style={{ color: 'red', textAlign: 'center' }}>
                            {error}
                        </p>
                    ) : (
                        <div className="queue-list">
                            {patients.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                    Hiện tại chưa có bệnh nhân nào trong hàng đợi.
                                </p>
                            ) : (
                                patients.map(p => (
                                    <div key={p.id} className="queue-item">
                                        <div className="queue-info">
                                            <span className="queue-stt">{p.stt}</span>
                                            <div className="patient-details">
                                                <h4>{p.name} <span className="patient-id">#{p.ma_bn}</span></h4>
                                                <p>Giờ hẹn: {p.time} | Dịch vụ: {p.service}</p>
                                            </div>
                                        </div>
                                        <div className="queue-actions">
                                            <span className={`status-badge ${getStatusColor(p.status)}`}>{p.status}</span>
                                            <button
                                                className="btn-exam"
                                                onClick={async () => {
                                                    try {
                                                        if (p.status !== 'Đang khám') {
                                                            await apiClient.put(`/appointments/${p.id}/status`, { status: 'Đang khám' });
                                                        }
                                                        navigate(`/doctor/medical-record/${p.id}`);
                                                    } catch (err) {
                                                        toast.error('Không thể chuyển trạng thái Đang khám!');
                                                    }
                                                }}
                                                disabled={p.status === 'Đã hoàn thành' || p.status === 'Chờ tiếp đón' || p.status === 'Đã hủy'}
                                            >
                                                {p.status === 'Đang khám' ? 'Tiếp tục khám' : 'Vào khám'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Cột phải: Thông tin */}
                <div className="info-section">
                    <div className="doctor-widget">
                        <h4>Ca trực hiện tại</h4>
                        <div className="widget-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b' }}>Bác sĩ:</span>
                            <strong>{user?.name || 'Đang tải...'}</strong>
                        </div>
                        <div className="widget-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b' }}>Hàng đợi hiện tại:</span>
                            <strong>{patients.filter(p => p.status === 'Chờ khám' || p.status === 'Đang khám').length} bệnh nhân</strong>
                        </div>
                    </div>
                    {/* Đã xóa hoàn toàn khối "Thao tác nhanh" ở vị trí này */}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboardPage;