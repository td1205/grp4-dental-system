import { useState, useEffect } from 'react';
import { Download, DollarSign, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import './RevenueStatisticsPage.css';

export function RevenueStatisticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [revenueType, setRevenueType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [chartData, setChartData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (department) params.append('department', department);
      if (revenueType) params.append('revenueType', revenueType);
      if (paymentMethod) params.append('paymentMethod', paymentMethod);

      const response = await apiClient.get(`/revenue?${params.toString()}`);
      setChartData(response.data.data.chartData);
      setInvoices(response.data.data.invoices);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.message, { duration: 5000 });
      } else {
        console.error('Lỗi lấy thống kê:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
    // BR3.4.2: Polling ngầm mỗi 15 giây
    const interval = setInterval(() => {
      fetchRevenueData();
    }, 15000);
    return () => clearInterval(interval);
  }, [startDate, endDate, department, revenueType, paymentMethod]); // AF3.4.1: Tự động tải lại khi đổi bộ lọc

  const handleExportExcel = () => {
    const exportData = invoices.map(item => ({
      'Ngày thanh toán': format(new Date(item.paymentDate), 'dd/MM/yyyy HH:mm'),
      'Khách hàng': item.customerId?.name || 'Khách vãng lai',
      'Khoa/Phòng': item.department,
      'Loại doanh thu': item.revenueType,
      'Phương thức': item.paymentMethod,
      'Số tiền (đ)': item.amount
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chi Tiết Doanh Thu");
    XLSX.writeFile(wb, "Bao_Cao_Doanh_Thu_Chi_Tiet.xlsx");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="revenue-tooltip">
          <p className="revenue-tooltip__label">{label}</p>
          <p className="revenue-tooltip__value">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPatients = chartData.reduce((sum, item) => sum + item.patients, 0);
  const avgRevenuePerPatient = totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0;

  return (
    <div className="revenue-page">
      <Toaster />
      <header className="revenue-header">
        <div className="revenue-header__title">
          <h1>Thống kê doanh thu</h1>
          <p>Báo cáo doanh thu và lượt khám chi tiết</p>
        </div>
      </header>

      {/* Filters and Export */}
      <div className="revenue-toolbar">
        <div className="revenue-filters" style={{ flexWrap: 'wrap' }}>
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
          <div className="revenue-filter-group">
            <label>Khoa/Phòng</label>
            <select className="revenue-input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Phòng khám 1">Phòng khám 1</option>
                <option value="Phòng khám 2">Phòng khám 2</option>
                <option value="Phòng khám 3">Phòng khám 3</option>
                <option value="Phòng phẫu thuật">Phòng phẫu thuật</option>
                <option value="Quầy Lễ Tân">Quầy Lễ Tân</option>
            </select>
          </div>
          <div className="revenue-filter-group">
            <label>Loại doanh thu</label>
            <select className="revenue-input" value={revenueType} onChange={(e) => setRevenueType(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Khám bệnh">Khám bệnh</option>
                <option value="Thuốc">Thuốc</option>
                <option value="Cận lâm sàng">Cận lâm sàng</option>
            </select>
          </div>
          <div className="revenue-filter-group">
            <label>Thanh toán</label>
            <select className="revenue-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản QR">Chuyển khoản QR</option>
                <option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
            </select>
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
            <p className="revenue-kpi-value">{isLoading ? '...' : formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ backgroundColor: 'rgba(46, 95, 163, 0.1)', color: 'var(--color-link-active)' }}>
            <Users size={24} />
          </div>
          <div className="revenue-kpi-content">
            <p className="revenue-kpi-label">Số lượt giao dịch</p>
            <p className="revenue-kpi-value">{isLoading ? '...' : new Intl.NumberFormat('vi-VN').format(totalPatients)}</p>
          </div>
        </div>
        <div className="revenue-kpi-card">
          <div className="revenue-kpi-icon" style={{ backgroundColor: 'rgba(76, 29, 149, 0.1)', color: '#4c1d95' }}>
            <TrendingUp size={24} />
          </div>
          <div className="revenue-kpi-content">
            <p className="revenue-kpi-label">Doanh thu trung bình/ca</p>
            <p className="revenue-kpi-value">{isLoading ? '...' : formatCurrency(avgRevenuePerPatient)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="revenue-chart-card">
        <h3 className="revenue-card-title">Biểu đồ biến động dòng tiền</h3>
        <div className="revenue-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
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
        <h3 className="revenue-card-title">Chi tiết hóa đơn</h3>
        <div className="table-responsive">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Ngày TT</th>
                <th>Khách hàng</th>
                <th>Khoa/Phòng</th>
                <th>Loại doanh thu</th>
                <th>Hình thức</th>
                <th className="text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td>
                </tr>
              ) : invoices.map((row, index) => (
                <tr key={index}>
                  <td>{format(new Date(row.paymentDate), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="font-medium">{row.customerId?.name || 'Khách vãng lai'}</td>
                  <td>{row.department}</td>
                  <td>{row.revenueType}</td>
                  <td>{row.paymentMethod}</td>
                  <td className="text-right font-medium text-cta">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
