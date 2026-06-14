import React from 'react';
import { QueueCard } from '../QueueCard/QueueCard';
// import './QueueList.css'; // Mở comment nếu bạn có file CSS cho QueueList

export const QueueList = ({ patients, onCallPatient }) => {
    // Sắp xếp ưu tiên: 'Đang khám' lên đầu, sau đó 'Chờ khám', 'Chờ tiếp đón', cuối cùng là 'Đã hoàn thành'
    const sortedPatients = [...patients].sort((a, b) => {
        const priority = {
            'Đang khám': 1,
            'Chờ khám': 2,
            'Chờ tiếp đón': 3,
            'Đã hoàn thành': 4
        };
        const pA = priority[a.status] || 5;
        const pB = priority[b.status] || 5;
        return pA - pB;
    });

    return (
        <div className="queue-list-container">
            {sortedPatients.map((patient) => (
                <QueueCard
                    key={patient._id || patient.id}
                    patient={patient}
                    onCallPatient={onCallPatient}
                />
            ))}
        </div>
    );
};