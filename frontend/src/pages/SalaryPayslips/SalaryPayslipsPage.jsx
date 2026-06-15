import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icon/Icon';
import apiClient from '../../services/apiClient';

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
};

export function SalaryPayslipsPage() {
    const today = new Date();
    const defaultMonth = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    const [month, setMonth] = useState(defaultMonth);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalFund: 0, doctorCount: 0, average: 0 });
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');

    const fetchReport = async (selectedMonth) => {
        setLoading(true);
        setWarning('');
        try {
            const res = await apiClient.get(`/payslips/report?month=${selectedMonth}`);
            if (res.data.data.length === 0) {
                setWarning('Chu kỳ được chọn chưa có dữ liệu kết toán lương');
                setData([]);
                setSummary({ totalFund: 0, doctorCount: 0, average: 0 });
            } else {
                setData(res.data.data);
                setSummary(res.data.summary);
            }
        } catch (error) {
            console.error(error);
            setWarning('Lỗi khi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(month);
    }, [month]);

    const handleExportExcel = () => {
        if (data.length === 0) return;
        
        let csvContent = "Mã BS,Họ tên,Tổng ca,Số giờ,Giờ quy đổi,Lương thực nhận,Trạng thái\n";
        
        data.forEach(item => {
            const code = item.doctorId?.ma_nhan_vien || '';
            const name = item.doctorId?.name || '';
            const shifts = item.totalShifts;
            const hours = item.totalShifts * item.hoursPerShift;
            const eqHours = item.totalEquivalentHours;
            const salary = item.totalSalary;
            const status = item.status;
            csvContent += `${code},${name},${shifts},${hours},${eqHours},${salary},${status}\n`;
        });
        
        csvContent += `TỔNG CỘNG,,,,,${summary.totalFund},\n`;

        // UTF-8 BOM for Excel
        const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Bao_cao_luong_${month.replace('/', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="staff-page" id="salary-payslips-page">
            <header className="staff-page__header" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Tháng báo cáo</label>
                    <input 
                        type="text" 
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        placeholder="MM/YYYY"
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '120px',
                            backgroundColor: 'white'
                        }}
                    />
                </div>
                <button 
                    onClick={handleExportExcel}
                    disabled={data.length === 0}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: data.length === 0 ? '#f1f5f9' : 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: data.length === 0 ? 'not-allowed' : 'pointer',
                        color: data.length === 0 ? '#94a3b8' : '#334155',
                        fontWeight: 500,
                        fontSize: '14px',
                        height: '38px'
                    }}
                >
                    <Icon name="download" size={16} /> Xuất báo cáo
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '8px' }}>Tổng quỹ lương tháng {month}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(summary.totalFund)}</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '8px' }}>Số bác sĩ</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{summary.doctorCount}</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '8px' }}>Lương trung bình/BS</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{formatCurrency(summary.average)}</div>
                </div>
            </div>

            <div className="staff-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b' }}>
                    Bảng lương tháng {month}
                </div>
                
                {warning ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontWeight: 500 }}>
                        <Icon name="alert-circle" size={24} style={{ marginBottom: '8px', opacity: 0.8 }} />
                        <div>{warning}</div>
                    </div>
                ) : (
                    <div className="staff-table-wrap">
                        <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Mã BS</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Họ tên</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tổng ca</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Số giờ</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Giờ quy đổi</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Lương thực nhận</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                                        <td style={{ padding: '16px 20px', color: '#3b82f6', fontWeight: 600 }}>{item.doctorId?.ma_nhan_vien}</td>
                                        <td style={{ padding: '16px 20px', color: '#334155' }}>BS. {item.doctorId?.name}</td>
                                        <td style={{ padding: '16px 20px', color: '#334155', fontWeight: 500 }}>{item.totalShifts} ca</td>
                                        <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.totalShifts * item.hoursPerShift} giờ</td>
                                        <td style={{ padding: '16px 20px', color: '#64748b' }}>{item.totalEquivalentHours} giờ</td>
                                        <td style={{ padding: '16px 20px', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(item.totalSalary)}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                backgroundColor: '#dcfce7', 
                                                color: '#166534', 
                                                borderRadius: '20px', 
                                                fontSize: '12px', 
                                                fontWeight: 600 
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {/* Footer row for TỔNG CỘNG */}
                                <tr style={{ backgroundColor: '#f0f9ff' }}>
                                    <td colSpan={5} style={{ padding: '16px 20px', fontWeight: 'bold', color: '#0f172a' }}>TỔNG CỘNG</td>
                                    <td colSpan={2} style={{ padding: '16px 20px', fontWeight: 'bold', color: '#ef4444' }}>{formatCurrency(summary.totalFund)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
