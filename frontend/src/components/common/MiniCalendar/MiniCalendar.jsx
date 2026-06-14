import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import './MiniCalendar.css';

export const MiniCalendar = ({ selectedDate, onDateClick }) => {
    const monthStart = startOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
        <div className="mini-calendar">
            <div className="mini-header">
                <h3>{format(selectedDate, "MMMM yyyy", { locale: vi })}</h3>
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