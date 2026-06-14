import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { ManagementPageLayout } from '../../components/layout/ManagementPageLayout/ManagementPageLayout';
import { format, isToday } from 'date-fns';
import { Search, UserPlus, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import './ReceptionPage.css'; // Sẽ tạo file CSS nếu cần hoặc dùng inline style

export default function ReceptionPage() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceId: '',
    doctorId: '',
    time: '' // Phải chọn giờ trống của bác sĩ
  });

  const loadData = async () => {
    try {
      const [aptRes, srvRes, shfRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/services'),
        apiClient.get('/shifts')
      ]);
      setAppointments(aptRes.data?.data || []);
      setServices((srvRes.data?.data || []).filter(s => s.status === 'active'));
      setShifts(shfRes.data?.data || shfRes.data || []);
    } catch (error) {
      toast.error("Lỗi kết nối đến Backend thực tế");
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
    // BR3.4.2 & AS2.5.1: Polling ngầm mỗi 10 giây
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hàm cập nhật trạng thái
  const handleUpdateStatus = async (id, currentStatus, newStatus) => {
    try {
      await apiClient.put(`/appointments/${id}/status`, { 
        status: newStatus,
        expectedOldStatus: currentStatus // EF2.5.2: Chống xung đột
      });
      toast.success(`Cập nhật trạng thái thành ${newStatus}`);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  // Tính toán Bác sĩ và Khung giờ rảnh
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const getAvailableDoctors = () => {
    const seen = new Set();
    return shifts
      .filter(s => s.role === 'Bác sĩ' && format(new Date(s.date), 'yyyy-MM-dd') === todayStr)
      .filter(s => {
        if (!s.staffId) return false;
        if (seen.has(s.staffId._id)) return false;
        seen.add(s.staffId._id);
        return true;
      })
      .map(s => s.staffId);
  };
  const availableDoctors = getAvailableDoctors();

  const getAvailableTimeSlots = (doctorId, serviceId) => {
    if (!doctorId || !serviceId) return [];
    
    // Tìm thời lượng dịch vụ
    const srv = services.find(s => s._id === serviceId);
    if (!srv) return [];

    // Tìm ca trực của bác sĩ hôm nay
    const docShifts = shifts.filter(s => s.role === 'Bác sĩ' && format(new Date(s.date), 'yyyy-MM-dd') === todayStr && s.staffId?._id === doctorId);
    if (docShifts.length === 0) return [];

    // Tạo danh sách các slot trống 15 phút (hoặc theo khung 8:00, 8:15...)
    // Đơn giản hóa: Trả về danh sách tĩnh để demo, thực tế cần logic phức tạp check overlappingApt
    return ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'];
  };
  const availableTimeSlots = getAvailableTimeSlots(formData.doctorId, formData.serviceId);

  // Đăng ký khách vãng lai (Gắn vào UC2.4)
  const handleSubmitWalkIn = async (e, force = false) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.serviceId || !formData.doctorId || !formData.time) {
      toast.error("Vui lòng điền đủ thông tin và chọn Khung giờ!");
      return;
    }

    try {
      const payload = {
        ...formData,
        date: todayStr,
        forceCreate: force
      };
      await apiClient.post('/appointments', payload);
      toast.success("Đăng ký khách vãng lai thành công!");
      setIsOpenModal(false);
      setFormData({ name: '', phone: '', serviceId: '', doctorId: '', time: '' });
      loadData();
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresForce) {
        if (window.confirm(data.message + '\n\nBỏ qua cảnh báo và tiếp tục xếp lịch?')) {
          handleSubmitWalkIn(e, true);
        }
      } else {
        toast.error(data?.message || 'Lỗi đăng ký');
      }
    }
  };

  // Lọc chỉ những lịch hẹn trong hôm nay và khớp tìm kiếm
  const filteredAppointments = appointments.filter(apt => {
    const isTodayApt = isToday(new Date(apt.date));
    if (!isTodayApt) return false;

    const matchPhone = apt.customerId?.phone?.includes(searchTerm);
    const matchName = apt.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCCCD = apt.customerId?.cccd?.includes(searchTerm);
    return matchPhone || matchName || matchCCCD;
  });

  const toolbar = (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '400px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input 
          type="text" 
          placeholder="Nhập Số điện thoại hoặc Họ tên để check-in..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
        />
      </div>
      <button 
        onClick={() => setIsOpenModal(true)}
        style={{ backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
      >
        <UserPlus size={18} /> Đăng ký khách vãng lai
      </button>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ tiếp đón': return { bg: '#fef3c7', text: '#d97706' };
      case 'Chờ khám': return { bg: '#dcfce7', text: '#16a34a' };
      case 'Đang khám': return { bg: '#dbeafe', text: '#2563eb' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <ManagementPageLayout title="Tiếp đón & Hàng đợi" subtitle={`Quản lý luồng bệnh nhân ngày ${format(new Date(), 'dd/MM/yyyy')}`} toolbar={toolbar}>
      <Toaster />
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600' }}>Giờ hẹn</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600' }}>Tên bệnh nhân</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600' }}>Số điện thoại</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600' }}>Dịch vụ</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600' }}>Bác sĩ phụ trách</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '16px 20px', color: '#64748b', fontWeight: '600', width: '160px' }}>Thao tác Lễ tân</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Không có dữ liệu bệnh nhân nào cho ngày hôm nay khớp với tìm kiếm.
                </td>
              </tr>
            ) : filteredAppointments.map(apt => {
              const st = getStatusColor(apt.status);
              return (
                <tr key={apt._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '500', color: '#475569' }}>{apt.time}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>{apt.customerId?.name}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{apt.customerId?.phone}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{apt.serviceId?.name}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{apt.doctorId?.name}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ backgroundColor: st.bg, color: st.text, padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                      {apt.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {apt.status === 'Chờ tiếp đón' && (
                      <button 
                        onClick={() => handleUpdateStatus(apt._id, apt.status, 'Chờ khám')}
                        style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <CheckCircle2 size={16} /> Xác nhận đến
                      </button>
                    )}
                    {apt.status === 'Chờ khám' && (
                      <button 
                        onClick={() => handleUpdateStatus(apt._id, apt.status, 'Đang khám')}
                        style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}
                      >
                        <PlayCircle size={16} /> Cho vào khám
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isOpenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Đăng ký khách vãng lai (Check-in nhanh)</h2>
            
            <form onSubmit={handleSubmitWalkIn}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Họ và tên bệnh nhân *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Số điện thoại *</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Dịch vụ chỉ định *</label>
                <select required value={formData.serviceId} onChange={(e) => setFormData({...formData, serviceId: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} ({s.duration} phút)</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Bác sĩ rảnh hôm nay *</label>
                <select required value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
                  <option value="">-- Chọn bác sĩ --</option>
                  {availableDoctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Khung giờ trống *</label>
                <select required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}>
                  <option value="">-- Chọn khung giờ --</option>
                  {availableTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsOpenModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Tạo ca khám</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagementPageLayout>
  );
}