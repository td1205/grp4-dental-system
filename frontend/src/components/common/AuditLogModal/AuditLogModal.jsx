import React, { useState, useEffect } from 'react';
import { ModalWrapper } from '../ModalWrapper/ModalWrapper';
import apiClient from '../../../services/apiClient';
import { Icon } from '../Icon/Icon';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function AuditLogModal({ isOpen, onClose, user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchLogs();
    }
  }, [isOpen, user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In the backend, performedBy defaults to AD20260601, but we pass the actual user id if we have it
      // Let's just fetch all logs if user role is Admin, or filter by user id
      const res = await apiClient.get('/audit-logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Lịch sử hoạt động (Audit Log)"
      width="700px"
      footer={<button className="customer-btn-cancel" onClick={onClose}>Đóng</button>}
    >
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Đang tải...</p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Chưa có lịch sử hoạt động nào.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Thời gian</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Hành động</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Bảng</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Đối tượng</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Người thực hiện</th>
              </tr>
            </thead>
            <tbody style={{ color: '#334155' }}>
              {logs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: log.action === 'CREATE' ? '#dcfce7' : log.action === 'UPDATE' ? '#fef08a' : '#fee2e2',
                        color: log.action === 'CREATE' ? '#166534' : log.action === 'UPDATE' ? '#854d0e' : '#991b1b'
                    }}>
                        {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{log.collectionName}</td>
                  <td style={{ padding: '10px' }}>{log.documentName || `${String(log.documentId).substring(0, 8)}...`}</td>
                  <td style={{ padding: '10px', fontWeight: 500 }}>{log.performedByName || log.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ModalWrapper>
  );
}
