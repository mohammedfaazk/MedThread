'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import TimeSlotPicker from '@/components/appointments/TimeSlotPicker'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function DoctorConsultationsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [responseMode, setResponseMode] = useState<'accept' | 'reject' | null>(null)
  const [responseNotes, setResponseNotes] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  useEffect(() => {
    fetchConsultationRequests()
  }, [])

  const fetchConsultationRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      const response = await axios.get(
        `${API_URL}/api/consultation-funnel/doctor/${userId}/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching consultation requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      // Accept consultation and create appointment
      await axios.post(
        `${API_URL}/api/consultation-funnel/${selectedRequest.id}/respond`,
        {
          doctorId: userId,
          status: 'ACCEPTED',
          responseNotes,
          appointmentSlot: selectedSlot
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Create appointment
      await axios.post(
        `${API_URL}/api/appointments/book`,
        {
          patientId: selectedRequest.patientId,
          doctorId: userId,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          reason: selectedRequest.notes,
          status: 'APPROVED'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Consultation accepted and appointment scheduled!')
      setSelectedRequest(null)
      setResponseMode(null)
      fetchConsultationRequests()
    } catch (error) {
      console.error('Error accepting consultation:', error)
      alert('Failed to accept consultation')
    }
  }

  const handleReject = async () => {
    if (!responseNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      await axios.post(
        `${API_URL}/api/consultation-funnel/${selectedRequest.id}/respond`,
        {
          doctorId: userId,
          status: 'REJECTED',
          responseNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Consultation request rejected')
      setSelectedRequest(null)
      setResponseMode(null)
      fetchConsultationRequests()
    } catch (error) {
      console.error('Error rejecting consultation:', error)
      alert('Failed to reject consultation')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'ROUTINE':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Consultation Requests</h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Consultation Requests</h3>
            <p className="text-gray-600">You don't have any pending consultation requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {request.type.replace(/_/g, ' ')}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{request.patient?.username || 'Patient'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      Preferred: {new Date(request.preferredDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Patient Notes:</p>
                    <p className="text-sm text-gray-900">{request.notes}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setResponseMode('accept')
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setResponseMode('reject')
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {selectedRequest && responseMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {responseMode === 'accept' ? 'Accept Consultation' : 'Reject Consultation'}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {responseMode === 'accept' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Appointment Time
                      </label>
                      <TimeSlotPicker
                        doctorId={localStorage.getItem('userId') || ''}
                        onSlotSelect={setSelectedSlot}
                        selectedSlot={selectedSlot}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={responseNotes}
                        onChange={(e) => setResponseNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Any additional information for the patient..."
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection *
                    </label>
                    <textarea
                      value={responseNotes}
                      onChange={(e) => setResponseNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Please provide a reason..."
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedRequest(null)
                      setResponseMode(null)
                      setResponseNotes('')
                      setSelectedSlot(null)
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={responseMode === 'accept' ? handleAccept : handleReject}
                    className={`flex-1 px-6 py-3 text-white rounded-lg transition ${
                      responseMode === 'accept'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {responseMode === 'accept' ? 'Confirm & Schedule' : 'Confirm Rejection'}
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
