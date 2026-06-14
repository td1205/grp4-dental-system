import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import './MiniCalendar.css';

export const MiniCalendar = ({ selectedDate, onDateClick }) => {
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    
    useEffect(() => {
        if (selectedDate) {
            setViewDate(selectedDate);
        }
    }, [selectedDate]);

    const monthStart = startOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
        <div className="mini-calendar">
            <div className="mini-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setViewDate(subMonths(viewDate, 1))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 8px', color: '#6b7280' }}>&lt;</button>
                <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{format(viewDate, "MMMM yyyy", { locale: vi })}</h3>
                <button onClick={() => setViewDate(addMonths(viewDate, 1))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 8px', color: '#6b7280' }}>&gt;</button>
            </div>
            <div className="mini-grid">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'Cn'].map(day => <div key={day} className="mini-day-label">{day}</div>)}
                {days.map((day, idx) => (
                    <div
                        key={idx}
                        className={`mini-day ${!isSameMonth(day, monthStart) ? 'dimmed' : ''} 
                                   ${isToday(day) ? 'today' : ''} 
                                   ${isSameDay(day, selectedDate) ? 'selected' : ''}`}
                        onClick={() => onDateClick(day)}
                    >
                        {format(day, 'd')}
                    </div>
                ))}
            </div>
        </div>
    );
};