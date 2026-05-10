'use client';

import React, { useState } from 'react';
import type { WeeklyCalendar, SlotCell } from '@/lib/availabilityService';

interface WeekNavigatorProps {
  weekStart: string;
  onWeekChange: (newWeekStart: string) => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ weekStart, onWeekChange }) => {
  const handlePrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    const newStart = d.toISOString().split('T')[0];
    onWeekChange(newStart);
  };

  const handleNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    const newStart = d.toISOString().split('T')[0];
    onWeekChange(newStart);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const newStart = d.toISOString().split('T')[0];
    onWeekChange(newStart);
  };

  const d = new Date(weekStart);
  const weekEnd = new Date(d);
  weekEnd.setDate(weekEnd.getDate() + 4); // Friday

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex gap-2">
        <button
          onClick={handlePrevWeek}
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-medium text-sm"
        >
          ← Semana anterior
        </button>
        <button
          onClick={handleToday}
          className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors font-medium text-sm text-blue-700"
        >
          Hoy
        </button>
        <button
          onClick={handleNextWeek}
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-medium text-sm"
        >
          Semana siguiente →
        </button>
      </div>
      <div className="text-sm font-medium text-slate-600">
        {formatDate(d)} — {formatDate(weekEnd)}
      </div>
    </div>
  );
};

interface SlotCellComponentProps {
  slot: SlotCell;
  date: string;
  onSelectSlot?: (slotId: string, date: string) => void;
}

const SlotCellComponent: React.FC<SlotCellComponentProps> = ({ slot, date, onSelectSlot }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (slot.status === 'pasada') return 'bg-slate-100 text-slate-500';
    if (slot.status === 'ocupada') return 'bg-red-100 text-red-700';
    return 'bg-green-100 text-green-700';
  };

  const isClickable = slot.status === 'libre';

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (isClickable && onSelectSlot) {
            onSelectSlot(slot.slotId, date);
          } else if (slot.status === 'ocupada') {
            setShowDetails(!showDetails);
          }
        }}
        disabled={!isClickable && slot.status !== 'ocupada'}
        className={`w-full p-3 rounded-lg text-sm font-medium transition-all ${getStatusColor()} ${
          isClickable ? 'hover:opacity-90 cursor-pointer' : slot.status === 'ocupada' ? 'cursor-pointer hover:opacity-90' : ''
        }`}
      >
        <div className="text-xs font-semibold mb-1">{slot.slotName}</div>
        {slot.status === 'ocupada' && (
          <div className="text-xs truncate">
            {slot.professorName || 'Ocupada'}
          </div>
        )}
        {slot.status === 'libre' && (
          <div className="text-xs">Disponible</div>
        )}
        {slot.status === 'pasada' && (
          <div className="text-xs">Pasada</div>
        )}
      </button>

      {/* Popup detail for occupied slot */}
      {showDetails && slot.status === 'ocupada' && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg p-3">
          <p className="text-sm font-semibold text-slate-900">
            {slot.professorName}
          </p>
          <p className="text-xs text-slate-600">{slot.subject}</p>
          <p className="text-xs text-slate-600">{slot.groupName}</p>
          <button
            onClick={() => setShowDetails(false)}
            className="mt-2 w-full px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

interface WeeklyCalendarGridProps {
  calendar: WeeklyCalendar;
  onSelectSlot?: (slotId: string, date: string) => void;
}

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
  calendar,
  onSelectSlot,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 p-2 text-left text-xs font-semibold text-slate-900 w-24">
              Franja
            </th>
            {calendar.days.map((day) => (
              <th
                key={day.date}
                className="border border-slate-200 p-2 text-center text-xs font-semibold text-slate-900"
              >
                <div>{day.dayName}</div>
                <div className="text-slate-500 text-xs">{day.date}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.days[0].slots.map((slot, slotIdx) => (
            <tr key={slotIdx}>
              <td className="border border-slate-200 p-2 text-xs font-semibold text-slate-900 bg-slate-50">
                {slot.slotName}
              </td>
              {calendar.days.map((day) => (
                <td key={`${day.date}-${slotIdx}`} className="border border-slate-200 p-1">
                  <SlotCellComponent
                    slot={day.slots[slotIdx]}
                    date={day.date}
                    onSelectSlot={onSelectSlot}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface WeeklyCalendarAccordionProps {
  calendar: WeeklyCalendar;
  onSelectSlot?: (slotId: string, date: string) => void;
}

export const WeeklyCalendarAccordion: React.FC<WeeklyCalendarAccordionProps> = ({
  calendar,
  onSelectSlot,
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {calendar.days.map((day) => (
        <div key={day.date} className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between font-semibold text-slate-900"
          >
            <span>
              {day.dayName} {day.date}
            </span>
            <span className={`transition-transform ${expandedDay === day.date ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedDay === day.date && (
            <div className="p-4 bg-white space-y-2">
              {day.slots.map((slot, idx) => (
                <SlotCellComponent
                  key={idx}
                  slot={slot}
                  date={day.date}
                  onSelectSlot={onSelectSlot}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendarGrid;
export { WeekNavigator };
