import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icon/Icon';
import apiClient from '../../services/apiClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown';

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
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

export function YearlySalaryReportPage() {
    const today = new Date();
    const defaultYear = today.getFullYear().toString();
    const [year, setYear] = useState(defaultYear);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    
    const [chartData, setChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');

    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    
    const [totalFund, setTotalFund] = useState(0);

    // Fetch user profile to apply RBAC (BR4.4.1)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // We assume there's an endpoint to get current user, or we can just fetch doctors and rely on backend for security.
                // But frontend needs to know to disable the dropdown. 
                // Wait, login response stores user in localStorage or context.
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const u = JSON.parse(storedUser);
                    setUserRole(u.role);
                    setUserId(u.id);
                    if (u.role === 'doctor') {
                        setSelectedDoctor(u.id);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, []);

    // Fetch doctors list for Admin
    useEffect(() => {
        if (userRole && userRole !== 'doctor') {
            const fetchDoctors = async () => {
                try {
                    const res = await apiClient.get('/staffs?role=Doctor');
                    setDoctors(res.data.data);
                } catch (error) {
                    console.error("Error fetching doctors", error);
                }
            };
            fetchDoctors();
        }
    }, [userRole]);

    const fetchReport = async (y, dId) => {
        setLoading(true);
        setWarning('');
        try {
            let url = `/payslips/yearly-report?year=${y}`;
            if (dId) {
                url += `&doctorId=${dId}`;
            }
            const res = await apiClient.get(url);
            
            const data = res.data.data;
            if (!data.tableData || data.tableData.length === 0) {
                setWarning('Không có dữ liệu kết toán lương cho năm này.');
                setChartData([]);
                setTableData([]);
                setTotalFund(0);
            } else {
                setChartData(data.chartData);
                setTableData(data.tableData);
                
                // Calc total fund for the year
                const total = data.chartData.reduce((sum, item) => sum + item.value, 0);
                setTotalFund(total);
            }
        } catch (error) {
            console.error(error);
            setWarning('Lỗi khi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount and year change, but wait for userRole parsing
    useEffect(() => {
        if (userRole !== null) {
            // If doctor, selectedDoctor is set. 
            // If admin, selectedDoctor can be anything.
            fetchReport(year, selectedDoctor);
        }
    }, [year, selectedDoctor, userRole]);

    const handleExportExcel = () => {
        if (tableData.length === 0) return;
        
        let csvContent = "Bác sĩ,T1,T2,T3,T4,T5,T6,T7,T8,T9,T10,T11,T12,Tổng năm\n";
        
        let monthTotals = Array(12).fill(0);
        let grandTotal = 0;

        tableData.forEach(item => {
            let row = `BS. ${item.name}`;
            let doctorTotal = 0;
            
            item.months.forEach((val, i) => {
                const num = val || 0;
                row += `,${num}`;
                monthTotals[i] += num;
            });
            
            row += `,${item.total}\n`;
            grandTotal += item.total;
            csvContent += row;
        });
        
        let footer = "TỔNG";
        monthTotals.forEach(val => {
            footer += `,${val || ''}`;
        });
        footer += `,${grandTotal}\n`;
        csvContent += footer;

        const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Bao_cao_thu_nhap_nam_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    // Table rendering helpers
    const monthTotals = Array(12).fill(0);
    tableData.forEach(item => {
        item.months.forEach((val, i) => {
            if (val) monthTotals[i] += val;
        });
    });

    return (
        <div className="staff-page" id="salary-yearly-page">
            <style>
                {`
                @media print {
                    .staff-page__header, .sidebar, .topbar {
                        display: none !important;
                    }
                    .staff-page {
                        padding: 0;
                    }
                }
                `}
            </style>
            <header className="staff-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Năm báo cáo</label>
                        <input 
                            type="number" 
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '100px',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                    
                    {userRole !== 'doctor' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Bác sĩ</label>
                            <div style={{ minWidth: '200px' }}>
                                <MacDropdown 
                                    value={selectedDoctor}
                                    onChange={(val) => setSelectedDoctor(val)}
                                    placeholder="Tất cả bác sĩ"
                                    options={[
                                        { value: "", label: "Tất cả bác sĩ" },
                                        ...doctors.map(d => ({ value: d._id, label: `BS. ${d.name}` }))
                                    ]}
                                />
                            </div>
                        </div>
                    )}

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
                            <Icon name="download" size={16} /> Xuất báo cáo
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
                            <Icon name="mail" size={16} /> In báo cáo
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
                    Tổng quỹ lương theo tháng năm {year}
                </h2>
                
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis 
                                    tickFormatter={formatShortCurrency} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        {warning || 'Đang tải dữ liệu...'}
                    </div>
                )}
            </div>

            <div className="staff-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#1e293b' }}>
                    Chi tiết lương theo bác sĩ năm {year}
                </div>
                
                {tableData.length > 0 ? (
                    <div className="staff-table-wrap" style={{ overflowX: 'auto' }}>
                        <table className="staff-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '1000px' }}>
                            <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Bác sĩ</th>
                                    {Array.from({length: 12}).map((_, i) => (
                                        <th key={i} style={{ padding: '12px', fontWeight: 600 }}>T{i+1}</th>
                                    ))}
                                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tổng năm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                                            BS. {item.name}
                                        </td>
                                        {item.months.map((val, i) => (
                                            <td key={i} style={{ padding: '12px', color: '#334155' }}>
                                                {val ? formatShortCurrency(val) : '-'}
                                            </td>
                                        ))}
                                        <td style={{ padding: '16px', color: '#1d4ed8', fontWeight: 600 }}>
                                            {formatShortCurrency(item.total)}
                                        </td>
                                    </tr>
                                ))}
                                {/* Footer row */}
                                <tr style={{ backgroundColor: '#f0f9ff' }}>
                                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a' }}>TỔNG</td>
                                    {monthTotals.map((val, i) => (
                                        <td key={i} style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>
                                            {val ? formatShortCurrency(val) : '-'}
                                        </td>
                                    ))}
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#ef4444' }}>
                                        {formatShortCurrency(totalFund)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontWeight: 500 }}>
                        <Icon name="alert-circle" size={24} style={{ marginBottom: '8px', opacity: 0.8 }} />
                        <div>{warning || 'Chưa có dữ liệu'}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
