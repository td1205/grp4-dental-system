import { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon } from '../../components/common/Icon/Icon';
import {
  addWeeks, startOfWeek, endOfWeek, format, eachDayOfInterval,
  isSameDay, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths, isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import './ScheduleShiftsPage.css';

import { ShiftFormModal } from '../../components/staff/form/shiftFromModal';
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
  const [shifts, setShifts] = useState([]);
  const [staffList, setStaffList] = useState([]); // State cho danh sách nhân viên
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State cho modal thêm lịch

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
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/shifts', { headers: { Authorization: `Bearer ${token}` } });
      setShifts(res.data.map(s => ({ ...s, color: getRoleColor(s.role) })));
    } catch (err) { console.error("Lỗi lấy lịch:", err); }
  };

  useEffect(() => {
    fetchShifts();
    // Lấy danh sách nhân viên cho dropdown
    const fetchStaff = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/staffs/for-scheduling', { headers: { Authorization: `Bearer ${token}` } });
      setStaffList(res.data);
    };
    fetchStaff();
  }, [currentWeek]);

  return (
    <div className="schedule-wrapper">
      <div className="main-calendar">
        <div className="calendar-header">
          <div className="calendar-title">
            <Icon name="calendar" size={20} /> Lịch làm việc
          </div>
          <button className="btn-add-shift" onClick={() => setIsAddModalOpen(true)}>
            <Icon name="plus" size={16} /> Thêm ca trực
          </button>
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
                    {shifts.filter(s => isSameDay(new Date(s.date), day)).map((shift) => (
                      <div key={shift._id} className={`shift-card ${shift.color}`}
                        style={{ top: `${timeToPixels(shift.startTime)}px`, height: `${timeToPixels(shift.endTime) - timeToPixels(shift.startTime)}px` }}
                        onClick={() => setSelectedShift(shift)}>
                        <div className="shift-card-header"><div className="shift-card-title">{shift.role} - {shift.room}</div><div>{shift.startTime} - {shift.endTime}</div></div>
                        <div className="shift-card-body"><div><div className="shift-staff-name">{shift.staffId?.name}</div><div className="shift-room">Tại: {shift.room}</div></div></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mini-calendar-sidebar">
        {/* Nội dung Sidebar Mini Lịch như cũ */}
      </div>

      {/* MODALS */}
      {selectedShift && (
        <div className="shift-modal-overlay" onClick={() => setSelectedShift(null)}>
          <div className="shift-modal-content" onClick={e => e.stopPropagation()}>
            {/* Nội dung Modal xem chi tiết */}
          </div>
        </div>
      )}

      <ShiftFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => { setIsAddModalOpen(false); fetchShifts(); }}
        staffList={staffList}
      />
    </div>
  );
}