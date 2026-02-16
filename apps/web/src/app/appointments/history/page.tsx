'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Clock, User, FileText, Download, X, RefreshCw } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const role = localStorage.getItem('role')
      
      const response = await axios.get(
        `${API_URL}/api/appointments?userId=${userId}&role=${role}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    const reason = prompt('Please provide a reason for cancellation:')
    if (!reason) return

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      await axios.post(
        `${API_URL}/api/appointments/${appointmentId}/cancel`,
        { userId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      alert('Appointment cancelled successfully')
      fetchAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment')
    }
  }

  const handleReschedule = async (appointmentId: string) => {
    const newDateTime = prompt('Enter new date and time (YYYY-MM-DD HH:MM):')
    if (!newDateTime) return

    const reason = prompt('Reason for rescheduling:')
    if (!reason) return

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const newStartTime = new Date(newDateTime)
      const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000) // +1 hour
      
      await axios.post(
        `${API_URL}/api/appointments/${appointmentId}/reschedule`,
        { userId, newStartTime, newEndTime, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      alert('Appointment rescheduled successfully')
      fetchAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      alert('Failed to reschedule appointment')
    }
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

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter.toUpperCase()
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Appointment History</h1>
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'completed', 'cancelled', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
              <p className="text-gray-600">You don't have any appointments matching this filter.</p>
            </div>
          ) : (
            filteredAppointments.map(apt => (
              <div key={apt.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        ID: {apt.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {localStorage.getItem('role') === 'doctor' ? 'Patient' : 'Doctor'}
                          </p>
                          <p className="font-medium text-gray-900">
                            {localStorage.getItem('role') === 'doctor' 
                              ? apt.patient?.username 
                              : `Dr. ${apt.doctor?.username}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(apt.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium text-gray-900">
                            {Math.round((new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / (1000 * 60))} minutes
                          </p>
                        </div>
                      </div>

                      {apt.doctor?.specialty && (
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Specialty</p>
                            <p className="font-medium text-gray-900">{apt.doctor.specialty}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {apt.reason && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm text-gray-900">{apt.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      View Details
                    </button>
                    
                    {apt.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => handleReschedule(apt.id)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Appointment ID</p>
                    <p className="font-medium text-gray-900">{selectedAppointment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedAppointment.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedAppointment.startTime).toLocaleTimeString()} - {new Date(selectedAppointment.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {selectedAppointment.reason && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Reason for Appointment</p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{selectedAppointment.reason}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  <button
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
