import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicalRecordPage.css';

export const MedicalRecordPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(1);

    // Mock data bệnh nhân
    const patientInfo = {
        ma_bn: 'BN260601',
        name: 'Nguyễn Văn A',
        age: 32,
        gender: 'Nam',
        reason: 'Đau buốt răng hàm dưới bên phải',
        status: 'Đang khám'
    };

    // State quản lý dữ liệu Tab 1: Khám Lâm Sàng
    const [clinicalData, setClinicalData] = useState({
        reason: patientInfo.reason || '',
        symptoms: '',
        medicalHistory: '',
        diagnosisCode: '',
        diagnosisNote: ''
    });

    // Hàm xử lý nhập liệu
    const handleClinicalChange = (e) => {
        const { name, value } = e.target;
        setClinicalData(prev => ({ ...prev, [name]: value }));
    };

    const handleFinishExam = () => {
        // Validation: Kiểm tra đã nhập chẩn đoán chưa (Quy tắc ngoại lệ EF3.2.2)
        if (!clinicalData.diagnosisCode.trim()) {
            alert("Lỗi: Bắt buộc phải nhập ít nhất một chẩn đoán chính!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn hoàn thành ca khám này? Hệ thống sẽ đẩy dữ liệu sang quầy Thanh toán.")) {
            alert("Đã lưu bệnh án thành công! Bệnh nhân được chuyển sang trạng thái Chờ thanh toán.");
            navigate('/doctor/dashboard');
        }
    };

    return (
        <div className="medical-record-page">
            {/* 1. Khu vực Header */}
            <div className="record-header">
                <div className="patient-summary">
                    <div className="avatar-placeholder">{patientInfo.name.charAt(0)}</div>
                    <div className="info-text">
                        <h2>{patientInfo.name} <span className="patient-id">#{patientInfo.ma_bn}</span></h2>
                        <p>{patientInfo.age} tuổi | Giới tính: {patientInfo.gender} | Lý do khám: <strong>{patientInfo.reason}</strong></p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-outline">Lịch sử y khoa</button>
                    <button className="btn-danger outline" onClick={() => navigate('/doctor/dashboard')}>Quay lại</button>
                </div>
            </div>

            {/* 2. Điều hướng Tabs */}
            <div className="record-tabs">
                <button className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                    1. Khám Lâm Sàng
                </button>
                <button className={`tab-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                    2. Chỉ định Dịch vụ
                </button>
                <button className={`tab-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
                    3. Kê Đơn Thuốc
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
                        <p className="placeholder-text">Đang xây dựng: Tính năng tìm kiếm thuốc trong kho và kê đơn...</p>
                    </div>
                )}
            </div>

            {/* 4. Footer */}
            <div className="record-footer">
                <button className="btn-secondary">Lưu nháp</button>
                <button className="btn-primary" onClick={handleFinishExam}>Hoàn thành ca khám</button>
            </div>
        </div>
    );
};

export default MedicalRecordPage;