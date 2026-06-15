import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import { Save, CheckCircle, ArrowLeft, Activity, Pill, User, Search, Trash2, FileText, ClipboardList } from 'lucide-react';
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown';
import './MedicalRecordPage.css';

export const MedicalRecordPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // id is appointmentId
    const [activeTab, setActiveTab] = useState(1);
    
    const [appointment, setAppointment] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho modal lịch sử
    const [showHistory, setShowHistory] = useState(false);
    const [historyRecords, setHistoryRecords] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [clinicalData, setClinicalData] = useState({
        reason: '',
        symptoms: '',
        medicalHistory: '',
        diagnosisCode: '',
        diagnosisNote: ''
    });

    const [prescriptionItems, setPrescriptionItems] = useState([]);
    const [selectedMedicineId, setSelectedMedicineId] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch appointments to find this specific one
                const aptRes = await apiClient.get('/appointments');
                const apt = aptRes.data.data.find(a => a._id === id);
                if (apt) {
                    setAppointment(apt);
                    setClinicalData(prev => ({ ...prev, reason: apt.notes || '' }));
                } else {
                    toast.error("Không tìm thấy thông tin lịch khám!");
                    navigate('/doctor/dashboard');
                    return;
                }

                // Fetch medicines for prescription tab
                const medRes = await apiClient.get('/medicines');
                setMedicines(medRes.data.data || []);
            } catch (err) {
                console.error(err);
                toast.error("Lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, navigate]);

    const handleOpenHistory = async () => {
        if (!appointment?.customerId?._id) return;
        setShowHistory(true);
        setHistoryLoading(true);
        try {
            const res = await apiClient.get(`/medical-records/customer/${appointment.customerId._id}`);
            setHistoryRecords(res.data.data || []);
        } catch (err) {
            toast.error('Không thể tải lịch sử y khoa');
        } finally {
            setHistoryLoading(false);
        }
    };

    // Đã xóa trùng lặp clinicalData

    // Hàm xử lý nhập liệu
    const handleClinicalChange = (e) => {
        const { name, value } = e.target;
        setClinicalData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMedicine = (medId) => {
        if (!medId) return;
        const med = medicines.find(m => m._id === medId);
        if (!med) return;

        // Check if already in list
        if (prescriptionItems.some(item => item.medicineId === med._id)) {
            toast.error("Thuốc này đã có trong đơn!");
            return;
        }

        setPrescriptionItems([
            ...prescriptionItems, 
            { medicineId: med._id, name: med.name, unit: med.unit, stock: med.stock, usageGuide: med.usageGuide, quantity: 1, dosage: 'Sáng 1 - Tối 1', usage: med.usageGuide }
        ]);
    };

    const handleRemoveMedicine = (medId) => {
        setPrescriptionItems(prescriptionItems.filter(item => item.medicineId !== medId));
    };

    const handleUpdatePrescription = (medId, field, value) => {
        setPrescriptionItems(prescriptionItems.map(item => {
            if (item.medicineId === medId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleFinishExam = async () => {
        // Validation: Kiểm tra đã nhập chẩn đoán chưa (Quy tắc ngoại lệ EF3.2.2)
        if (!clinicalData.diagnosisCode.trim()) {
            toast.error("Lỗi: Bắt buộc phải nhập ít nhất một chẩn đoán chính!");
            setActiveTab(1);
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn hoàn thành ca khám này? Hệ thống sẽ đẩy dữ liệu sang quầy Thanh toán.")) {
            try {
                const payload = {
                    appointmentId: appointment._id,
                    customerId: appointment.customerId._id,
                    doctorId: appointment.doctorId._id,
                    clinicalData,
                    prescriptionItems
                };
                
                await apiClient.post('/medical-records/finish', payload);
                toast.success("Đã lưu bệnh án thành công! Bệnh nhân được chuyển sang trạng thái Hoàn thành.");
                navigate('/doctor/dashboard');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Lỗi lưu bệnh án');
            }
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu ca khám...</div>;
    if (!appointment) return null;

    return (
        <>
        <div className="medical-record-page">
            {/* 1. Khu vực Header */}
            <div className="record-header">
                <div className="patient-summary">
                    <div className="avatar-placeholder">{appointment.customerId?.name?.charAt(0) || 'U'}</div>
                    <div className="info-text">
                        <h2>{appointment.customerId?.name} <span className="patient-id">#{appointment.customerId?.id || ''}</span></h2>
                        <p>SĐT: {appointment.customerId?.phone} | Giới tính: Chưa rõ | Dịch vụ: <strong>{appointment.serviceId?.name}</strong></p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-outline" onClick={handleOpenHistory}>
                        <FileText size={16} /> Lịch sử y khoa
                    </button>
                    <button className="btn-danger outline" onClick={() => navigate('/doctor/dashboard')}>
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                </div>
            </div>

            {/* 2. Điều hướng Tabs */}
            <div className="record-tabs">
                <button className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                    <Activity size={18} /> Khám Lâm Sàng
                </button>
                <button className={`tab-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                    <ClipboardList size={18} /> Chỉ định Dịch vụ
                </button>
                <button className={`tab-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
                    <Pill size={18} /> Kê Đơn Thuốc
                </button>
            </div>

            {/* 3. Khu vực Nội dung Tab */}
            <div className="record-workspace">

                {/* --- TAB 1: KHÁM LÂM SÀNG --- */}
                {activeTab === 1 && (
                    <div className="tab-content clinical-tab">
                        <h3 className="tab-title">Thông tin Lâm sàng & Chẩn đoán</h3>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Lý do khám <span className="required">*</span></label>
                                <textarea
                                    name="reason"
                                    value={clinicalData.reason}
                                    onChange={handleClinicalChange}
                                    placeholder="Nhập lý do bệnh nhân đến khám..."
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label>Triệu chứng lâm sàng <span className="required">*</span></label>
                                <textarea
                                    name="symptoms"
                                    value={clinicalData.symptoms}
                                    onChange={handleClinicalChange}
                                    placeholder="Ghi nhận các triệu chứng hiện tại (VD: Đau nhức, sưng nướu...)"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tiền sử bệnh</label>
                                <textarea
                                    name="medicalHistory"
                                    value={clinicalData.medicalHistory}
                                    onChange={handleClinicalChange}
                                    placeholder="Các bệnh lý nền, dị ứng thuốc (nếu có)..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-group full-width" style={{ marginTop: '1rem' }}>
                                <h4 className="section-subtitle" style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Kết luận Chẩn đoán</h4>
                                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '1rem' }} />
                            </div>

                            <div className="form-group">
                                <label>Mã bệnh (ICD) / Chẩn đoán chính <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="diagnosisCode"
                                    value={clinicalData.diagnosisCode}
                                    onChange={handleClinicalChange}
                                    placeholder="Tìm kiếm mã bệnh (VD: K02 - Sâu răng)..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Ghi chú chẩn đoán</label>
                                <input
                                    type="text"
                                    name="diagnosisNote"
                                    value={clinicalData.diagnosisNote}
                                    onChange={handleClinicalChange}
                                    placeholder="Mô tả chi tiết mức độ bệnh..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: CẬN LÂM SÀNG --- */}
                {activeTab === 2 && (
                    <div className="tab-content">
                        <h3 className="tab-title">Chỉ định Cận lâm sàng & Thủ thuật</h3>
                        <p className="placeholder-text">Đang xây dựng: Tính năng chọn dịch vụ X-Quang, Lấy cao răng...</p>
                    </div>
                )}

                {/* --- TAB 3: ĐƠN THUỐC --- */}
                {activeTab === 3 && (
                    <div className="tab-content">
                        <h3 className="tab-title">Đơn thuốc điện tử</h3>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <MacDropdown 
                                    value={selectedMedicineId}
                                    onChange={val => setSelectedMedicineId(val)}
                                    placeholder="-- Chọn thuốc từ kho --"
                                    options={[
                                        { value: "", label: "-- Chọn thuốc từ kho --" },
                                        ...medicines.map(m => ({ value: m._id, label: `${m.name} (Tồn: ${m.stock} ${m.unit})` }))
                                    ]}
                                />
                            </div>
                            <button 
                                className="btn-primary" 
                                onClick={() => handleAddMedicine(selectedMedicineId)}
                            >
                                Thêm vào đơn
                            </button>
                        </div>

                        {prescriptionItems.length > 0 ? (
                            <table className="medicine-table">
                                <thead>
                                    <tr>
                                        <th>Tên thuốc</th>
                                        <th style={{ textAlign: 'center', width: '100px' }}>Số lượng</th>
                                        <th>Liều dùng</th>
                                        <th>Cách dùng</th>
                                        <th style={{ textAlign: 'center', width: '60px' }}>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <strong style={{ color: 'var(--staff-text)', display: 'block', marginBottom: '4px' }}>{item.name}</strong>
                                                <span style={{ color: 'var(--staff-text-muted)', fontSize: '0.85rem', background: 'var(--staff-bg)', padding: '2px 8px', borderRadius: '4px' }}>Đơn vị: {item.unit}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max={item.stock} 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleUpdatePrescription(item.medicineId, 'quantity', parseInt(e.target.value))}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    value={item.dosage} 
                                                    onChange={(e) => handleUpdatePrescription(item.medicineId, 'dosage', e.target.value)}
                                                    placeholder="VD: Sáng 1 - Tối 1"
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    value={item.usage} 
                                                    onChange={(e) => handleUpdatePrescription(item.medicineId, 'usage', e.target.value)}
                                                    placeholder="VD: Sau ăn"
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button className="btn-delete" onClick={() => handleRemoveMedicine(item.medicineId)} title="Xóa thuốc">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="placeholder-text">Chưa có thuốc nào được kê.</p>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Footer */}
            <div className="record-footer">
                <button className="btn-secondary">
                    <Save size={18} /> Lưu nháp
                </button>
                <button className="btn-primary" onClick={handleFinishExam}>
                    <CheckCircle size={18} /> Hoàn thành ca khám
                </button>
            </div>
        </div>

        {/* ===== MODAL LỊCH SỚ Y KHOA ===== */}
        {showHistory && (
            <div className="history-overlay" onClick={() => setShowHistory(false)}>
                <div className="history-modal" onClick={e => e.stopPropagation()}>
                    <div className="history-modal-header">
                        <div>
                            <h3><FileText size={20} /> Lịch sử y khoa</h3>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--staff-text-muted)', fontSize: '0.9rem' }}>
                                Bệnh nhân: <strong>{appointment.customerId?.name}</strong>
                            </p>
                        </div>
                        <button className="history-close-btn" onClick={() => setShowHistory(false)}>✕</button>
                    </div>

                    <div className="history-modal-body">
                        {historyLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--staff-text-muted)' }}>
                                Đang tải lịch sử...
                            </div>
                        ) : historyRecords.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--staff-text-muted)' }}>
                                Chưa có hồ sơ bệnh án nào trước đó.
                            </div>
                        ) : (
                            historyRecords.map((rec, idx) => (
                                <div key={rec._id} className="history-record-card">
                                    <div className="history-record-header">
                                        <span className="history-index">#{historyRecords.length - idx}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--staff-text)' }}>
                                                {rec.diagnosisCode}
                                                {rec.diagnosisNote && <span style={{ color: 'var(--staff-text-muted)', fontWeight: 400 }}> — {rec.diagnosisNote}</span>}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--staff-text-muted)', marginTop: '2px' }}>
                                                {new Date(rec.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })} | Bác sĩ: {rec.doctorId?.name || 'N/A'}
                                            </div>
                                        </div>
                                        <span className="history-status-badge">Hoàn thành</span>
                                    </div>
                                    <div className="history-record-body">
                                        <div className="history-info-row"><span>Lý do khám:</span><span>{rec.reason || '—'}</span></div>
                                        <div className="history-info-row"><span>Triệu chứng:</span><span>{rec.symptoms || '—'}</span></div>
                                        {rec.medicalHistory && <div className="history-info-row"><span>Tiền sử:</span><span>{rec.medicalHistory}</span></div>}

                                        {rec.prescription?.items?.length > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--staff-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Pill size={16} /> Đơn thuốc
                                                </div>
                                                <div className="history-rx-list">
                                                    {rec.prescription.items.map((item, i) => (
                                                        <div key={i} className="history-rx-item">
                                                            <strong>{item.medicineId?.name || 'Thuốc'}</strong>
                                                            <span>{item.quantity} {item.medicineId?.unit}</span>
                                                            <span>{item.dosage}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default MedicalRecordPage;