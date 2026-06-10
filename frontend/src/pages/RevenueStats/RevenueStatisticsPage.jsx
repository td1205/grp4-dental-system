import { useState } from 'react';
import { Download, DollarSign, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import './RevenueStatisticsPage.css';

const mockData = [
  { month: 'T1', revenue: 150000000, patients: 120, avgPerPatient: 1250000 },
  { month: 'T2', revenue: 120000000, patients: 95, avgPerPatient: 1263157 },
  { month: 'T3', revenue: 180000000, patients: 150, avgPerPatient: 1200000 },
  { month: 'T4', revenue: 210000000, patients: 180, avgPerPatient: 1166666 },
  { month: 'T5', revenue: 250000000, patients: 210, avgPerPatient: 1190476 },
  { month: 'T6', revenue: 280000000, patients: 230, avgPerPatient: 1217391 },
];

export function RevenueStatisticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExportExcel = () => {
    const exportData = mockData.map(item => ({
      'Tháng': item.month,
      'Doanh thu (đ)': item.revenue,
      'Số lượt khám': item.patients,
      'Trung bình/ca (đ)': item.avgPerPatient
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doanh Thu");
    XLSX.writeFile(wb, "Thong_Ke_Doanh_Thu.xlsx");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="revenue-tooltip">
          <p className="revenue-tooltip__label">{`Tháng ${label}`}</p>
          <p className="revenue-tooltip__value">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPatients = mockData.reduce((sum, item) => sum + item.patients, 0);
  const avgRevenuePerPatient = Math.round(totalRevenue / totalPatients);

  return (
    <div className="revenue-page">
      <header className="revenue-header">
        <div className="revenue-header__title">
          <h1>Thống kê doanh thu</h1>
          <p>Báo cáo doanh thu và lượt khám chi tiết</p>
        </div>
      </header>

      {/* Filters and Export */}
      <div className="revenue-toolbar">
        <div className="revenue-filters">
          <div className="revenue-filter-group">
            <label htmlFor="startDate">Từ ngày</label>
            <input 
              type="date" 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="revenue-input"
            />
          </div>
          <div className="revenue-filter-group">
            <label htmlFor="endDate">Đến ngày</label>
            <input 
              type="date" 
              id="endDate" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="revenue-input"
            />
          </div>
        </div>
        <button className="revenue-btn-export" onClick={handleExportExcel}>
          <Download size={18} />
          Xuất file Excel
        </button>
      </div>

      {/* KPI Widgets */}
      <div className="revenue-kpi-grid">
        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ backgroundColor: 'rgba(13, 138, 114, 0.1)', color: 'var(--color-cta)' }}>
            <DollarSign size={24} />
          </div>
          <div className="revenue-kpi-content">
            <p className="revenue-kpi-label">Tổng doanh thu</p>
            <p className="revenue-kpi-value">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ backgroundColor: 'rgba(46, 95, 163, 0.1)', color: 'var(--color-link-active)' }}>
            <Users size={24} />
          </div>
          <div className="revenue-kpi-content">
            <p className="revenue-kpi-label">Tổng số lượt khám</p>
            <p className="revenue-kpi-value">{new Intl.NumberFormat('vi-VN').format(totalPatients)}</p>
          </div>
        </div>
        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ backgroundColor: 'rgba(76, 29, 149, 0.1)', color: '#4c1d95' }}>
            <TrendingUp size={24} />
          </div>
          <div className="revenue-kpi-content">
            <p className="revenue-kpi-label">Doanh thu trung bình/ca</p>
            <p className="revenue-kpi-value">{formatCurrency(avgRevenuePerPatient)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="revenue-chart-card">
        <h3 className="revenue-card-title">Biểu đồ doanh thu 6 tháng đầu năm</h3>
        <div className="revenue-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280' }} 
                tickFormatter={(value) => `${value / 1000000}M`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(46, 95, 163, 0.05)' }} />
              <Bar dataKey="revenue" fill="var(--color-link-active, #2E5FA3)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="revenue-table-card">
        <h3 className="revenue-card-title">Chi tiết doanh thu</h3>
        <div className="table-responsive">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Tháng</th>
                <th className="text-right">Doanh thu</th>
                <th className="text-right">Số lượt khám</th>
                <th className="text-right">Trung bình/ca</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, index) => (
                <tr key={index}>
                  <td className="font-medium">{row.month}</td>
                  <td className="text-right font-medium text-cta">{formatCurrency(row.revenue)}</td>
                  <td className="text-right">{new Intl.NumberFormat('vi-VN').format(row.patients)}</td>
                  <td className="text-right text-muted">{formatCurrency(row.avgPerPatient)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
