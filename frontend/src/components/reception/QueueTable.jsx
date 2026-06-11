import React from 'react';

export default function QueueTable() {
  // Dữ liệu giả định giống trong ảnh của bạn
  const patients = [
    { id: 1, time: '08:30', name: 'Nguyễn Văn A', phone: '0901234567', service: 'Khám tổng quát', doctor: 'BS. Hưng', status: 'Chờ tiếp đón' },
    { id: 2, time: '09:00', name: 'Trần Thị B', phone: '0901234568', service: 'Nhổ răng khôn', doctor: 'BS. Tiến', status: 'Chờ khám' },
    { id: 3, time: '09:15', name: 'Lê Văn C', phone: '0987654321', service: 'Niềng răng', doctor: 'BS. Hưng', status: 'Đang khám' },
  ];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
      <thead>
        <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ padding: '16px' }}>Thời gian</th>
          <th style={{ padding: '16px' }}>Tên bệnh nhân</th>
          <th style={{ padding: '16px' }}>SĐT</th>
          <th style={{ padding: '16px' }}>Dịch vụ</th>
          <th style={{ padding: '16px' }}>Bác sĩ chỉ định</th>
          <th style={{ padding: '16px' }}>Trạng thái</th>
          <th style={{ padding: '16px' }}>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((p) => (
          <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '16px' }}>{p.time}</td>
            <td style={{ padding: '16px', fontWeight: 'bold' }}>{p.name}</td>
            <td style={{ padding: '16px' }}>{p.phone}</td>
            <td style={{ padding: '16px' }}>{p.service}</td>
            <td style={{ padding: '16px' }}>{p.doctor}</td>
            <td style={{ padding: '16px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: p.status === 'Chờ tiếp đón' ? '#fef3c7' : p.status === 'Chờ khám' ? '#dcfce7' : '#dbeafe',
                color: p.status === 'Chờ tiếp đón' ? '#d97706' : p.status === 'Chờ khám' ? '#15803d' : '#1d4ed8'
              }}>
                {p.status}
              </span>
            </td>
            <td style={{ padding: '16px' }}>
              {p.status === 'Chờ tiếp đón' && (
                <button style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                  ✓ Xác nhận đến khám
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}