import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, format, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import apiClient from '../../services/apiClient';
import { ModalWrapper } from '../../components/common/ModalWrapper/ModalWrapper';
import { LeaveRequestFormModal } from '../../components/staff/form/LeaveRequestFormModal';
import { MyLeaveRequestsModal } from '../../components/staff/form/MyLeaveRequestsModal';
import './PersonalSchedulePage.css';

export default function PersonalSchedulePage() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
    const [isMyLeavesOpen, setIsMyLeavesOpen] = useState(false);
    const [selectedDateForLeave, setSelectedDateForLeave] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    useEffect(() => {
        fetchShifts();
    }, [currentWeek]);

    const fetchShifts = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/shifts');
            setShifts(res.data);
        } catch (err) {
            console.error('Lỗi tải lịch cá nhân:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Lấy ca trực trong ngày + giờ cụ thể
    const getShiftForSlot = (day, timeSlot) => {
        return shifts.filter(s => {
            const sDate = new Date(s.date);
            const sDay = format(sDate, 'yyyy-MM-dd');
            const targetDay = format(day, 'yyyy-MM-dd');
            return sDay === targetDay && s.startTime <= timeSlot && s.endTime > timeSlot;
        });
    };

    const handleCellClick = (dayShifts, day) => {
        if (dayShifts.length > 0) {
            setSelectedShift(dayShifts[0]);
            setSelectedDateForLeave(day);
            setIsDetailOpen(true);
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(day) >= today) {
                setSelectedDateForLeave(day);
                setIsLeaveFormOpen(true);
            }
        }
    };

    return (
        <div className="psp-container">
            {/* Header */}
            <div className="psp-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div>
                        <h1 className="psp-title">Lịch làm việc của tôi</h1>
                        <p className="psp-subtitle">
                            Tuần {format(weekStart, 'dd/MM')} – {format(weekEnd, 'dd/MM/yyyy')}
                        </p>
                    </div>
                    <button 
                        className="staff-btn staff-btn--outline"
                        onClick={() => setIsMyLeavesOpen(true)}
                    >
                        Lịch sử xin nghỉ phép
                    </button>
                </div>
                <div className="psp-nav">
                    <button className="psp-nav-btn" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                        ← Tuần trước
                    </button>
                    <button className="psp-nav-btn psp-nav-btn--today" onClick={() => setCurrentWeek(new Date())}>
                        Hôm nay
                    </button>
                    <button className="psp-nav-btn" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                        Tuần sau →
                    </button>
                </div>
            </div>

            {/* Lịch */}
            <div className="psp-card">
                {isLoading ? (
                    <p className="psp-empty">Đang tải lịch làm việc...</p>
                ) : (
                    <div className="psp-grid" style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                        {/* Header row */}
                        <div className="psp-cell psp-cell--header psp-cell--time-label" />
                        {weekDays.map((day, i) => (
                            <div key={i} className={`psp-cell psp-cell--header ${isToday(day) ? 'psp-cell--today' : ''}`}>
                                <span className="psp-day-name">{format(day, 'EEEE', { locale: vi })}</span>
                                <span className="psp-day-date">{format(day, 'dd/MM')}</span>
                            </div>
                        ))}

                        {/* Data rows */}
                        {TIME_SLOTS.map(slot => (
                            <>
                                <div key={`t-${slot}`} className="psp-cell psp-cell--time-label">
                                    {slot}
                                </div>
                                {weekDays.map((day, i) => {
                                    const dayShifts = getShiftForSlot(day, slot);
                                    const hasShift = dayShifts.length > 0;
                                    return (
                                        <div
                                            key={`${slot}-${i}`}
                                            className={`psp-cell ${hasShift ? 'psp-cell--has-shift' : ''} ${isToday(day) ? 'psp-cell--today-col' : ''}`}
                                            onClick={() => handleCellClick(dayShifts, day)}
                                        >
                                            {hasShift && (
                                                <div className="psp-shift-block">
                                                    <span className="psp-shift-time">{dayShifts[0].startTime} – {dayShifts[0].endTime}</span>
                                                    <span className="psp-shift-room">{dayShifts[0].room}</span>
                                                    <span className="psp-shift-role">{dayShifts[0].role}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal chi tiết ca (Luồng 4) */}
            <ModalWrapper
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Chi tiết ca trực"
                footer={
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="customer-btn-cancel" onClick={() => setIsDetailOpen(false)}>Đóng</button>
                        {selectedShift && new Date(selectedShift.date) >= new Date().setHours(0,0,0,0) && (
                            <button 
                                className="staff-btn staff-btn--danger"
                                onClick={() => { setIsDetailOpen(false); setIsLeaveFormOpen(true); }}
                            >
                                Tạo đơn xin nghỉ
                            </button>
                        )}
                    </div>
                }
            >
                {selectedShift && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>PHÒNG KHÁM</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedShift.room}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>VAI TRÒ</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedShift.role}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>NGÀY TRỰC</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{format(new Date(selectedShift.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>KHUNG GIỜ</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedShift.startTime} – {selectedShift.endTime}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>NHÂN SỰ</p>
                            <p style={{ margin: 0, fontWeight: 600 }}>{selectedShift.staffId?.name || 'N/A'}</p>
                        </div>
                    </div>
                )}
            </ModalWrapper>

            {/* Modal Form Xin nghỉ */}
            {isLeaveFormOpen && (
                <LeaveRequestFormModal 
                    isOpen={isLeaveFormOpen}
                    onClose={() => setIsLeaveFormOpen(false)}
                    initialDate={selectedDateForLeave}
                    onSuccess={() => {}}
                />
            )}

            {/* Modal Lịch sử xin nghỉ */}
            {isMyLeavesOpen && (
                <MyLeaveRequestsModal 
                    isOpen={isMyLeavesOpen}
                    onClose={() => setIsMyLeavesOpen(false)}
                />
            )}
        </div>
    );
}