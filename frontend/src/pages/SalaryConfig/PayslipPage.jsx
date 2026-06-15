import { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icon/Icon';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown';

export function PayslipPage() {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM/yyyy'));
    const [payslipData, setPayslipData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await apiClient.get('/staffs?role=Doctor');
                setDoctors(res.data.data);
            } catch (error) {
                console.error("Error fetching doctors", error);
            }
        };
        fetchDoctors();
    }, []);

    const handleCalculate = async () => {
        if (!selectedDoctor || !selectedMonth) {
            toast.error('Vui lòng chọn bác sĩ và nhập tháng/năm.');
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.post('/payslips/calculate', { doctorId: selectedDoctor, month: selectedMonth });
            setPayslipData(res.data.data);
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi tính lương');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!payslipData?._id) return;
        try {
            const res = await apiClient.post(`/payslips/${payslipData._id}/confirm`);
            setPayslipData(res.data.data);
            toast.success('Chốt phiếu lương thành công, đã gửi Email!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi chốt lương');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    return (
        <>
            <Toaster />
            <div className="staff-page" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1e293b' }}>Lập Phiếu Lương</h1>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>{format(new Date(), "EEEE, 'ngày' dd 'tháng' M, yyyy", { locale: vi })}</div>
                </div>

                <div className="staff-card" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'white', marginBottom: '24px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a' }}>Thông tin phiếu lương</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Bác sĩ</label>
                            <MacDropdown 
                                value={selectedDoctor} 
                                onChange={(val) => setSelectedDoctor(val)}
                                placeholder="Chọn bác sĩ..."
                                options={[
                                    { value: "", label: "Chọn bác sĩ..." },
                                    ...doctors.map(d => ({
                                        value: d._id,
                                        label: `BS. ${d.name} ${d.ma_nhan_vien ? `(${d.ma_nhan_vien})` : ''}`
                                    }))
                                ]}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Tháng/Năm</label>
                            <input 
                                type="text" 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                placeholder="MM/yyyy"
                                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f1f5f9' }}
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleCalculate}
                        disabled={loading}
                        style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        {loading ? 'Đang tính toán...' : 'Lập nháp phiếu lương'}
                    </button>

                    {payslipData && (
                        <div style={{ backgroundColor: '#f1f5f9', padding: '16px 20px', borderRadius: '8px', color: '#334155', fontSize: '14px', display: 'flex', gap: '8px' }}>
                            <span>Lương cơ bản/giờ: <strong>{formatCurrency(payslipData.baseSalaryAmount)} đ</strong></span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span>Hệ số phức tạp: <strong>{payslipData.doctorCoefficient}</strong></span>
                        </div>
                    )}
                </div>

                {payslipData && (
                    <div className="staff-card" style={{ borderRadius: '12px', backgroundColor: 'white', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Bảng tính lương tháng {payslipData.month}</h2>
                            {payslipData.status === 'Đã chốt' && (
                                <span style={{ padding: '4px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '999px', fontSize: '13px', fontWeight: '600' }}>
                                    Đã chốt lương
                                </span>
                            )}
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Chỉ tiêu</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Giá trị</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>Tổng số ca làm</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>{payslipData.totalShifts}</td>
                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>ca</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>Giờ làm/ca</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>{payslipData.hoursPerShift}</td>
                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>giờ/ca</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>Tổng hệ số thưởng (ca trực + bệnh án)</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>{payslipData.totalShiftCoefficient}</td>
                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>hệ số</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>Hệ số phức tạp (Bác sĩ)</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>{payslipData.doctorCoefficient}</td>
                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>x</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>Tổng giờ quy đổi</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0d9488' }}>{payslipData.totalEquivalentHours}</td>
                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>giờ quy đổi</td>
                                </tr>
                                <tr style={{ borderBottom: '2px solid #3b82f6' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#334155' }}>Lương cơ bản/giờ</td>
                                    <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#1e293b' }}>{formatCurrency(payslipData.baseSalaryAmount)} đ</td>
                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>đ/giờ</td>
                                </tr>
                                <tr style={{ backgroundColor: '#f0f9ff' }}>
                                    <td style={{ padding: '20px 24px', fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>Lương thực nhận</td>
                                    <td style={{ padding: '20px 24px', fontWeight: 'bold', fontSize: '18px', color: '#dc2626' }}>{formatCurrency(payslipData.totalSalary)} đ</td>
                                    <td style={{ padding: '20px 24px', color: '#64748b' }}>VNĐ</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ padding: '20px 24px', display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={handleCalculate}
                                disabled={payslipData.status === 'Đã chốt'}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: payslipData.status === 'Đã chốt' ? 'not-allowed' : 'pointer' }}
                            >
                                <Icon name="save" size={16} /> Lưu nháp
                            </button>
                            <button 
                                onClick={handleConfirm}
                                disabled={payslipData.status === 'Đã chốt'}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: payslipData.status === 'Đã chốt' ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: payslipData.status === 'Đã chốt' ? 'not-allowed' : 'pointer' }}
                            >
                                <Icon name="check" size={16} /> Chốt lương
                            </button>
                            <button 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginLeft: 'auto' }}
                            >
                                <Icon name="download" size={16} /> Xuất PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
