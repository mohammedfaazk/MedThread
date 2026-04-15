'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, X } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  reason: string
  patient?: { username: string }
  doctor?: { username: string; specialty: string }
}

interface AppointmentCalendarProps {
  userId: string
  role: 'patient' | 'doctor'
  onAppointmentClick?: (appointment: Appointment) => void
}

export default function AppointmentCalendar({ userId, role, onAppointmentClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDayView, setShowDayView] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [userId, role])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('[AppointmentCalendar] Fetching appointments for userId:', userId, 'role:', role)
      console.log('[AppointmentCalendar] Token exists:', !!token)
      
      const response = await axios.get(
        `${API_URL}/api/appointments/appointments?userId=${userId}&role=${role}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('[AppointmentCalendar] Received appointments:', response.data.length)
      console.log('[AppointmentCalendar] Appointments:', response.data)
      setAppointments(response.data)
    } catch (error) {
      console.error('[AppointmentCalendar] Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return []
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime)
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setShowDayView(true)
  }

  const closeDayView = () => {
    setShowDayView(false)
    setSelectedDate(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Today
            </button>
            <button
              onClick={previousMonth}
              className="p-1.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date)
            const isToday = date && 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                onClick={() => date && handleDayClick(date)}
                className={`min-h-[70px] p-1.5 border rounded-lg transition-all ${
                  date ? 'bg-white hover:bg-blue-50 cursor-pointer hover:shadow-md' : 'bg-gray-50'
                } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              >
                {date && (
                  <>
                    <div className={`text-xs font-semibold mb-0.5 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppointments.slice(0, 2).map(apt => (
                        <div
                          key={apt.id}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] border ${getStatusColor(apt.status)}`}
                        >
                          <div className="font-medium truncate">
                            {new Date(apt.startTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="truncate">
                            {role === 'doctor' ? apt.patient?.username : apt.doctor?.username}
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-[10px] text-blue-600 font-medium text-center">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day View Modal */}
      {showDayView && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {getAppointmentsForDate(selectedDate).length} appointment(s)
                  </p>
                </div>
                <button
                  onClick={closeDayView}
                  className="p-2 hover:bg-white/50 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No appointments scheduled</p>
                  <p className="text-gray-400 text-sm mt-2">This day is free</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate)
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => {
                          onAppointmentClick?.(apt)
                          closeDayView()
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(apt.status)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">
                              {new Date(apt.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                              {' - '}
                              {new Date(apt.endTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className="px-2 py-1 text-xs font-bold rounded uppercase">
                            {apt.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {role === 'doctor' 
                              ? `Patient: ${apt.patient?.username || 'Unknown'}`
                              : `Dr. ${apt.doctor?.username || 'Unknown'}`
                            }
                          </span>
                        </div>

                        {apt.doctor?.specialty && role === 'patient' && (
                          <div className="text-sm text-gray-600 mb-2">
                            Specialty: {apt.doctor.specialty}
                          </div>
                        )}

                        {apt.reason && (
                          <div className="text-sm text-gray-700 mt-2 pt-2 border-t">
                            <span className="font-medium">Reason:</span> {apt.reason}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDayView}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
            <span className="text-gray-700">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
            <span className="text-gray-700">Rejected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-gray-700">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  )
}
