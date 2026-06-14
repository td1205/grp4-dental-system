import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorDashboardPage.css';

export const DoctorDashboardPage = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sử dụng Mock Data thay cho API thật đang bị lỗi
    useEffect(() => {
        const mockPatients = [
            { id: 1, stt: '01', ma_bn: 'BN260601', name: 'Nguyễn Văn A', time: '08:00', service: 'Khám tổng quát', status: 'Đang khám' },
            { id: 2, stt: '02', ma_bn: 'BN260602', name: 'Trần Thị B', time: '08:30', service: 'Nhổ răng khôn', status: 'Chờ khám' },
            { id: 3, stt: '03', ma_bn: 'BN260603', name: 'Lê Văn C', time: '09:00', service: 'Tẩy trắng răng', status: 'Chờ tiếp đón' },
            { id: 4, stt: '04', ma_bn: 'BN260604', name: 'Phạm Thị D', time: '07:30', service: 'Hàn răng', status: 'Đã hoàn thành' }
        ];

        // Giả lập thời gian tải dữ liệu (0.5 giây) để UI mượt mà hơn
        setTimeout(() => {
            setPatients(mockPatients);
            setLoading(false);
            setError(null);
        }, 500);
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
                                                // Chuyển hướng sang trang Khám bệnh kèm mã bệnh nhân
                                                onClick={() => navigate(`/doctor/medical-record/${p.ma_bn}`)}
                                                disabled={p.status === 'Đã hoàn thành'}
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
                            <span style={{ color: '#64748b' }}>Phòng khám:</span>
                            <strong>P.01 - Tổng quát</strong>
                        </div>
                        <div className="widget-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b' }}>Khung giờ:</span>
                            <strong>Ca Sáng (08:00 - 12:00)</strong>
                        </div>
                        <div className="widget-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Lễ tân hỗ trợ:</span>
                            <strong>Nguyễn Thị Lễ Tân</strong>
                        </div>
                    </div>
                    {/* Đã xóa hoàn toàn khối "Thao tác nhanh" ở vị trí này */}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboardPage;