import { useState, useEffect } from 'react';
import axios from 'axios';
import { Icon } from '../../components/common/Icon/Icon';
import {
  addWeeks, startOfWeek, endOfWeek, format, eachDayOfInterval,
  isSameDay, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths, isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import './ScheduleShiftsPage.css';

const HOUR_HEIGHT = 80;
const START_HOUR = 8;

const timeToPixels = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return ((hours - START_HOUR) + minutes / 60) * HOUR_HEIGHT;
};

// Hàm phân loại màu sắc tự động dựa trên vai trò (Role)
const getRoleColor = (role) => {
  const r = role?.toLowerCase() || '';
  if (r.includes('bác sĩ') || r.includes('doctor')) return 'bg-blue';
  if (r.includes('lễ tân') || r.includes('receptionist')) return 'bg-orange';
  return 'bg-slate';
};

export function ScheduleShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null); // Modal state

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hoursOfDay = Array.from({ length: 15 }, (_, i) => i + START_HOUR);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // 1. Fetch dữ liệu lịch từ Backend
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/shifts', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Map dữ liệu và thêm màu sắc dựa trên role
        const formattedShifts = res.data.map(shift => ({
          ...shift,
          color: getRoleColor(shift.role)
        }));
        setShifts(formattedShifts);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu lịch:", err);
      }
    };
    fetchShifts();
  }, [currentWeek]);

  return (
    <div className="schedule-wrapper">
      {/* BẢNG LỊCH CHÍNH */}
      <div className="main-calendar">
        <div className="calendar-header">
          <div className="calendar-title">
            <Icon name="calendar" size={20} /> Lịch làm việc
          </div>
          <button className="btn-add-shift">
            <Icon name="plus" size={16} /> Thêm ca trực
          </button>
        </div>

        <div className="calendar-body-scroll">
          <div className="calendar-grid-min-width">
            {/* Header Ngày */}
            <div className="days-header">
              <div className="time-col-header">
                <Icon name="clock" size={16} /> Giờ VN
              </div>
              {weekDays.map((day, idx) => (
                <div key={idx} className="day-col-header">
                  <div className="day-date">{format(day, 'dd/MM/yyyy')}</div>
                  <div className="day-name">{format(day, 'EEEE', { locale: vi })}</div>
                </div>
              ))}
            </div>

            {/* Lưới Giờ */}
            <div className="time-grid-container">
              <div className="time-labels-col">
                {hoursOfDay.map((hour) => (
                  <div key={hour} className="time-label">{hour}:00</div>
                ))}
              </div>

              <div className="shifts-area">
                <div className="bg-lines">
                  {hoursOfDay.map((hour) => <div key={hour} className="bg-line"></div>)}
                </div>

                {weekDays.map((day, dayIdx) => (
                  <div key={dayIdx} className="day-column">
                    {shifts.filter(s => isSameDay(new Date(s.date), day)).map((shift) => (
                      <div
                        key={shift._id}
                        className={`shift-card ${shift.color}`}
                        style={{ top: `${timeToPixels(shift.startTime)}px`, height: `${timeToPixels(shift.endTime) - timeToPixels(shift.startTime)}px` }}
                        onClick={() => setSelectedShift(shift)}
                      >
                        <div className="shift-card-header">
                          <div className="shift-card-title">{shift.role} - {shift.room}</div>
                          <div>{shift.startTime} - {shift.endTime}</div>
                        </div>
                        <div className="shift-card-body">
                          <div>
                            <div className="shift-staff-name">{shift.staffId?.name}</div>
                            <div className="shift-room">Tại: {shift.room}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR MINI LỊCH */}
      <div className="mini-calendar-sidebar">
        <div className="mini-calendar-box">
          <div className="mini-cal-header">
            <h3>Tháng {format(currentMonth, 'M-yyyy')}</h3>
            <div className="mini-cal-nav">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><Icon name="chevron-left" size={16} /></button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><Icon name="chevron-right" size={16} /></button>
            </div>
          </div>
          <div className="mini-cal-body">
            <div className="mini-cal-weekdays">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="mini-cal-days">
              {monthDays.map((day, idx) => (
                <div key={idx} className="mini-cal-day-wrap">
                  <button
                    onClick={() => setCurrentWeek(day)}
                    className={`mini-cal-btn ${!isSameMonth(day, currentMonth) ? 'not-current-month' : ''} ${isToday(day) ? 'is-today' : ''}`}
                  >
                    {format(day, 'd')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedShift && (
        <div className="shift-modal-overlay" onClick={() => setSelectedShift(null)}>
          <div className="shift-modal-content" onClick={e => e.stopPropagation()}>
            <div className={`shift-modal-header ${selectedShift.color}`}>
              <h2>Thông tin ca làm việc</h2>
              <button className="btn-close-modal" onClick={() => setSelectedShift(null)}>&times;</button>
            </div>
            <div className="shift-modal-body">
              {/* Nội dung thông tin chi tiết */}
              {['Nhân viên: staffId.name', 'Ngày trực: date', 'Thời gian: startTime - endTime', 'Vai trò: role', 'Phòng: room'].map((item, i) => (
                <div key={i} className="shift-modal-row">
                  <div className="shift-modal-label">{item.split(':')[0]}:</div>
                  <div className="shift-modal-value">{item.split(':')[1]}</div>
                </div>
              ))}
              <button className="btn-add-shift" style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>Sửa thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}