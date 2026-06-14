import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';

export default function PersonalSchedulePage() {
  const mockUser = { name: "Lê Tân", role: "Lễ Tân", initials: "LT" };

  // Định nghĩa các ngày trong tuần (Header)
  const daysOfWeek = [
    { name: 'Thứ 2', date: '9/6' },
    { name: 'Thứ 3', date: '10/6' },
    { name: 'Thứ 4', date: '11/6' },
    { name: 'Thứ 5', date: '12/6' },
    { name: 'Thứ 6', date: '13/6' },
    { name: 'Thứ 7', date: '14/6' },
    { name: 'CN', date: '15/6' },
  ];

  // Định nghĩa các khung giờ (Cột bên trái)
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
  const [scheduleData, setScheduleData] = useState({}); 
  const [isOpenLeaveModal, setIsOpenLeaveModal] = useState(false); 

  // State quản lý thông tin điền Form xin nghỉ
  const [leaveFormData, setLeaveFormData] = useState({
    reason: 'Giải quyết việc gia đình', // Mặc định khớp theo form hay dùng của bạn
    startDate: '',
    endDate: '',
    note: ''
  });

  // --- 1. HÀM TẢI DỮ LIỆU LỊCH TRỰC TỪ BACKEND CỔNG 3001 ---
  const loadScheduleData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reception/personal-schedule');
      if (response.ok) {
        const data = await response.json();
        setScheduleData(data); 
      }
    } catch (error) {
      console.error("Lỗi kết nối tới dữ liệu lịch làm việc:", error);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, []);

  // --- 2. HÀM SUBMIT GỬI ĐƠN XIN NGHỈ LÊN SERVER CỔNG 3001 ---
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaveFormData.startDate || !leaveFormData.endDate) {
      alert("Vui lòng nhập đầy đủ Khoảng thời gian từ ngày đến ngày!");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/reception/leave-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(leaveFormData)
      });

      if (response.ok) {
        alert("Gửi đơn xin nghỉ thành công! Đang chờ quản lý phê duyệt.");
        setIsOpenLeaveModal(false); // Đóng popup khẩn cấp
        setLeaveFormData({ reason: 'Giải quyết việc gia đình', startDate: '', endDate: '', note: '' }); // Reset sạch form
      } else {
        // Đọc mã lỗi chi tiết từ Backend bắn ra để dễ bắt bệnh
        const errResult = await response.json();
        alert(`Gửi đơn thất bại: ${errResult.message || 'Vui lòng kiểm tra lại thông tin.'}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối mạng gửi đơn nghỉ:", error);
      alert("Không thể kết nối đến máy chủ Backend cổng 3001. Hãy chắc chắn bạn đã chạy server!");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      {/* Gọi Sidebar của nhóm */}
      <Sidebar user={mockUser} />

      {/* Vùng nội dung chính bên phải */}
      <div style={{ flexGrow: 1, padding: '40px 32px' }}>
        
        {/* Header trên cùng: Tiêu đề + Nút tạo đơn xin nghỉ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Lịch làm việc của tôi</h1>
          <button 
            onClick={() => setIsOpenLeaveModal(true)}
            style={{ 
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
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Tạo đơn xin nghỉ
          </button>
        </div>

        {/* Khung Bảng Lịch Trực (Bo góc, nền trắng) */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)' }}>
            
            {/* --- HÀNG TIÊU ĐỀ (HEADER ROW) --- */}
            <div style={{ padding: '20px', fontWeight: '600', color: '#64748b', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #f1f5f9' }}>
              Thời gian
            </div>
            {daysOfWeek.map((day, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                textAlign: 'center', 
                backgroundColor: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0',
                borderRight: idx < 6 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>{day.name}</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{day.date}</span>
              </div>
            ))}

            {/* --- CÁC HÀNG DỮ LIỆU THỜI GIAN (DATA ROWS) --- */}
            {timeSlots.map((time) => (
              <React.Fragment key={time}>
                <div style={{ 
                  padding: '24px 20px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  borderBottom: '1px solid #f1f5f9', 
                  borderRight: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {time}
                </div>

                {daysOfWeek.map((day, idx) => {
                  const cellKey = `${time}-${day.name}`;
                  const cellData = scheduleData[cellKey];

                  return (
                    <div key={idx} style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #f1f5f9', 
                      borderRight: idx < 6 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: '#ffffff',
                      minHeight: '110px'
                    }}>
                      {cellData && (
                        <div style={{ 
                          backgroundColor: '#eff6ff', 
                          border: '1px solid #bfdbfe', 
                          borderRadius: '12px', 
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          height: '100%'
                        }}>
                          <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '14px' }}>{cellData.shift}</span>
                          <span style={{ color: '#2563eb', fontSize: '12px', fontWeight: '500' }}>{cellData.location}</span>
                          <span style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Bác sĩ: {cellData.doctor}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

          </div>
        </div>

        {/* ================================================================= */}
        {/* KHỐI POPUP MODAL TẠO ĐƠN XIN NGHỈ CHO LỄ TÂN */}
        {/* ================================================================= */}
        {isOpenLeaveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              
              <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Tạo đơn xin nghỉ mới</h2>
              
              <form onSubmit={handleLeaveSubmit}>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Lý do xin nghỉ *</label>
                  <select 
                    value={leaveFormData.reason} 
                    onChange={(e) => setLeaveFormData({...leaveFormData, reason: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '15px', cursor: 'pointer' }}
                  >
                    <option value="Giải quyết việc gia đình">Giải quyết việc gia đình</option>
                    <option value="Nghỉ ốm / Khám bệnh">Nghỉ ốm / Khám bệnh</option>
                    <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                    <option value="Lý do cá nhân khác">Lý do cá nhân khác</option>
                  </select>
                </div>

                {/* Chọn khoảng thời gian */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Từ ngày *</label>
                    <input type="date" required value={leaveFormData.startDate} onChange={(e) => setLeaveFormData({...leaveFormData, startDate: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Đến hết ngày *</label>
                    <input type="date" required value={leaveFormData.endDate} onChange={(e) => setLeaveFormData({...leaveFormData, endDate: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Ghi chú / Giải trình thêm</label>
                  <textarea 
                    placeholder="Nhập nội dung chi tiết lý do xin nghỉ..." 
                    rows="3"
                    value={leaveFormData.note} 
                    onChange={(e) => setLeaveFormData({...leaveFormData, note: e.target.value})} 
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', fontFamily: 'inherit', resize: 'none' }}
                  />
                </div>

                {/* Các nút lệnh gửi Form */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsOpenLeaveModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b', fontSize: '15px' }}>Hủy bỏ</button>
                  <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>Gửi đơn xin nghỉ</button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}