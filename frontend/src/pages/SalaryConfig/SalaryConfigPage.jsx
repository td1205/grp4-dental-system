import { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icon/Icon';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

export function SalaryConfigPage() {
  const [doctors, setDoctors] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/salary-config');
      setDoctors(res.data.data.doctors || []);
      setHistory(res.data.data.history || []);
    } catch (err) {
      toast.error('Lỗi khi lấy dữ liệu cấu hình lương');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (index, field, value) => {
    const updated = [...doctors];
    updated[index] = { ...updated[index], [field]: value };
    setDoctors(updated);
  };

  const handleSubmit = async () => {
    if (!effectiveDate) {
      return toast.error('Vui lòng chọn ngày áp dụng để lưu định mức');
    }

    try {
      const res = await apiClient.post('/salary-config', { configs: doctors, effectiveDate });
      toast.success(res.data.message || 'Thiết lập mức tiền cơ bản thành công');
      setEffectiveDate('');
      loadData();
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Lỗi khi thiết lập định mức');
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  return (
    <>
      <Toaster />
      <div className="staff-page" id="salary-config-page">
        {/* Blue Alert Box matching Screenshot */}
        <div style={{
          backgroundColor: '#e0f2fe',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0369a1', marginBottom: '8px' }}>Thiết lập định mức tiền lương</h2>
          <p style={{ color: '#0c4a6e', fontSize: '14px', margin: 0 }}>
            Đặt lương cơ bản/giờ và hệ số phức tạp cho từng bác sĩ. Công thức: Lương = Số giờ quy đổi × Lương/giờ × Hệ số
          </p>
        </div>

        {/* Doctor Configuration Table matching Screenshot */}
        <div className="staff-card" style={{ padding: '0' }}>
          <h3 style={{ padding: '20px 24px', fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
            Định mức theo bác sĩ
          </h3>
          <div className="staff-table-wrap">
            <table className="staff-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Mã BS</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Họ tên</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Chuyên khoa</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Lương cơ bản/giờ (VND)</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Hệ số phức tạp</th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Lương giờ hiệu dụng</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                   <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
                ) : doctors.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu bác sĩ</td></tr>
                ) : (
                  doctors.map((doc, index) => {
                    const amount = Number(doc.amount) || 0;
                    const factor = Number(doc.complexityFactor) || 1;
                    const effectiveAmount = amount * factor;

                    return (
                      <tr key={doc.doctorId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', color: '#0284c7', fontWeight: '600' }}>{doc.maBS}</td>
                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>BS. {doc.name}</td>
                        <td style={{ padding: '16px 24px', color: '#475569' }}>{doc.specialty}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <input 
                            type="number"
                            className="revenue-input"
                            style={{ width: '120px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            value={doc.amount}
                            onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <input 
                            type="number"
                            step="0.1"
                            className="revenue-input"
                            style={{ width: '80px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            value={doc.complexityFactor}
                            onChange={(e) => handleInputChange(index, 'complexityFactor', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#16a34a' }}>
                          {formatCurrency(effectiveAmount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: '600', color: '#334155' }}>Ngày áp dụng mới:</label>
              <input 
                type="date"
                className="revenue-input"
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
            <button 
              type="button"
              className="staff-btn staff-btn--primary"
              style={{ backgroundColor: '#1d4ed8', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              onClick={handleSubmit}
            >
              <Icon name="save" size={16} /> Lưu định mức
            </button>
          </div>
        </div>

        {/* Bảng lịch sử (To satisfy UC4.1_FUNC_003) */}
        <div className="staff-card" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>Bảng lịch sử thay đổi (Tất cả bác sĩ)</h3>
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>NGÀY THAY ĐỔI</th>
                  <th>BÁC SĨ</th>
                  <th>MỨC CƠ BẢN/GIỜ</th>
                  <th>HỆ SỐ</th>
                  <th>NGÀY ÁP DỤNG</th>
                  <th>NGƯỜI TẠO</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Chưa có lịch sử thay đổi</td></tr>
                ) : (
                  history.map((config) => (
                    <tr key={config._id}>
                      <td>{format(new Date(config.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                      <td style={{ fontWeight: '500' }}>{config.doctorId?.name || 'N/A'}</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(config.amount)}</td>
                      <td>{config.complexityFactor}</td>
                      <td>
                        <span className="staff-badge staff-badge--role staff-badge--role-doctor">
                          {format(new Date(config.effectiveDate), 'dd/MM/yyyy')}
                        </span>
                      </td>
                      <td>{config.createdBy?.name || 'Admin'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
