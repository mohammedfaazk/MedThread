'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { ChatList } from '@/components/Chat/ChatList'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { useUser } from '@/context/UserContext'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Appointment {
  id: string;
  patient: { username: string; avatar?: string };
  doctor: { username: string; avatar?: string };
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversationId')
  const initialTab = searchParams.get('tab') || 'messages'
  const [activeTab, setActiveTab] = useState(initialTab)
  const { user, role, profileId, loading: userLoading } = useUser()
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const userRole = role;
  const effectiveUserId = profileId || user?.id;

  useEffect(() => {
    if (activeTab === 'appointments' && effectiveUserId) {
      loadAppointments()
    }
  }, [activeTab, effectiveUserId])

  const loadAppointments = async () => {
    try {
      const res = await axios.get(`/api/appointments/appointments?userId=${effectiveUserId}&role=${userRole === 'VERIFIED_DOCTOR' ? 'doctor' : 'patient'}`)
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to load appointments:', error)
    }
  }

  const handleApproveReject = async (appointmentId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.put(`/api/appointments/appointments/${appointmentId}`, {
        status,
        doctorId: effectiveUserId
      })
      loadAppointments()
      alert(`Appointment ${status.toLowerCase()}!`)
    } catch (error) {
      console.error('Failed to update appointment:', error)
    }
  }

  if (userLoading || !user) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 mb-6">
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'messages'
                    ? 'border-b-2 border-cyan-500 text-cyan-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-4 font-medium transition ${
                  activeTab === 'appointments'
                    ? 'border-b-2 border-cyan-500 text-cyan-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Appointments
              </button>
            </div>
          </div>

        {/* Tab Content */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            <div className="md:col-span-1">
              <ChatList
                currentUserId={effectiveUserId}
                autoSelectOtherUserId={searchParams.get('doctor')}
                autoSelectConversationId={conversationIdParam}
                onSelectConversation={setSelectedConversation}
                activeTab="consultation"
                onTabChange={() => {}}
              />
            </div>
            <div className="md:col-span-2">
              {selectedConversation ? (
                <ChatWindow
                  conversationId={selectedConversation.id}
                  currentUserId={effectiveUserId}
                  otherUser={selectedConversation.participants.find((p: any) => p.id !== effectiveUserId)}
                />
              ) : (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg h-full flex items-center justify-center text-gray-500 border border-white/20">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold mb-6">
              {userRole === 'VERIFIED_DOCTOR' ? 'Appointment Requests' : 'My Appointments'}
            </h2>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments yet</p>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {userRole === 'VERIFIED_DOCTOR' ? apt.patient.username : apt.doctor.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(apt.startTime).toLocaleString()} - {new Date(apt.endTime).toLocaleTimeString()}
                        </p>
                        {apt.reason && <p className="text-sm mt-2">{apt.reason}</p>}
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {apt.status}
                        </span>
                      </div>

                      {userRole === 'VERIFIED_DOCTOR' && apt.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveReject(apt.id, 'APPROVED')}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReject(apt.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
