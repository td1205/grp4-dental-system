import { useState, useEffect } from 'react';
import { Icon } from '../../components/common/Icon/Icon';
import {
  addWeeks, subWeeks, startOfWeek, endOfWeek, format, eachDayOfInterval,
  isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import './ScheduleShiftsPage.css';
import { MiniCalendar } from '../../components/common/MiniCalendar/MiniCalendar.jsx';
import { ShiftFormModal } from '../../components/staff/form/shiftFromModal';
import { CopyShiftModal } from '../../components/staff/form/CopyShiftModal';
import apiClient from '../../services/apiClient';
import toast, { Toaster } from 'react-hot-toast';
const HOUR_HEIGHT = 80;
const START_HOUR = 8;

const timeToPixels = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return ((hours - START_HOUR) + minutes / 60) * HOUR_HEIGHT;
};

const getRoleColor = (role) => {
  const r = role?.toLowerCase() || '';
  if (r.includes('bác sĩ') || r.includes('doctor')) return 'bg-blue';
  if (r.includes('lễ tân') || r.includes('receptionist')) return 'bg-orange';
  return 'bg-slate';
};

export function ScheduleShiftsPage() {
  // Lấy thông tin user hiện tại để phân quyền hiển thị nút
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = (currentUser.role || '').toLowerCase() === 'admin';

  const [shifts, setShifts] = useState([]);
  const [staffList, setStaffList] = useState([]); // State cho danh sách nhân viên
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('Tất cả');
  const [shiftToDelete, setShiftToDelete] = useState(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hoursOfDay = Array.from({ length: 14 }, (_, i) => i + START_HOUR);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const fetchShifts = async () => {
    try {
      const res = await apiClient.get('/shifts');
      setShifts(res.data.map(s => ({ ...s, color: getRoleColor(s.role) })));
    } catch (err) {
      console.error('Lỗi lấy lịch:', err);
      toast.error('Không thể tải dữ liệu lịch trực');
    }
  };

  useEffect(() => {
    fetchShifts();

    if (isAdmin) {
      const fetchStaff = async () => {
        try {
          const res = await apiClient.get('/staffs/for-scheduling');
          setStaffList(res.data);
        } catch (err) {
          console.error('Lỗi lấy danh sách nhân viên:', err);
        }
      };
      fetchStaff();
    }
  }, [currentWeek, isAdmin]);

  return (
    <div className="schedule-wrapper">
      <div className="main-calendar">
        <div className="calendar-header">
          <div className="calendar-title">
            <Icon name="calendar" size={20} /> Lịch làm việc
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              className="role-filter" 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff' }}
            >
              <option value="Tất cả">Tất cả vai trò</option>
              <option value="Bác sĩ">Bác sĩ</option>
              <option value="Lễ tân">Lễ tân</option>
            </select>
            <button className="btn-add-shift" style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db' }} onClick={() => setCurrentWeek(w => subWeeks(w, 1))}>
              ← Tuần trước
            </button>
            <button className="btn-add-shift" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }} onClick={() => setCurrentWeek(new Date())}>
              Hôm nay
            </button>
            <button className="btn-add-shift" style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db' }} onClick={() => setCurrentWeek(w => addWeeks(w, 1))}>
              Tuần sau →
            </button>
            {isAdmin && (
              <>
                <button className="btn-add-shift" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => setIsCopyModalOpen(true)}>
                  <Icon name="file-text" size={16} /> Sao chép lịch tuần
                </button>
                <button className="btn-add-shift" onClick={() => { setEditingShift(null); setIsFormModalOpen(true); }}>
                  <Icon name="plus" size={16} /> Thêm ca trực
                </button>
              </>
            )}
          </div>
        </div>

        <div className="calendar-body-scroll">
          <div className="calendar-grid-min-width">
            <div className="days-header">
              <div className="time-col-header"><Icon name="clock" size={16} /> Giờ VN</div>
              {weekDays.map((day, idx) => (
                <div key={idx} className="day-col-header">
                  <div className="day-date">{format(day, 'dd/MM/yyyy')}</div>
                  <div className="day-name">{format(day, 'EEEE', { locale: vi })}</div>
                </div>
              ))}
            </div>

            <div className="time-grid-container">
              <div className="time-labels-col">
                {hoursOfDay.map((hour) => <div key={hour} className="time-label">{hour}:00</div>)}
              </div>
              <div className="shifts-area">
                <div className="bg-lines">
                  {hoursOfDay.map((hour) => <div key={hour} className="bg-line"></div>)}
                </div>
                {weekDays.map((day, dayIdx) => (
                  <div key={dayIdx} className="day-column">
                    {shifts.filter(s => {
                      if (roleFilter !== 'Tất cả' && s.role !== roleFilter) return false;
                      return isSameDay(new Date(s.date), day);
                    }).map((shift) => {
                      const dayShifts = shifts.filter(s => isSameDay(new Date(s.date), day) && (roleFilter === 'Tất cả' || s.role === roleFilter));
                      const overlapping = dayShifts.filter(s => s.startTime < shift.endTime && s.endTime > shift.startTime);
                      overlapping.sort((a,b) => a.startTime.localeCompare(b.startTime) || a._id.localeCompare(b._id));
                      const idx = overlapping.findIndex(s => s._id === shift._id);
                      const count = overlapping.length;
                      
                      const width = count > 1 ? `calc(${100 / count}% - 8px)` : 'auto';
                      const left = count > 1 ? `calc(${idx * (100 / count)}% + 4px)` : '4px';

                      return (
                      <div key={shift._id} className={`shift-card ${shift.color}`}
                        style={{ top: `${timeToPixels(shift.startTime)}px`, height: `${timeToPixels(shift.endTime) - timeToPixels(shift.startTime)}px`, width: width, left: left, right: count > 1 ? 'auto' : '4px' }}
                        onClick={() => setSelectedShift(shift)}>
                        <div className="shift-card-header"><div className="shift-card-title">{shift.role}</div><div>{shift.startTime} - {shift.endTime}</div></div>
                        <div className="shift-card-body"><div><div className="shift-staff-name">{shift.staffId?.name}</div><div className="shift-room">Tại: {shift.room}</div></div></div>
                      </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mini-calendar-sidebar">
        <MiniCalendar
          selectedDate={currentWeek}
          onDateClick={(date) => setCurrentWeek(date)}
        />
      </div>

      {/* MODALS */}
      {selectedShift && !isFormModalOpen && (
        <div className="shift-modal-overlay" onClick={() => setSelectedShift(null)}>
          <div className="shift-modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px', width: '400px', backgroundColor: '#fff', borderRadius: '12px' }}>
            <div className="shift-modal-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>Chi tiết ca trực</h2>
                <button className="shift-modal-close" onClick={() => setSelectedShift(null)} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ marginBottom: '12px' }}><strong>Nhân viên:</strong> {selectedShift.staffId?.name}</div>
            <div style={{ marginBottom: '12px' }}><strong>Vai trò:</strong> {selectedShift.role}</div>
            <div style={{ marginBottom: '12px' }}><strong>Phòng khám:</strong> {selectedShift.room}</div>
            {selectedShift.role === 'Bác sĩ' && (
                <div style={{ marginBottom: '12px' }}>
                    <strong>Lễ tân trực cùng:</strong> {
                        shifts.find(s => 
                            s.role === 'Lễ tân' && 
                            isSameDay(new Date(s.date), new Date(selectedShift.date)) && 
                            s.startTime <= selectedShift.startTime && 
                            s.endTime >= selectedShift.endTime
                        )?.staffId?.name || <span style={{color: '#ef4444'}}>Trống (Cảnh báo thiếu)</span>
                    }
                </div>
            )}
            <div style={{ marginBottom: '12px' }}><strong>Ngày:</strong> {format(new Date(selectedShift.date), 'dd/MM/yyyy')}</div>
            <div style={{ marginBottom: '24px' }}><strong>Thời gian:</strong> {selectedShift.startTime} - {selectedShift.endTime}</div>
            {isAdmin && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="customer-btn-cancel" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => setShiftToDelete(selectedShift)}>Xóa ca</button>
                    <button className="btn-add-shift" onClick={() => {
                        setEditingShift(selectedShift);
                        setIsFormModalOpen(true);
                    }}>Sửa ca</button>
                </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {shiftToDelete && (
        <div className="shift-modal-overlay" onClick={() => setShiftToDelete(null)}>
            <div className="shift-modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px', width: '400px', backgroundColor: '#fff', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0, fontSize: '18px' }}>Xác nhận xóa ca trực</h3>
                <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.5' }}>Bạn có chắc chắn muốn xóa ca trực này không? Hành động này không thể hoàn tác.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="customer-btn-cancel" onClick={() => setShiftToDelete(null)}>Hủy</button>
                    <button className="btn-add-shift" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={async () => {
                        try {
                            await apiClient.delete(`/shifts/${shiftToDelete._id}`);
                            toast.success('Đã xóa ca trực');
                            setShiftToDelete(null);
                            setSelectedShift(null);
                            fetchShifts();
                        } catch(err) {
                            toast.error(err.response?.data?.message || 'Lỗi khi xóa ca trực');
                        }
                    }}>Xóa ca trực</button>
                </div>
            </div>
        </div>
      )}

      {isFormModalOpen && (
        <ShiftFormModal
          isOpen={isFormModalOpen}
          onClose={() => { setIsFormModalOpen(false); setEditingShift(null); setSelectedShift(null); }}
          onSave={() => { setIsFormModalOpen(false); setEditingShift(null); setSelectedShift(null); fetchShifts(); }}
          staffList={staffList}
          initialData={editingShift}
          existingShifts={shifts}
        />
      )}

      <CopyShiftModal 
        isOpen={isCopyModalOpen} 
        onClose={() => setIsCopyModalOpen(false)} 
        onSuccess={() => fetchShifts()}
        currentWeek={currentWeek}
      />

      <Toaster />
    </div>
  );
}