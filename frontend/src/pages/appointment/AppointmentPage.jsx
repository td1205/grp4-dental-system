import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';

export default function AppointmentPage() {
  const mockUser = { name: "Lê Tân", role: "Lễ Tân", initials: "LT" };

  const doctors = ['BS. Hưng', 'BS. Tiến', 'BS. Bình', 'BS. Cường'];
  const services = ['Khám tổng quát', 'Nhổ răng khôn', 'Niềng răng', 'Tẩy trắng răng', 'Trám răng'];

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
  const [appointments, setAppointments] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState('Tra cứu bác sĩ');
  const [statusFilter, setStatusFilter] = useState('Lọc Trạng thái');

  // Công tắc quản lý Modal Tạo lịch mới & Modal Đổi lịch
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenRescheduleModal, setIsOpenRescheduleModal] = useState(false);

  // State lưu lịch hẹn đang được chọn để đổi lịch
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // State Form Tạo lịch mới
  const [formData, setFormData] = useState({
    name: '', phone: '', date: '', time: '', service: 'Khám tổng quát', doctor: 'BS. Hưng'
  });

  // State Form Đổi lịch (Bao gồm Ngày, Giờ và Bác sĩ cập nhật)
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', doctor: 'BS. Hưng' });

  // Tải dữ liệu từ Backend
  const loadAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Lỗi kết nối tới API lịch hẹn 3001:", error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Hàm Hủy lịch hẹn nhanh
  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã hủy' })
      });
      if (response.ok) {
        alert("Đã hủy lịch hẹn thành công!");
        loadAppointments();
      }
    } catch (error) {
      console.error("Lỗi hủy lịch:", error);
    }
  };

  // Hàm mở Modal Đổi lịch và nạp dữ liệu cũ của thẻ Card vào form
  const openReschedulePopup = (apt) => {
    setSelectedAppointment(apt);
    setRescheduleData({ 
      date: apt.date, 
      time: apt.time,
      doctor: apt.doctor || 'BS. Hưng' // Nạp kèm bác sĩ hiện tại của card vào popup
    });
    setIsOpenRescheduleModal(true);
  };

  // --- HÀM SUBMIT GỬI NGÀY GIỜ ĐỔI LÊN SERVER ---
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${selectedAppointment.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: rescheduleData.date,
          time: rescheduleData.time,
          doctor: rescheduleData.doctor // Bắn đầy đủ dữ liệu lên backend
        })
      });

      if (response.ok) {
        alert("Thay đổi lịch hẹn thành công!");
        setIsOpenRescheduleModal(false);
        loadAppointments(); // Tải lại giao diện
      } else {
        alert("Có lỗi xảy ra khi cập nhật dữ liệu.");
      }
    } catch (error) {
      console.error("Lỗi đổi lịch hẹn:", error);
    }
  };

  // Hàm tạo lịch mới
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Tạo lịch hẹn mới thành công!");
        setIsOpenModal(false);
        setFormData({ name: '', phone: '', date: '', time: '', service: 'Khám tổng quát', doctor: 'BS. Hưng' });
        loadAppointments();
      }
    } catch (error) {
      console.error("Lỗi tạo lịch:", error);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesDoctor = doctorFilter === 'Tra cứu bác sĩ' ? true : apt.doctor === doctorFilter;
    const matchesStatus = statusFilter === 'Lọc Trạng thái' ? true : apt.status === statusFilter;
    return matchesDoctor && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      <Sidebar user={mockUser} />

      <div style={{ flexGrow: 1, padding: '40px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Quản lý lịch hẹn</h1>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', minWidth: '150px', outline: 'none', cursor: 'pointer' }}>
            <option value="Tra cứu bác sĩ">Tra cứu bác sĩ</option>
            <option value="BS. Hưng">BS. Hưng</option>
            <option value="BS. Tiến">BS. Tiến</option>
          </select>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', minWidth: '150px', outline: 'none', cursor: 'pointer' }}>
            <option value="Lọc Trạng thái">Lọc Trạng thái</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>

          <div style={{ flexGrow: 1 }}></div>

          <button onClick={() => setIsOpenModal(true)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>+</span> Tạo lịch hẹn mới
          </button>
        </div>

        {/* Danh sách Lịch hẹn dạng Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredAppointments.map((apt) => (
            <div key={apt.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', position: 'relative', opacity: apt.status === 'Đã hủy' ? 0.55 : 1 }}>
              <span style={{ 
                position: 'absolute', top: '20px', right: '20px', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600',
                backgroundColor: apt.status === 'Đã xác nhận' ? '#dbeafe' : apt.status === 'Chờ xác nhận' ? '#ffe4e6' : '#f1f5f9',
                color: apt.status === 'Đã xác nhận' ? '#2563eb' : apt.status === 'Chờ xác nhận' ? '#ef4444' : '#64748b'
              }}>
                {apt.status}
              </span>

              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', color: '#0f172a' }}>{apt.name}</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>{apt.phone}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#334155', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📅 {apt.date}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⏰ {apt.time}</div>
                <div><strong>Dịch vụ:</strong> {apt.service}</div>
                <div><strong>Bác sĩ:</strong> {apt.doctor}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                {apt.status !== 'Đã hủy' ? (
                  <>
                    <button onClick={() => openReschedulePopup(apt)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: '600', color: '#334155' }}>
                       🔄 Đổi lịch
                    </button>
                    <button onClick={() => handleCancelAppointment(apt.id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', color: '#ef4444', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: '600' }}>
                       ❌ Hủy lịch
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>Lịch hẹn này đã bị hủy bỏ</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* MODAL POPUP THAO TÁC ĐỔI LỊCH (ĐỒNG BỘ THEO ẢNH MẪU POPUP CỦA BẠN) */}
        {/* ================================================================= */}
        {isOpenRescheduleModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '18px' }}>🔄</span>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Đổi lịch hẹn mới</h2>
              </div>
              
              <form onSubmit={handleRescheduleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Ngày mới:</label>
                  <input type="date" required value={rescheduleData.date} onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Giờ mới:</label>
                  <input type="time" required value={rescheduleData.time} onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Bác sĩ:</label>
                  <select value={rescheduleData.doctor} onChange={(e) => setRescheduleData({...rescheduleData, doctor: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '15px', cursor: 'pointer' }}>
                    {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsOpenRescheduleModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b', fontSize: '15px' }}>Hủy bỏ</button>
                  <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🔄 Xác nhận Đổi lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL POPUP ĐẶT LỊCH HẸN MỚI BAN ĐẦU */}
        {/* ================================================================= */}
        {isOpenModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Đặt lịch hẹn mới</h2>
              <form onSubmit={handleCreateAppointment}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Tên bệnh nhân *</label>
                  <input type="text" placeholder="Nhập họ tên" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Số điện thoại *</label>
                  <input type="tel" placeholder="Nhập số điện thoại" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Ngày hẹn *</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div style={{ width: '140px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Giờ hẹn *</label>
                    <input type="time" required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Dịch vụ nha khoa</label>
                  <select value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Bác sĩ phụ trách</label>
                  <select value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
                    {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsOpenModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Hủy</button>
                  <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Tạo lịch hẹn</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}