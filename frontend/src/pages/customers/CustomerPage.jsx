import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown';

export default function RevenueCustomerPage() {
  const mockUser = { name: "Lê Tân", role: "Lễ Tân", initials: "LT" };

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
  const [customers, setCustomers] = useState([]); // Chuyển danh sách thành State lấy từ Backend
  const [searchTerm, setSearchTerm] = useState(''); // Ô tìm kiếm thông minh
  const [isOpenEditModal, setIsOpenEditModal] = useState(false); // Công tắc bật/tắt Popup Sửa
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Lưu thông tin khách hàng đang chọn

  // State quản lý thông tin điền trên Form Popup chỉnh sửa
  const [editFormData, setEditFormData] = useState({
    name: '', dob: '', phone: '', cccd: '', status: 'Đang hoạt động'
  });

  // --- 1. HÀM TẢI DANH SÁCH KHÁCH HÀNG TỪ SERVER CỔNG 3001 ---
  const loadCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reception/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data); // Nạp dữ liệu thật từ Backend vào mảng hiển thị
      }
    } catch (error) {
      console.error("Lỗi kết nối API lấy danh sách khách hàng:", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // --- 2. HÀM MỞ POPUP VÀ NẠP SẴN THÔNG TIN CŨ VÀO Ô INPUT ---
  const handleOpenEditPopup = (customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
      name: customer.name,
      dob: customer.dob,
      phone: customer.phone,
      cccd: customer.cccd,
      status: customer.status || 'Đang hoạt động'
    });
    setIsOpenEditModal(true);
  };

  // --- 3. HÀM GỬI THÔNG TIN CẬP NHẬT SANG FILE ROUTES BACKEND ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/reception/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        alert("Cập nhật thông tin khách hàng thành công!");
        setIsOpenEditModal(false); // Đóng popup
        loadCustomers(); // Tải lại bảng dữ liệu mới đồng bộ lên giao diện màn hình
      } else {
        alert("Cập nhật thất bại, vui lòng kiểm tra lại thông tin gửi đi.");
      }
    } catch (error) {
      console.error("Lỗi gửi request sửa khách hàng:", error);
    }
  };

  // Bộ lọc tìm kiếm động theo Họ tên, SĐT hoặc CCCD dựa trên State thực tế
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.cccd.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      {/* Gọi Sidebar của nhóm và truyền user giả lập */}
      <Sidebar user={mockUser} />

      {/* Vùng nội dung chính bên phải */}
      <div style={{ flexGrow: 1, padding: '40px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Quản lý khách hàng</h1>

        {/* Thanh công cụ: Ô tìm kiếm + Nút Thêm tài khoản */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#ffffff', 
          padding: '16px 24px', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px',
          border: '1px solid #f1f5f9'
        }}>
          {/* Ô tìm kiếm thông minh */}
          <div style={{ position: 'relative', width: '75%' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo Họ tên, SĐT, CCCD..." 
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

          {/* Nút Thêm tài khoản vãng lai/mới */}
          <button style={{ 
            backgroundColor: '#2563eb', 
            color: '#ffffff', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '10px', 
            fontWeight: '600', 
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Thêm tài khoản
          </button>
        </div>

        {/* Bảng danh sách khách hàng chuẩn UI */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Mã BN</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Họ tên</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Ngày sinh</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Số điện thoại</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>CCCD</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Trạng thái</th>
                <th style={{ padding: '18px 24px', color: '#64748b', fontWeight: '600' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                  <td style={{ padding: '20px 24px', fontWeight: '600', color: '#475569' }}>{c.id}</td>
                  <td style={{ padding: '20px 24px', fontWeight: '700', color: '#0f172a' }}>{c.name}</td>
                  <td style={{ padding: '20px 24px' }}>{c.dob}</td>
                  <td style={{ padding: '20px 24px' }}>{c.phone}</td>
                  <td style={{ padding: '20px 24px' }}>{c.cccd}</td>
                  
                  {/* Khối nhãn Trạng thái tự động chuyển màu sắc theo trạng thái tài khoản */}
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '50px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: c.status === 'Tạm khóa' ? '#fee2e2' : '#dcfce7',
                      color: c.status === 'Tạm khóa' ? '#ef4444' : '#16a34a',
                      display: 'inline-block'
                    }}>
                      {c.status || 'Đang hoạt động'}
                    </span>
                  </td>

                  {/* Nút hành động sửa nhanh -> Gắn sự kiện kích hoạt mở Popup */}
                  <td style={{ padding: '20px 24px' }}>
                    <button 
                      onClick={() => handleOpenEditPopup(c)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#2563eb', 
                        cursor: 'pointer', 
                        fontSize: '18px',
                        padding: 0 
                      }} 
                      title="Chỉnh sửa thông tin"
                    >
                      📝
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy dữ liệu khách hàng nào trùng khớp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================================================================= */}
        {/* KHỐI POPUP MODAL CHỈNH SỬA THÔNG TIN KHÁCH HÀNG (MỚI TÍCH HỢP) */}
        {/* ================================================================= */}
        {isOpenEditModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              
              <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Cập nhật thông tin</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>Mã bệnh nhân: <strong>{selectedCustomer?.id}</strong></p>
              
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Họ và tên *</label>
                  <input type="text" required value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Ngày sinh (DD/MM/YYYY) *</label>
                  <input type="text" placeholder="Ví dụ: 15/03/1990" required value={editFormData.dob} onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Số điện thoại *</label>
                  <input type="tel" required value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Số CCCD *</label>
                  <input type="text" required value={editFormData.cccd} onChange={(e) => setEditFormData({...editFormData, cccd: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Trạng thái tài khoản</label>
                  <MacDropdown 
                    value={editFormData.status} 
                    onChange={(val) => setEditFormData({...editFormData, status: val})}
                    options={[
                      { label: "Đang hoạt động", value: "Đang hoạt động" },
                      { label: "Tạm khóa", value: "Tạm khóa" }
                    ]}
                  />
                </div>

                {/* Các nút lệnh xử lý điều hướng đóng/gửi form */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsOpenEditModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b', fontSize: '15px' }}>Hủy bỏ</button>
                  <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>Lưu thay đổi</button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}