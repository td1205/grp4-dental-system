import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';

export default function ReceptionPage() {
  // Giả lập user Lễ tân phù hợp với Sidebar của dự án
  const mockUser = {
    name: "Lê Tân",
    role: "Lễ Tân",
    initials: "LT"
  };

  // Mảng danh mục hỗ trợ chọn nhanh trên Form vãng lai
  const doctors = ['BS. Hưng', 'BS. Tiến', 'BS. Bình', 'BS. Cường'];
  const services = ['Khám tổng quát', 'Nhổ răng khôn', 'Niềng răng', 'Tẩy trắng răng', 'Trám răng'];

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
  const [patients, setPatients] = useState([]); // Chứa danh sách bệnh nhân lấy từ Backend
  const [searchTerm, setSearchTerm] = useState(''); // Ô tìm kiếm SĐT hoặc Tên
  const [isOpenModal, setIsOpenModal] = useState(false); // Công tắc bật/tắt Popup vãng lai

  // State lưu thông tin điền Form vãng lai
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Khám tổng quát',
    doctor: 'BS. Hưng'
  });

  // --- 1. HÀM TẢI DỮ LIỆU TỪ SERVER CỔNG 3001 ---
  const loadPatientsFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reception/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Lỗi kết nối đến Server 3001: ", error);
    }
  };

  // Tự động chạy tải dữ liệu ngay khi vừa mở trang lên
  useEffect(() => {
    loadPatientsFromBackend();
  }, []);

  // --- 2. HÀM CẬP NHẬT TRẠNG THÁI (CHO CẢ CHỌN SELECT HOẶC ẤN NÚT NHANH) ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/reception/patients/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        loadPatientsFromBackend(); // Load lại bảng ngay lập tức để đồng bộ
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái bệnh nhân: ", error);
    }
  };

  // --- 3. HÀM GỬI ĐƠN ĐĂNG KÝ KHÁCH VÃNG LAI LÊN BACKEND ---
  const handleSubmitWalkIn = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/reception/patients/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Đăng ký khách vãng lai thành công!");
        setIsOpenModal(false); // Tắt popup
        setFormData({ name: '', phone: '', service: 'Khám tổng quát', doctor: 'BS. Hưng' }); // Xóa sạch dữ liệu cũ trong form
        loadPatientsFromBackend(); // Tải lại bảng để xuất hiện bệnh nhân mới ở dưới
      }
    } catch (error) {
      console.error("Lỗi đăng ký khách vãng lai: ", error);
    }
  };

  // Xử lý bộ lọc tìm kiếm tại chỗ trên Front-end
  const filteredPatients = patients.filter(p => 
    p.phone.includes(searchTerm) || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      
      {/* 1. Thanh điều hướng bên trái (Sidebar của nhóm) */}
      <Sidebar user={mockUser} />

      {/* 2. Vùng nội dung chính bên phải */}
      <div style={{ flexGrow: 1, padding: '40px 32px', backgroundColor: '#f8fafc' }}>
        
        {/* Tiêu đề trang */}
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', letterSpacing: '-0.5px' }}>
          Tiếp đón & Hàng đợi
        </h1>
        
        {/* Thanh công cụ: Ô tìm kiếm + Nút đăng ký */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#ffffff', 
          padding: '16px 24px', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px',
          border: '1px solid #f1f5f9'
        }}>
          {/* Ô tìm kiếm kết nối State */}
          <div style={{ position: 'relative', width: '70%' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }}>
              🔍
            </span>
            <input 
              type="text" 
              placeholder="Nhập Số điện thoại hoặc CCCD để check-in..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 12px 12px 48px', 
                borderRadius: '10px', 
                border: '1px solid #e2e8f0', 
                fontSize: '15px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                color: '#334155'
              }} 
            />
          </div>

          {/* Nút Đăng ký khách vãng lai -> Kích hoạt công tắc mở Popup */}
          <button 
            onClick={() => setIsOpenModal(true)}
            style={{ 
              backgroundColor: '#1d4ed8', 
              color: '#ffffff', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '10px', 
              fontWeight: '600', 
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Đăng ký khách vãng lai
          </button>
        </div>

        {/* Bảng danh sách hàng đợi */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Thời gian</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Tên bệnh nhân</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>SĐT</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Dịch vụ</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Bác sĩ chỉ định</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Trạng thái</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                  <td style={{ padding: '20px 24px', color: '#475569' }}>{p.time}</td>
                  <td style={{ padding: '20px 24px', fontWeight: '700', color: '#0f172a' }}>{p.name}</td>
                  <td style={{ padding: '20px 24px', color: '#64748b' }}>{p.phone}</td>
                  <td style={{ padding: '20px 24px', color: '#64748b' }}>{p.service}</td>
                  <td style={{ padding: '20px 24px', color: '#64748b' }}>{p.doctor}</td>
                  
                  {/* Thay thế nhãn hiển thị thành Dropdown Select động để Lễ tân tùy chọn thay đổi */}
                  <td style={{ padding: '20px 24px' }}>
                    <select
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '50px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        backgroundColor: p.status === 'Chờ tiếp đón' ? '#fef3c7' : p.status === 'Chờ khám' ? '#dcfce7' : '#dbeafe',
                        color: p.status === 'Chờ tiếp đón' ? '#d97706' : p.status === 'Chờ khám' ? '#16a34a' : '#2563eb'
                      }}
                    >
                      <option value="Chờ tiếp đón" style={{ backgroundColor: '#fff', color: '#000' }}>Chờ tiếp đón</option>
                      <option value="Chờ khám" style={{ backgroundColor: '#fff', color: '#000' }}>Chờ khám</option>
                      <option value="Đang khám" style={{ backgroundColor: '#fff', color: '#000' }}>Đang khám</option>
                    </select>
                  </td>

                  {/* Cột Hành động (Nút bấm xác nhận nhanh) */}
                  <td style={{ padding: '20px 24px' }}>
                    {p.status === 'Chờ tiếp đón' && (
                      <button 
                        onClick={() => handleUpdateStatus(p.id, 'Chờ khám')}
                        style={{ 
                          backgroundColor: '#00a651', 
                          color: '#ffffff', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>✓</span> Xác nhận đến khám
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy bệnh nhân nào trong danh sách đợi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================================================================= */}
        {/* KHỐI GIAO DIỆN MODAL POPUP ĐĂNG KÝ VÃNG LAI (TỰ ĐỘNG BẬT KHI ĐỦ ĐIỀU KIỆN) */}
        {/* ================================================================= */}
        {isOpenModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Đăng ký khách vãng lai</h2>
              
              <form onSubmit={handleSubmitWalkIn}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Họ và tên bệnh nhân *</label>
                  <input type="text" placeholder="Ví dụ: Nguyễn Văn A" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Số điện thoại *</label>
                  <input type="tel" placeholder="Ví dụ: 0901234567" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Dịch vụ chỉ định</label>
                  <select value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', outline: 'none' }}>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Bác sĩ phụ trách</label>
                  <select value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', outline: 'none' }}>
                    {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Các nút lệnh xử lý điều hướng */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsOpenModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b', fontSize: '15px' }}>Hủy bỏ</button>
                  <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>Đăng ký vào hàng</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}