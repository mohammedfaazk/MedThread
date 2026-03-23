'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface Appointment {
  id: string;
  startTime: Date;
  endTime: Date;
  patientName?: string;
  doctorName?: string;
  status: string;
  reason?: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  selectedDate?: Date;
}

export default function CalendarView({
  appointments,
  onDateSelect,
  onAppointmentClick,
  selectedDate = new Date()
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.startTime), day)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      case 'REJECTED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                min-h-[120px] p-2 border rounded-lg cursor-pointer transition
                ${!isSameMonth(day, currentMonth) ? 'bg-gray-50 opacity-50' : 'bg-white'}
                ${isSelected ? 'ring-2 ring-orange-500' : ''}
                ${isToday ? 'border-orange-500 border-2' : 'border-gray-200'}
                hover:shadow-md
              `}
            >
              <div className={`
                text-sm font-semibold mb-1
                ${isToday ? 'text-orange-600' : 'text-gray-700'}
              `}>
                {format(day, 'd')}
              </div>

              {/* Appointments for this day */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(apt => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                    className={`
                      text-xs p-1 rounded border cursor-pointer
                      ${getStatusColor(apt.status)}
                      hover:shadow-sm transition
                    `}
                  >
                    <div className="font-medium truncate">
                      {format(new Date(apt.startTime), 'HH:mm')}
                    </div>
                    <div className="truncate">
                      {apt.patientName || apt.doctorName || 'Appointment'}
                    </div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
