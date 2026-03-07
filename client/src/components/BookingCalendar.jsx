import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import api from '../api';
import { Icons } from './Icons';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function BookingCalendar({ onDateSelect, selectedDate, barberId, serviceId, appointmentsData }) {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const date = new Date(year, month, day);
    if (date < today) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };

  const isPast = (day) => {
    const date = new Date(year, month, day);
    return date < today;
  };

  const isToday = (day) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-[#2a2a2a] text-[#a0a0a0] hover:text-white transition-colors">
          <Icons.ChevronLeft size={18} />
        </button>
        <span className="font-display font-semibold text-white">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-[#2a2a2a] text-[#a0a0a0] hover:text-white transition-colors">
          <Icons.ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-[#a0a0a0] py-1 font-semibold">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i}
            onClick={() => day && !isPast(day) && handleDayClick(day)}
            className={`calendar-day text-sm ${!day ? '' : isPast(day) ? 'disabled text-[#444]' : isSelected(day) ? 'selected' : isToday(day) ? 'today text-[#f5b800]' : 'text-white hover:bg-[#2a2a2a] cursor-pointer'}`}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
