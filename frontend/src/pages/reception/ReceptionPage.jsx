import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { ManagementPageLayout } from '../../components/layout/ManagementPageLayout/ManagementPageLayout';
import { format, isToday } from 'date-fns';
import { Search, UserPlus, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { CustomerModal } from '../../components/customer/CustomerModal/CustomerModal';
import { MacDropdown } from '../../components/common/MacDropdown/MacDropdown';
import './ReceptionPage.css'; // Sẽ tạo file CSS nếu cần hoặc dùng inline style

export default function ReceptionPage() {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenCustomerModal, setIsOpenCustomerModal] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

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
      if (newStatus === 'Chờ khám') {
        toast('Đã in phiếu khám tự động', { icon: '🖨️' });
      }
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleSearchPatient = async () => {
    if (!searchPhone) return;
    try {
        const res = await apiClient.get('/customers?search=' + searchPhone);
        const data = res.data?.data || [];
        if (data.length > 0) {
            setSelectedPatient(data[0]);
            setFormData({...formData, name: data[0].name, phone: data[0].phone});
            toast.success('Đã tìm thấy dữ liệu hồ sơ!');
        } else {
            toast.error('Không tìm thấy dữ liệu bệnh nhân. Vui lòng Tạo hồ sơ mới!');
            setSelectedPatient(null);
        }
    } catch(err) {
        toast.error('Lỗi tìm kiếm bệnh nhân');
    }
  };

  const handleSaveCustomer = async (customerData) => {
    try {
        const payload = {
           name: customerData.name,
           dob: customerData.dob,
           phone: customerData.phone,
           cccd: customerData.cccd,
           address: customerData.address,
           email: customerData.email,
           medicalHistory: customerData.medicalHistory
        };
        const res = await apiClient.post('/customers', payload);
        toast.success('Thêm mới khách hàng thành công!');
        const newCustomer = res.data.data;
        setSelectedPatient(newCustomer);
        setFormData({...formData, name: newCustomer.name, phone: newCustomer.phone});
        setIsOpenCustomerModal(false);
    } catch(err) {
        toast.error(err.response?.data?.message || 'Lỗi tạo hồ sơ khách hàng');
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
    const duration = srv.duration;

    // Tìm ca trực của bác sĩ hôm nay
    const docShifts = shifts.filter(s => s.role === 'Bác sĩ' && format(new Date(s.date), 'yyyy-MM-dd') === todayStr && s.staffId?._id === doctorId);
    if (docShifts.length === 0) return [];

    // Lịch hẹn của bác sĩ này trong hôm nay
    const docApts = appointments.filter(apt => 
        format(new Date(apt.date), 'yyyy-MM-dd') === todayStr && 
        apt.doctorId?._id === doctorId &&
        ['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Chờ xác nhận', 'Đã xác nhận', 'Đã dời'].includes(apt.status)
    );

    const availableSlots = [];
    
    const toMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };
    const toTimeString = (minutes) => {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    docShifts.forEach(shift => {
        const shiftStart = toMinutes(shift.startTime);
        const shiftEnd = toMinutes(shift.endTime);

        // Chia slot mỗi 30 phút
        for (let t = shiftStart; t + duration <= shiftEnd; t += 30) {
            const slotStartMins = t;
            const slotEndMins = t + duration;
            
            // BR3.1.2: Ẩn khung giờ đã qua so với thời gian thực
            if (slotStartMins <= currentMins) continue;

            // BR3.1.1: Tránh trùng lặp với lịch hẹn đã có
            const isOverlap = docApts.some(apt => {
                const aptStart = toMinutes(apt.time);
                // Tìm duration của apt.serviceId
                const aptSrv = services.find(s => s._id === apt.serviceId?._id);
                const aptDuration = aptSrv ? aptSrv.duration : 30;
                const aptEnd = aptStart + aptDuration;
                return (slotStartMins < aptEnd && slotEndMins > aptStart);
            });

            if (!isOverlap) {
                availableSlots.push(toTimeString(slotStartMins));
            }
        }
    });

    return [...new Set(availableSlots)].sort();
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
      toast.success("Tạo lịch khám vãng lai thành công!");
      toast('Đã in phiếu khám tự động', { icon: '🖨️' });
      setIsOpenModal(false);
      setFormData({ name: '', phone: '', serviceId: '', doctorId: '', time: '' });
      setSelectedPatient(null);
      setSearchPhone('');
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
              {!selectedPatient ? (
                <div style={{ marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Tra cứu Bệnh nhân vãng lai (SĐT hoặc CCCD)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} placeholder="Nhập SĐT hoặc CCCD..." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                        <button type="button" onClick={handleSearchPatient} style={{ padding: '0 16px', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>Tìm kiếm</button>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <button type="button" onClick={() => setIsOpenCustomerModal(true)} style={{ color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', padding: 0 }}>+ Đăng ký hồ sơ mới</button>
                    </div>
                </div>
              ) : (
                <div style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#166534' }}>Bệnh nhân: {selectedPatient.name}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>SĐT: {selectedPatient.phone} - CCCD: {selectedPatient.cccd || 'Trống'}</p>
                    <button type="button" onClick={() => setSelectedPatient(null)} style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Đổi bệnh nhân</button>
                </div>
              )}

              <div style={{ marginBottom: '16px', opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? 'auto' : 'none' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Dịch vụ chỉ định *</label>
                <MacDropdown 
                  value={formData.serviceId} 
                  onChange={(val) => setFormData({...formData, serviceId: val})}
                  placeholder="-- Chọn dịch vụ --"
                  options={[
                    { value: "", label: "-- Chọn dịch vụ --" },
                    ...services.map(s => ({ value: s._id, label: `${s.name} (${s.duration} phút)` }))
                  ]}
                />
              </div>
              <div style={{ marginBottom: '16px', opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? 'auto' : 'none' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Bác sĩ rảnh hôm nay *</label>
                <MacDropdown 
                  value={formData.doctorId} 
                  onChange={(val) => setFormData({...formData, doctorId: val})}
                  placeholder="-- Chọn bác sĩ --"
                  options={[
                    { value: "", label: "-- Chọn bác sĩ --" },
                    ...availableDoctors.map(d => ({ value: d._id, label: d.name }))
                  ]}
                />
              </div>
              <div style={{ marginBottom: '24px', opacity: selectedPatient ? 1 : 0.5, pointerEvents: selectedPatient ? 'auto' : 'none' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Khung giờ trống *</label>
                <MacDropdown 
                  value={formData.time} 
                  onChange={(val) => setFormData({...formData, time: val})}
                  placeholder="-- Chọn khung giờ --"
                  options={[
                    { value: "", label: "-- Chọn khung giờ --" },
                    ...availableTimeSlots.map(t => ({ value: t, label: t })),
                    ...(formData.doctorId && formData.serviceId && availableTimeSlots.length === 0 ? [{ value: "disabled", label: "Tất cả các khung giờ đã đầy (EF3.1.1)" }] : [])
                  ]}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsOpenModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Hủy bỏ</button>
                <button type="submit" disabled={!selectedPatient} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: selectedPatient ? '#1d4ed8' : '#cbd5e1', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Xếp lịch & In phiếu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tái sử dụng CustomerModal từ UC2 */}
      {isOpenCustomerModal && (
        <CustomerModal 
          isOpen={isOpenCustomerModal} 
          onClose={() => setIsOpenCustomerModal(false)} 
          onSave={handleSaveCustomer} 
        />
      )}
    </ManagementPageLayout>
  );
}