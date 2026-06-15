import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon/Icon';
import apiClient from '../../services/apiClient';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 đ';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
};

const formatShortCurrency = (value) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return value;
};

export function SalaryFundReportPage() {
    const navigate = useNavigate();
    const today = new Date();
    const defaultYear = today.getFullYear().toString();
    const [year, setYear] = useState(defaultYear);
    
    const [chartData, setChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [kpi, setKpi] = useState({ totalFund: 0, maxMonth: 'T-', maxFund: 0, yoy: '0.0' });
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');

    const fetchReport = async (y) => {
        setLoading(true);
        setWarning('');
        try {
            const res = await apiClient.get(`/payslips/fund-report?year=${y}`);
            
            if (res.data.message === 'Chưa có dữ liệu tài chính cho năm tra cứu') {
                setWarning(res.data.message);
                setChartData([]);
                setTableData([]);
                setKpi({ totalFund: 0, maxMonth: 'T-', maxFund: 0, yoy: '0.0' });
            } else {
                const data = res.data.data;
                setChartData(data.chartData);
                setTableData(data.rankingTable);
                setKpi(data.kpi);
            }
        } catch (error) {
            console.error(error);
            setWarning('Lỗi khi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(year);
    }, [year]);

    const handleExportExcel = () => {
        if (tableData.length === 0) return;
        
        let csvContent = "Báo cáo quỹ lương năm " + year + "\n\n";
        csvContent += `Tổng chi phí lương năm:,${kpi.totalFund}\n`;
        csvContent += `Tháng cao nhất:,${kpi.maxMonth} (${kpi.maxFund})\n`;
        csvContent += `Tăng trưởng (YoY):,${kpi.yoy}%\n\n`;
        
        csvContent += "Hạng,Mã BS,Họ tên,Tổng thu nhập năm,Tỷ lệ đóng góp (%)\n";
        
        tableData.forEach((item, idx) => {
            csvContent += `${idx + 1},${item.ma_nhan_vien},${item.name},${item.totalIncome},${item.contribution}%\n`;
        });

        const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Bao_cao_quy_luong_nam_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    // AF4.7.1: Redirect to UC4.5 on click
    const handleBarClick = (data) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const monthVal = data.activePayload[0].payload.monthVal; // MM/YYYY
            navigate(`/salary/payslips?month=${monthVal}`);
        }
    };

    return (
        <div className="staff-page" id="salary-fund-page">
            <style>
                {`
                @media print {
                    .staff-page__header, .sidebar, .topbar {
                        display: none !important;
                    }
                    .staff-page {
                        padding: 0;
                    }
                    .kpi-cards {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 16px !important;
                    }
                }
                `}
            </style>
            <header className="staff-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Năm tài chính</label>
                        <input 
                            type="number" 
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
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

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <button 
                            onClick={handleExportExcel}
                            disabled={tableData.length === 0}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: tableData.length === 0 ? '#f1f5f9' : 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: tableData.length === 0 ? 'not-allowed' : 'pointer',
                                color: tableData.length === 0 ? '#94a3b8' : '#334155',
                                fontWeight: 500,
                                fontSize: '14px',
                                height: '38px'
                            }}
                        >
                            <Icon name="download" size={16} /> Xuất tệp báo cáo
                        </button>
                        <button 
                            onClick={handlePrint}
                            disabled={tableData.length === 0}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: tableData.length === 0 ? '#f1f5f9' : '#3b82f6',
                                border: '1px solid ' + (tableData.length === 0 ? '#e2e8f0' : '#2563eb'),
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: tableData.length === 0 ? 'not-allowed' : 'pointer',
                                color: tableData.length === 0 ? '#94a3b8' : 'white',
                                fontWeight: 500,
                                fontSize: '14px',
                                height: '38px'
                            }}
                        >
                            <Icon name="mail" size={16} /> In PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="kpi-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#eef2ff', padding: '20px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
                    <div style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600, marginBottom: '8px' }}>Tổng chi phí lương năm</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{formatCurrency(kpi.totalFund)}</div>
                </div>
                <div style={{ backgroundColor: '#fff1f2', padding: '20px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <div style={{ fontSize: '13px', color: '#e11d48', fontWeight: 600, marginBottom: '8px' }}>Tháng chi phí cao nhất</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e11d48' }}>
                        {kpi.maxMonth} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#f43f5e' }}>({formatShortCurrency(kpi.maxFund)})</span>
                    </div>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600, marginBottom: '8px' }}>Tăng trưởng (YoY)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {parseFloat(kpi.yoy) > 0 ? <Icon name="trending-up" size={24} /> : <Icon name="trending-down" size={24} color="#ef4444" />}
                        <span style={{ color: parseFloat(kpi.yoy) >= 0 ? '#16a34a' : '#ef4444' }}>
                            {kpi.yoy}%
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
                    Biểu đồ xu hướng quỹ lương năm {year} (Click vào cột để xem chi tiết)
                </h2>
                
                {chartData.length > 0 && !warning ? (
                    <div style={{ width: '100%', height: 350, cursor: 'pointer' }}>
                        <ResponsiveContainer>
                            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} onClick={handleBarClick}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis 
                                    yAxisId="left"
                                    tickFormatter={formatShortCurrency} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={formatShortCurrency} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="fund" name="Tổng quỹ lương (VNĐ)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.month === kpi.maxMonth ? '#ef4444' : '#3b82f6'} />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="average" name="Lương trung bình/BS" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 500, flexDirection: 'column', gap: '8px' }}>
                        <Icon name="alert-circle" size={32} style={{ opacity: 0.8 }} />
                        <span>{warning || 'Đang tải dữ liệu...'}</span>
                    </div>
                )}
            </div>

            <div className="staff-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b' }}>
                    Bảng xếp hạng thu nhập Bác sĩ năm {year}
                </div>
                
                {tableData.length > 0 ? (
                    <div className="staff-table-wrap">
                        <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', fontWeight: 600, width: '80px', textAlign: 'center' }}>Hạng</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Mã BS</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Họ tên</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tổng thu nhập năm</th>
                                    <th style={{ padding: '12px 20px', fontWeight: 600 }}>Tỷ lệ đóng góp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                                        <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 'bold', color: index < 3 ? '#ef4444' : '#64748b' }}>
                                            #{index + 1}
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#334155' }}>
                                            {item.ma_nhan_vien}
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#1d4ed8', fontWeight: 600 }}>
                                            BS. {item.name}
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#334155', fontWeight: 500 }}>
                                            {formatCurrency(item.totalIncome)}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '100px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${item.contribution}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                                                </div>
                                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{item.contribution}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontWeight: 500 }}>
                        Chưa có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
}
