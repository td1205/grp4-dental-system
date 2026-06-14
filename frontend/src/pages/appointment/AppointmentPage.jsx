import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import { ManagementPageLayout } from '../../components/layout/ManagementPageLayout/ManagementPageLayout';
import { SummaryCards } from '../../components/common/SummaryCards/SummaryCards';
import { Modal } from '../../components/common/Modal/Modal';
import { FormField } from '../../components/common/FormField/FormField';
import { Icon } from '../../components/common/Icon/Icon';
import { AppointmentCard } from '../../components/common/AppointmentCard/AppointmentCard';
import { Button } from '../../components/ui/Button/Button';
import { CalendarDays, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import '../../styles/staff-management.css';

export default function AppointmentPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = currentUser.role || '';

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  // Form data
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', time: '', serviceId: '', doctorId: '', notes: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', doctorId: '' });
  const [cancelReason, setCancelReason] = useState('');

  const loadData = async () => {
    try {
      const [aptRes, srvRes, shfRes, cusRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/services'),
        apiClient.get('/shifts'),
        apiClient.get('/customers'),
      ]);
      setAppointments(aptRes.data.data || []);
      setServices((srvRes.data.data || []).filter(s => s.status === 'active'));
      setShifts(shfRes.data?.data || shfRes.data || []);
      setCustomers(cusRes.data?.data || []);
    } catch {
      toast.error('Lỗi kết nối tới Server');
    }
  };

  useEffect(() => { 
    loadData(); 
    // AS2.5.1: API Short Polling (Tự động tải lại ngầm mỗi 10 giây)
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto fill name when phone matches an existing customer
  useEffect(() => {
    if (formData.phone && formData.phone.length >= 10 && Array.isArray(customers)) {
      const found = customers.find(c => c.phone === formData.phone.trim());
      if (found) {
        setFormData(prev => ({ ...prev, name: found.name }));
        toast.success(`Đã tìm thấy: ${found.name}`);
      }
    }
  }, [formData.phone]);

  // Get doctors on shift for a given date + time
  const getAvailableDoctors = (date, time) => {
    if (!date || !time) return [];
    const d1 = date; // date from input type="date" is already "yyyy-MM-dd"
    const seen = new Set();
    return shifts
      .filter(s => {
        const d2 = format(new Date(s.date), 'yyyy-MM-dd');
        return s.role === 'Bác sĩ' && d1 === d2 && s.startTime <= time && s.endTime >= time;
      })
      .filter(s => {
        if (seen.has(s.staffId?._id)) return false;
        seen.add(s.staffId?._id);
        return true;
      })
      .map(s => s.staffId);
  };

  const availableDoctorsCreate = getAvailableDoctors(formData.date, formData.time);
  const availableDoctorsReschedule = getAvailableDoctors(rescheduleData.date, rescheduleData.time);

  const allDoctorNames = Array.from(new Set(
    shifts.filter(s => s.role === 'Bác sĩ' && s.staffId).map(s => s.staffId.name)
  ));

  const filtered = appointments.filter(apt => {
    const matchPhone = searchPhone
      ? (apt.customerId?.phone || '').includes(searchPhone.trim())
      : true;
    const matchStatus = statusFilter ? apt.status === statusFilter : true;
    const matchDoctor = doctorFilter ? apt.doctorId?.name === doctorFilter : true;
    return matchPhone && matchStatus && matchDoctor;
  });

  // ---- Handlers ----
  const handleCreate = async (e, force = false) => {
    e.preventDefault();
    try {
      await apiClient.post('/appointments', { ...formData, forceCreate: force });
      toast.success('Đặt lịch thành công!');
      setCreateOpen(false);
      setFormData({ name: '', phone: '', date: '', time: '', serviceId: '', doctorId: '', notes: '' });
      loadData();
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresForce) {
        if (window.confirm(data.message + '\n\nBạn có muốn tiếp tục tạo lịch hẹn?')) {
          handleCreate(e, true);
        }
      } else {
        toast.error(data?.message || 'Lỗi tạo lịch');
      }
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/appointments/${selectedApt._id}/reschedule`, rescheduleData);
      toast.success('Dời lịch thành công!');
      setRescheduleOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi dời lịch');
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/appointments/${selectedApt._id}/cancel`, { cancelReason });
      toast.success('Đã hủy lịch hẹn!');
      setCancelOpen(false);
      setCancelReason('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi hủy lịch');
    }
  };

  const handleUpdateStatus = async (appointment, newStatus) => {
    try {
      await apiClient.put(`/appointments/${appointment._id}/status`, {
        status: newStatus,
        expectedOldStatus: appointment.status
      });
      toast.success(`Chuyển trạng thái thành ${newStatus}`);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi cập nhật trạng thái';
      toast.error(msg);
      loadData(); // Bắt buộc tải lại để đồng bộ DB nếu bị lỗi Concurrency
    }
  };

  // ---- Summary counts ----
  const countByStatus = (s) => appointments.filter(a => a.status === s).length;

  const summaryItems = [
    { title: 'Chờ tiếp đón', value: countByStatus('Chờ tiếp đón') + countByStatus('Chờ xác nhận'), icon: <Clock size={22} />, color: '#d97706' },
    { title: 'Chờ khám', value: countByStatus('Chờ khám'), icon: <Clock size={22} />, color: 'var(--staff-primary)' },
    { title: 'Đang khám', value: countByStatus('Đang khám'), icon: <CheckCircle2 size={22} />, color: 'var(--color-cta)' },
    { title: 'Tổng lịch hẹn', value: appointments.length, icon: <CalendarDays size={22} />, color: 'var(--color-link-active)' },
  ];

  // ---- Toolbar ----
  const toolbar = (
    <div className="staff-toolbar">
      <div className="staff-toolbar__search">
        <span className="staff-toolbar__search-icon"><Icon name="search" size={16} /></span>
        <input
          id="apt-search-phone"
          className="staff-toolbar__input"
          placeholder="Tìm theo số điện thoại..."
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
        />
      </div>
      <select
        id="apt-filter-status"
        className="staff-toolbar__select"
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
      >
        <option value="">Tất cả trạng thái</option>
        {['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Chờ xác nhận', 'Đã xác nhận', 'Đã dời', 'Đã hủy', 'Không đến', 'Hoàn thành'].map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {(userRole !== 'Doctor' && userRole !== 'Bác sĩ') && (
        <select
          id="apt-filter-doctor"
          className="staff-toolbar__select"
          value={doctorFilter}
          onChange={e => setDoctorFilter(e.target.value)}
        >
          <option value="">Tất cả bác sĩ</option>
          {allDoctorNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      )}
      <div style={{ flex: 1 }} />
      {(userRole !== 'Doctor' && userRole !== 'Bác sĩ') && (
        <Button
          id="apt-btn-add"
          variant="primary"
          onClick={() => setCreateOpen(true)}
        >
          <Icon name="plus" size={16} /> Thêm lịch hẹn mới
        </Button>
      )}
    </div>
  );

  // ---- Doctor options helper ----
  const doctorOptions = (list) => [
    { value: '', label: '-- Chọn bác sĩ có ca trực --' },
    ...list.filter(Boolean).map(d => ({ value: d._id, label: d.name })),
  ];

  const serviceOptions = [
    { value: '', label: '-- Chọn dịch vụ --' },
    ...services.map(s => ({ value: s._id, label: `${s.name} (${s.duration}p)` })),
  ];

  return (
    <>
      <ManagementPageLayout
        title={(userRole === 'Doctor' || userRole === 'Bác sĩ') ? "Hàng đợi khám bệnh" : "Quản lý lịch hẹn"}
        subtitle={(userRole === 'Doctor' || userRole === 'Bác sĩ') ? "Danh sách bệnh nhân trong ca trực hôm nay" : "Tiếp nhận, điều phối và quản lý vòng đời lịch hẹn khám bệnh"}
        toolbar={toolbar}
      >
        <SummaryCards items={summaryItems} />

        {filtered.length === 0 ? (
          <div className="staff-table__message">Không có lịch hẹn nào phù hợp</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '8px' }}>
            {filtered.map(apt => (
              <AppointmentCard
                key={apt._id}
                appointment={apt}
                onReschedule={(a) => {
                  setSelectedApt(a);
                  setRescheduleData({
                    date: new Date(a.date).toISOString().split('T')[0],
                    time: a.time,
                    doctorId: a.doctorId?._id || ''
                  });
                  setRescheduleOpen(true);
                }}
                onCancel={(a) => {
                  setSelectedApt(a);
                  setCancelReason('');
                  setCancelOpen(true);
                }}
                onUpdateStatus={handleUpdateStatus}
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </ManagementPageLayout>

      {/* ── Modal Tạo lịch hẹn ── */}
      <Modal
        isOpen={createOpen}
        title="Đặt lịch hẹn mới"
        subtitle="Tra cứu hoặc tạo mới hồ sơ bệnh nhân, chọn dịch vụ và bác sĩ có ca trực"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setCreateOpen(false)}>Hủy</button>
            <button
              form="form-create-apt"
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={!formData.doctorId}
            >
              Xác nhận đặt lịch
            </button>
          </>
        }
      >
        <form id="form-create-apt" onSubmit={(e) => handleCreate(e, false)}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField
                id="apt-phone"
                label="Số điện thoại"
                required
                type="tel"
                placeholder="Nhập để tra cứu hồ sơ..."
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                id="apt-name"
                label="Họ tên bệnh nhân"
                required
                placeholder="Họ và tên đầy đủ"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField
                id="apt-date"
                label="Ngày hẹn"
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value, doctorId: '' }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                id="apt-time"
                label="Giờ hẹn"
                required
                type="time"
                value={formData.time}
                onChange={e => setFormData(p => ({ ...p, time: e.target.value, doctorId: '' }))}
              />
            </div>
          </div>
          <FormField
            id="apt-service"
            label="Dịch vụ nha khoa"
            required
            as="select"
            value={formData.serviceId}
            onChange={e => setFormData(p => ({ ...p, serviceId: e.target.value }))}
            options={serviceOptions}
          />
          <FormField
            id="apt-doctor"
            label="Bác sĩ có ca trực"
            required
            as="select"
            value={formData.doctorId}
            onChange={e => setFormData(p => ({ ...p, doctorId: e.target.value }))}
            options={doctorOptions(availableDoctorsCreate)}
          />
          {formData.date && formData.time && availableDoctorsCreate.length === 0 && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc2626' }}>
              Không có bác sĩ nào có ca trực vào khung giờ này.
            </p>
          )}
          <FormField
            id="apt-notes"
            label="Ghi chú lâm sàng sơ bộ"
            as="textarea"
            rows={2}
            placeholder="Triệu chứng, dị ứng thuốc, yêu cầu đặc biệt... (không bắt buộc)"
            value={formData.notes}
            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          />
        </form>
      </Modal>

      {/* ── Modal Dời lịch ── */}
      <Modal
        isOpen={rescheduleOpen}
        title="Dời lịch hẹn"
        subtitle={`Bệnh nhân: ${selectedApt?.customerId?.name || ''}`}
        onClose={() => setRescheduleOpen(false)}
        footer={
          <>
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setRescheduleOpen(false)}>Hủy</button>
            <button
              form="form-reschedule"
              type="submit"
              className="modal__btn modal__btn--primary"
              disabled={!rescheduleData.doctorId}
            >
              Cập nhật thay đổi
            </button>
          </>
        }
      >
        <form id="form-reschedule" onSubmit={handleReschedule}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <FormField
                id="rs-date"
                label="Ngày mới"
                required
                type="date"
                value={rescheduleData.date}
                onChange={e => setRescheduleData(p => ({ ...p, date: e.target.value, doctorId: '' }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormField
                id="rs-time"
                label="Giờ mới"
                required
                type="time"
                value={rescheduleData.time}
                onChange={e => setRescheduleData(p => ({ ...p, time: e.target.value, doctorId: '' }))}
              />
            </div>
          </div>
          <FormField
            id="rs-doctor"
            label="Bác sĩ có ca trực"
            required
            as="select"
            value={rescheduleData.doctorId}
            onChange={e => setRescheduleData(p => ({ ...p, doctorId: e.target.value }))}
            options={doctorOptions(availableDoctorsReschedule)}
          />
          {rescheduleData.date && rescheduleData.time && availableDoctorsReschedule.length === 0 && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dc2626' }}>
              Không có bác sĩ nào có ca trực vào khung giờ này.
            </p>
          )}
        </form>
      </Modal>

      {/* ── Modal Hủy lịch ── */}
      <Modal
        isOpen={cancelOpen}
        title="Hủy lịch hẹn"
        subtitle={`Bệnh nhân: ${selectedApt?.customerId?.name || ''} — ${selectedApt?.date ? format(new Date(selectedApt.date), 'dd/MM/yyyy') : ''}`}
        onClose={() => setCancelOpen(false)}
        footer={
          <>
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setCancelOpen(false)}>Đóng</button>
            <button
              form="form-cancel"
              type="submit"
              className="modal__btn"
              style={{ background: '#dc2626', color: '#fff' }}
            >
              Xác nhận hủy lịch
            </button>
          </>
        }
      >
        <form id="form-cancel" onSubmit={handleCancel}>
          <FormField
            id="cancel-reason"
            label="Lý do hủy"
            required
            as="textarea"
            rows={3}
            placeholder="Vd: Khách hàng báo hủy, khách không đến..."
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
          />
        </form>
      </Modal>
    </>
  );
}