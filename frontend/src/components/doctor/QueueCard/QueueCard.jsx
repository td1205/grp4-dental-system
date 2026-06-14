import React from 'react';
import './QueueCard.css';
import { Badge } from '../../common/Badge/Badge';

export const QueueCard = ({ patient, onCallPatient }) => {
    // Hàm xác định màu sắc Badge dựa trên trạng thái
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Chờ tiếp đón': return <Badge variant="secondary">Chờ tiếp đón</Badge>;
            case 'Chờ khám': return <Badge variant="warning">Chờ khám</Badge>;
            case 'Đang khám': return <Badge variant="primary">Đang khám</Badge>;
            case 'Đã hoàn thành': return <Badge variant="success">Hoàn thành</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    // Đảm bảo lấy đúng ID
    const patientId = patient?._id || patient?.id;

    return (
        <div className={`queue-card ${patient?.status === 'Chờ khám' ? 'queue-card--active' : ''}`}>
            <div className="queue-card-header">
                <div className="queue-card-info">
                    <span className="queue-card-stt">STT: {patient?.stt || '--'}</span>
                    <h4 className="queue-card-name">{patient?.name || patient?.patientName || 'Chưa cập nhật'}</h4>
                    <span className="queue-card-id">ID: {patient?.ma_bn || patient?.patientCode || 'N/A'}</span>
                </div>
                <div className="queue-card-status">
                    {getStatusBadge(patient?.status)}
                </div>
            </div>

            <div className="queue-card-body">
                <div className="queue-card-detail">
                    <strong>Giờ hẹn:</strong> {patient?.time || patient?.appointmentTime || '--:--'}
                </div>
                <div className="queue-card-detail">
                    <strong>Dịch vụ:</strong> {patient?.service || patient?.serviceName || 'Chưa xác định'}
                </div>
            </div>

            <div className="queue-card-footer">
                {patient?.status === 'Chờ khám' && (
                    <button
                        className="btn-call-patient"
                        onClick={() => onCallPatient(patientId)}
                    >
                        Vào khám
                    </button>
                )}

                {patient?.status === 'Đang khám' && (
                    <button
                        className="btn-view-record"
                        onClick={() => onCallPatient(patientId)}
                    >
                        Tiếp tục khám
                    </button>
                )}
            </div>
        </div>
    );
};