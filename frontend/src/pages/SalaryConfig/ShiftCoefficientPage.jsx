import { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icon/Icon';
import { StaffConfirmModal } from '../../components/staff/StaffConfirmModal';
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

export function ShiftCoefficientPage() {
  const [activeTab, setActiveTab] = useState('matrix');

  // --- TAB 1: MA TRẬN HỆ SỐ MẪU ---
  const defaultCoeffs = {
    morningWeekday: 1.0,
    morningWeekend: 1.0,
    morningHoliday: 1.0,
    afternoonWeekday: 1.0,
    afternoonWeekend: 1.0,
    afternoonHoliday: 1.0,
  };

  const [coeffs, setCoeffs] = useState({ ...defaultCoeffs });
  const [originalCoeffs, setOriginalCoeffs] = useState({ ...defaultCoeffs });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadMatrixData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/shift-coefficients');
      const data = res.data.data;
      if (data) {
        setCoeffs(data);
        setOriginalCoeffs(data);
      }
    } catch (err) {
      toast.error('Lỗi khi lấy dữ liệu cấu hình hệ số ca');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'matrix') {
      loadMatrixData();
    }
  }, [activeTab]);

  const handleInputChange = (field, value) => {
    setCoeffs({ ...coeffs, [field]: value });
  };

  const validateMatrixForm = () => {
    const fields = ['morningWeekday', 'morningWeekend', 'morningHoliday', 'afternoonWeekday', 'afternoonWeekend', 'afternoonHoliday'];
    for (const field of fields) {
      const val = coeffs[field];
      if (val === undefined || val === null || val === '') {
        toast.error('Vui lòng nhập đầy đủ giá trị cho tất cả các ô');
        return false;
      }
      const numVal = Number(val);
      if (isNaN(numVal) || numVal < 1.0) {
        toast.error('Hệ số ca làm việc phải là số dương và không được nhỏ hơn 1.0');
        return false;
      }
    }
    return true;
  };

  const handleMatrixSave = async () => {
    try {
      setIsConfirmOpen(false);
      const res = await apiClient.put('/shift-coefficients', coeffs);
      toast.success(res.data.message || 'Cập nhật hệ số ca làm việc thành công');
      const updatedData = res.data.data;
      setCoeffs(updatedData);
      setOriginalCoeffs(updatedData);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Lỗi khi cập nhật định mức hệ số');
      }
    }
  };

  // --- TAB 2: QUẢN LÝ HỆ SỐ CA BỆNH PHỨC TẠP ---
  const [complexShifts, setComplexShifts] = useState([]);
  const [isComplexLoading, setIsComplexLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selectedShift, setSelectedShift] = useState(null);
  const [isComplexModalOpen, setIsComplexModalOpen] = useState(false);

  const loadComplexCases = async () => {
    try {
      setIsComplexLoading(true);
      const params = new URLSearchParams();
      if (filterName) params.append('doctorName', filterName);
      if (filterSpecialty) params.append('specialty', filterSpecialty);
      if (filterStatus) params.append('status', filterStatus);

      const res = await apiClient.get('/complex-cases?' + params.toString());
      setComplexShifts(res.data.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách ca bệnh phức tạp');
      console.error(err);
    } finally {
      setIsComplexLoading(false);
    }
  };

  // Debounce filter
  useEffect(() => {
    if (activeTab === 'complex') {
      const delayId = setTimeout(() => {
        loadComplexCases();
      }, 300);
      return () => clearTimeout(delayId);
    }
  }, [activeTab, filterName, filterSpecialty, filterStatus]);

  const handleOpenComplexModal = (shift) => {
    // Clone shift to edit safely
    setSelectedShift(JSON.parse(JSON.stringify(shift)));
    setIsComplexModalOpen(true);
  };

  const handleComplexInputChange = (recordId, field, value) => {
    const updatedRecords = selectedShift.medicalRecords.map(r => 
      r.recordId === recordId ? { ...r, [field]: value } : r
    );
    setSelectedShift({ ...selectedShift, medicalRecords: updatedRecords });
  };

  const submitComplexCase = async () => {
    try {
      const res = await apiClient.put(`/complex-cases/${selectedShift._id}`, {
        medicalRecords: selectedShift.medicalRecords
      });
      toast.success(res.data.message || 'Cập nhật hệ số thành công');
      setIsComplexModalOpen(false);
      loadComplexCases(); // Reload
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Lỗi khi phê duyệt hệ số');
      }
    }
  };

  const isLocked = selectedShift?.coefficientStatus === 'Đã chốt lương';

  return (
    <>
      <Toaster />
      <div className="staff-page" id="shift-coefficient-page">
        {/* TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', paddingBottom: '0' }}>
          <button
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
              color: activeTab === 'matrix' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'matrix' ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            Ma trận Hệ số mẫu
          </button>
          <button
            onClick={() => setActiveTab('complex')}
            style={{
              padding: '12px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600',
              color: activeTab === 'complex' ? '#2563eb' : '#64748b',
              borderBottom: activeTab === 'complex' ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            Hệ số ca bệnh phức tạp
          </button>
        </div>

        {activeTab === 'matrix' && (
          <div>
            <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0369a1', marginBottom: '8px' }}>Thiết lập hệ số ca làm việc</h2>
              <p style={{ color: '#0c4a6e', fontSize: '14px', margin: 0 }}>
                Hệ số sẽ tự động áp dụng cho các ngày trong năm mà không bắt người dùng phải nhập lại từng tuần, tối ưu hóa thời gian tính lương.
              </p>
            </div>

            <div className="staff-card" style={{ padding: '0' }}>
              <h3 style={{ padding: '20px 24px', fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
                Ma trận Hệ số mẫu
              </h3>
              <div className="staff-table-wrap">
                <table className="staff-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', width: '25%' }}>Ca làm việc</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b', fontWeight: '600', width: '25%' }}>Ngày trong tuần (T2-T6)</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b', fontWeight: '600', width: '25%' }}>Ngày cuối tuần (T7, CN)</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b', fontWeight: '600', width: '25%' }}>Ngày Lễ, Tết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
                    ) : (
                      <>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="sun" size={18} color="#f59e0b" /> Ca sáng</div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {isEditing ? <input type="number" step="0.1" className="revenue-input" style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }} value={coeffs.morningWeekday} onChange={e => handleInputChange('morningWeekday', e.target.value)} /> : <span style={{ fontSize: '16px', fontWeight: '500' }}>{coeffs.morningWeekday}</span>}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {isEditing ? <input type="number" step="0.1" className="revenue-input" style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }} value={coeffs.morningWeekend} onChange={e => handleInputChange('morningWeekend', e.target.value)} /> : <span style={{ fontSize: '16px', fontWeight: '500' }}>{coeffs.morningWeekend}</span>}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {isEditing ? <input type="number" step="0.1" className="revenue-input" style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }} value={coeffs.morningHoliday} onChange={e => handleInputChange('morningHoliday', e.target.value)} /> : <span style={{ fontSize: '16px', fontWeight: '500' }}>{coeffs.morningHoliday}</span>}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="moon" size={18} color="#6366f1" /> Ca chiều</div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {isEditing ? <input type="number" step="0.1" className="revenue-input" style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }} value={coeffs.afternoonWeekday} onChange={e => handleInputChange('afternoonWeekday', e.target.value)} /> : <span style={{ fontSize: '16px', fontWeight: '500' }}>{coeffs.afternoonWeekday}</span>}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {isEditing ? <input type="number" step="0.1" className="revenue-input" style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }} value={coeffs.afternoonWeekend} onChange={e => handleInputChange('afternoonWeekend', e.target.value)} /> : <span style={{ fontSize: '16px', fontWeight: '500' }}>{coeffs.afternoonWeekend}</span>}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {isEditing ? <input type="number" step="0.1" className="revenue-input" style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }} value={coeffs.afternoonHoliday} onChange={e => handleInputChange('afternoonHoliday', e.target.value)} /> : <span style={{ fontSize: '16px', fontWeight: '500' }}>{coeffs.afternoonHoliday}</span>}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', borderTop: '1px solid #f1f5f9' }}>
                {isEditing ? (
                  <>
                    <button type="button" className="staff-btn staff-btn--outline" onClick={() => {setCoeffs({ ...originalCoeffs }); setIsEditing(false);}}>Huỷ</button>
                    <button type="button" className="staff-btn staff-btn--primary" onClick={() => { if (validateMatrixForm()) setIsConfirmOpen(true); }}><Icon name="save" size={16} /> Lưu</button>
                  </>
                ) : (
                  <button type="button" className="staff-btn staff-btn--primary" onClick={() => setIsEditing(true)}><Icon name="edit" size={16} /> Chỉnh sửa hệ số mẫu</button>
                )}
              </div>
            </div>

            <StaffConfirmModal
              open={isConfirmOpen}
              title="Xác nhận lưu"
              message="Bạn có chắc chắn muốn lưu lại các thay đổi của ma trận hệ số ca làm việc này?"
              confirmLabel="Đồng ý"
              cancelLabel="Huỷ"
              onConfirm={handleMatrixSave}
              onCancel={() => setIsConfirmOpen(false)}
            />
          </div>
        )}

        {activeTab === 'complex' && (
          <div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon name="info" size={18} color="#16a34a" />
                <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#166534', margin: 0 }}>Hướng dẫn gán hệ số ca bệnh lâm sàng</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', color: '#14532d', fontSize: '14px' }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '6px' }}><strong>+0.4 đến +0.5:</strong> Phẫu thuật phức tạp, Cấy ghép Implant đa trụ, Nhổ răng khôn mọc ngầm rủi ro cao.</li>
                  <li style={{ marginBottom: '6px' }}><strong>+0.2 đến +0.3:</strong> Chữa tủy răng hàm, Bọc răng sứ thẩm mỹ, Nhổ răng khôn mọc lệch thông thường.</li>
                </ul>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '6px' }}><strong>+0.1:</strong> Các thủ thuật tiểu phẫu nhỏ có gây tê sâu.</li>
                  <li style={{ marginBottom: '6px' }}><strong>0 (Không ghi nhận):</strong> Khám tổng quát, Lấy cao răng, Trám răng thông thường.</li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                <Icon name="search" size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="search" 
                  placeholder="Tìm kiếm ca trực theo tên bác sĩ..." 
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 14px 0 38px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#1d4ed8'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <MacDropdown
                  options={[
                    { value: '', label: 'Tất cả Khoa' },
                    { value: 'Nội tổng quát', label: 'Nội tổng quát' },
                    { value: 'Răng Hàm Mặt', label: 'Răng Hàm Mặt' },
                    { value: 'Chỉnh nha', label: 'Chỉnh nha' }
                  ]}
                  value={filterSpecialty}
                  onChange={setFilterSpecialty}
                  placeholder="Khoa chuyên sâu"
                />
                
                <MacDropdown
                  options={[
                    { value: '', label: 'Tất cả Trạng thái' },
                    { value: 'Chưa duyệt', label: 'Chưa duyệt' },
                    { value: 'Đã duyệt', label: 'Đã duyệt' },
                    { value: 'Đã chốt lương', label: 'Đã chốt lương' }
                  ]}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Trạng thái"
                />
              </div>
            </div>

            <div className="staff-card">
              <div className="staff-table-wrap">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>BÁC SĨ</th>
                      <th>NGÀY TRỰC</th>
                      <th>GIỜ TRỰC</th>
                      <th>SỐ BỆNH ÁN</th>
                      <th>TỔNG HỆ SỐ</th>
                      <th>TRẠNG THÁI</th>
                      <th>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isComplexLoading ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
                    ) : complexShifts.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Không có ca trực nào phát sinh thủ thuật trong tháng</td></tr>
                    ) : (
                      complexShifts.map((shift) => (
                        <tr key={shift._id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>BS. {shift.doctorName}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{shift.specialty}</div>
                          </td>
                          <td>{format(new Date(shift.date), 'dd/MM/yyyy')}</td>
                          <td>{shift.startTime} - {shift.endTime}</td>
                          <td>{shift.medicalRecords.length} ca</td>
                          <td style={{ fontWeight: 'bold', color: shift.totalPatientCoefficient > 0 ? '#10b981' : '#64748b' }}>
                            {shift.totalPatientCoefficient > 0 ? `+ ${shift.totalPatientCoefficient}` : '0'}
                          </td>
                          <td>
                            <span className={`staff-badge staff-badge--status ${shift.coefficientStatus === 'Đã duyệt' || shift.coefficientStatus === 'Đã chốt lương' ? 'staff-badge--status-active' : 'staff-badge--status-inactive'}`}>
                              {shift.coefficientStatus}
                            </span>
                          </td>
                          <td>
                            <button 
                              type="button" 
                              className="staff-btn staff-btn--outline"
                              onClick={() => handleOpenComplexModal(shift)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                            >
                              <Icon name={shift.coefficientStatus === 'Đã chốt lương' ? 'view' : 'edit'} size={14} />
                              {shift.coefficientStatus === 'Đã chốt lương' ? 'Xem chi tiết' : 'Cập nhật hệ số'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Cập nhật hệ số ca bệnh phức tạp */}
            {isComplexModalOpen && selectedShift && (
              <div className="staff-modal" onClick={() => setIsComplexModalOpen(false)}>
                <div className="staff-modal__dialog" style={{ width: '850px', maxWidth: '95%' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="staff-modal__title" style={{ margin: 0 }}>Cập nhật hệ số ca bệnh phức tạp</h2>
                    <button onClick={() => setIsComplexModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><Icon name="close" size={24} /></button>
                  </div>

                  <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon name="user" size={18} color="#64748b" />
                        <span style={{ color: '#475569' }}>Bác sĩ:</span> 
                        <strong style={{ color: '#0f172a' }}>BS. {selectedShift.doctorName} ({selectedShift.maBS})</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon name="calendar" size={18} color="#64748b" />
                        <span style={{ color: '#475569' }}>Ca trực:</span> 
                        <strong style={{ color: '#0f172a' }}>{format(new Date(selectedShift.date), 'dd/MM/yyyy')} ({selectedShift.startTime} - {selectedShift.endTime})</strong>
                      </div>
                      {isLocked && <div style={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}><Icon name="lock" size={16} color="#dc2626" /> Đã chốt lương</div>}
                    </div>
                  </div>

                  <div className="staff-table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="staff-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th style={{ width: '20%' }}>Bệnh nhân</th>
                          <th style={{ width: '30%' }}>Chẩn đoán / Ghi chú</th>
                          <th style={{ width: '15%' }}>Hệ số</th>
                          <th style={{ width: '35%' }}>Lý do & Ghi chú duyệt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedShift.medicalRecords.map((r) => (
                          <tr key={r.recordId}>
                            <td style={{ fontWeight: '500', color: '#334155', verticalAlign: 'top', paddingTop: '16px' }}>{r.customerName}</td>
                            <td style={{ verticalAlign: 'top', paddingTop: '16px' }}>
                              <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Icon name="note" size={14} /> {r.diagnosisCode || 'N/A'}
                              </div>
                              {r.diagnosisNote && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.diagnosisNote}</div>}
                            </td>
                            <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input 
                                  type="number" 
                                  step="0.1" 
                                  value={r.patientCoefficient}
                                  onChange={e => handleComplexInputChange(r.recordId, 'patientCoefficient', e.target.value)}
                                  disabled={isLocked}
                                  className="revenue-input"
                                  style={{ width: '100%', padding: '8px 12px', backgroundColor: isLocked ? '#f1f5f9' : 'white', fontWeight: '500', textAlign: 'center' }}
                                />
                                {!isLocked && r.suggestedCoefficient > 0 && r.patientCoefficient === 0 && (
                                  <div 
                                    style={{ fontSize: '12px', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#ecfdf5', borderRadius: '4px', width: 'fit-content', border: '1px solid #a7f3d0' }} 
                                    onClick={() => handleComplexInputChange(r.recordId, 'patientCoefficient', r.suggestedCoefficient)}
                                  >
                                    <Icon name="sparkles" size={12} /> Gợi ý: +{r.suggestedCoefficient}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ verticalAlign: 'top', paddingTop: '12px' }}>
                              <input 
                                type="text" 
                                placeholder="Nhập ghi chú duyệt..."
                                value={r.coefficientNote}
                                onChange={e => handleComplexInputChange(r.recordId, 'coefficientNote', e.target.value)}
                                disabled={isLocked}
                                className="revenue-input"
                                style={{ width: '100%', padding: '8px 12px', backgroundColor: isLocked ? '#f1f5f9' : 'white' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="staff-modal__actions" style={{ marginTop: '24px' }}>
                    <button type="button" className="staff-btn staff-btn--outline" onClick={() => setIsComplexModalOpen(false)}>Đóng</button>
                    {!isLocked && (
                      <button type="button" className="staff-btn staff-btn--primary" onClick={submitComplexCase}>
                        <Icon name="check" size={16} /> Xác nhận phê duyệt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
