'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Clock, Calendar, CheckCircle2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isBooked: boolean
}

interface TimeSlotPickerProps {
  doctorId: string
  onSlotSelect: (slot: TimeSlot) => void
  selectedSlot?: TimeSlot
}

export default function TimeSlotPicker({ doctorId, onSlotSelect, selectedSlot }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAvailableSlots()
  }, [selectedDate, doctorId])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${API_URL}/api/appointments/doctors/${doctorId}/availability`
      )
      
      // Filter slots for selected date
      const dateSlots = response.data.filter((slot: any) => {
        const slotDate = new Date(slot.startTime)
        return (
          slotDate.getDate() === selectedDate.getDate() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getFullYear() === selectedDate.getFullYear() &&
          !slot.isBooked
        )
      })
      
      setAvailableSlots(dateSlots)
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNext7Days = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const groupSlotsByPeriod = () => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []

    availableSlots.forEach(slot => {
      const hour = new Date(slot.startTime).getHours()
      if (hour < 12) morning.push(slot)
      else if (hour < 17) afternoon.push(slot)
      else evening.push(slot)
    })

    return { morning, afternoon, evening }
  }

  const { morning, afternoon, evening } = groupSlotsByPeriod()

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Date</h3>
        <div className="grid grid-cols-7 gap-2">
          {getNext7Days().map((date, index) => {
            const isSelected = 
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth()
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border-2 transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  isSelected ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-600">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Time</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No available slots for this date</p>
            <p className="text-sm text-gray-500 mt-1">Please select another date</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Morning Slots */}
            {morning.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Morning (Before 12 PM)
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {morning.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect(slot)}
                      className={`p-3 rounded-lg border-2 transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {selectedSlot?.id === slot.id && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span className="font-medium">{formatTime(slot.startTime)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoon.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Afternoon (12 PM - 5 PM)
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {afternoon.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect(slot)}
                      className={`p-3 rounded-lg border-2 transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {selectedSlot?.id === slot.id && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span className="font-medium">{formatTime(slot.startTime)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Evening Slots */}
            {evening.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Evening (After 5 PM)
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {evening.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect(slot)}
                      className={`p-3 rounded-lg border-2 transition ${
                        selectedSlot?.id === slot.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {selectedSlot?.id === slot.id && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span className="font-medium">{formatTime(slot.startTime)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Appointment</h4>
          <div className="flex items-center gap-4 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
