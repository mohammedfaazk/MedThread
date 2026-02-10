'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
    Calendar,
    Clock,
    MessageSquare,
    Plus,
    Shield,
    ChevronDown
} from 'lucide-react'

interface Appointment {
    id: string;
    patient: { username: string; avatar?: string };
    startTime: string;
    endTime: string;
    status: string;
    reason?: string;
}

interface AvailabilitySlot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorDashboard() {
    const { user, role, loading, isDoctorVerified, isDoctorPending } = useJWTAuth()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [fetching, setFetching] = useState(false)
    
    // Stats state
    const [totalAppointments, setTotalAppointments] = useState(0)
    const [pendingCount, setPendingCount] = useState(0)
    const [messagesCount, setMessagesCount] = useState(0)
    
    // Conversations state
    const [conversations, setConversations] = useState<any[]>([])
    const [loadingChats, setLoadingChats] = useState(false)
    
    // Availability Scheduler State
    const [selectedDay, setSelectedDay] = useState(1) // Monday
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('17:00')
    const [slots, setSlots] = useState<AvailabilitySlot[]>([])
    const [addingSlot, setAddingSlot] = useState(false)

    const effectiveUserId = user?.id;

    useEffect(() => {
        if (!loading && (!user || (role !== 'VERIFIED_DOCTOR' && role !== 'DOCTOR'))) {
            router.push('/')
        }
    }, [user, role, loading, router])

    useEffect(() => {
        if (effectiveUserId && (role === 'VERIFIED_DOCTOR' || role === 'DOCTOR')) {
            if (isDoctorVerified || role === 'VERIFIED_DOCTOR') {
                loadAppointments()
                loadAvailabilitySlots()
                loadMessagesCount()
                loadConversations()
            }
        }
    }, [effectiveUserId, role, isDoctorVerified])

    const loadAppointments = async () => {
        setFetching(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${API_URL}/api/appointments/appointments?userId=${effectiveUserId}&role=doctor`)
            setAppointments(res.data)
            
            // Calculate stats
            setTotalAppointments(res.data.length)
            setPendingCount(res.data.filter((apt: Appointment) => apt.status === 'PENDING').length)
        } catch (error) {
            console.error('Failed to load appointments:', error)
        } finally {
            setFetching(false)
        }
    }

    const loadAvailabilitySlots = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${API_URL}/api/appointments/doctors/${effectiveUserId}/availability`)
            const userSlots = res.data.filter((slot: any) => !slot.id.startsWith('default-'))
            setSlots(userSlots)
        } catch (error) {
            console.error('Failed to load availability slots:', error)
        }
    }

    const loadMessagesCount = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${API_URL}/api/v1/chat/conversations?userId=${effectiveUserId}`)
            if (res.data && Array.isArray(res.data)) {
                const unreadCount = res.data.reduce((total: number, conv: any) => {
                    return total + (conv.unreadCount || 0)
                }, 0)
                setMessagesCount(unreadCount)
            }
        } catch (error) {
            console.error('Failed to load messages count:', error)
            setMessagesCount(0)
        }
    }

    const loadConversations = async () => {
        setLoadingChats(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${API_URL}/api/v1/chat/conversations?userId=${effectiveUserId}`)
            if (res.data && Array.isArray(res.data)) {
                const sortedConvs = res.data
                    .sort((a: any, b: any) => {
                        const aTime = a.messages?.[a.messages.length - 1]?.createdAt || a.updatedAt
                        const bTime = b.messages?.[b.messages.length - 1]?.createdAt || b.updatedAt
                        return new Date(bTime).getTime() - new Date(aTime).getTime()
                    })
                    .slice(0, 5)
                setConversations(sortedConvs)
            }
        } catch (error) {
            console.error('Failed to load conversations:', error)
            setConversations([])
        } finally {
            setLoadingChats(false)
        }
    }

    const handleApproveReject = async (appointmentId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            await axios.put(`${API_URL}/api/appointments/appointments/${appointmentId}`, {
                status,
                doctorId: effectiveUserId
            })
            loadAppointments()
            if (status === 'APPROVED') {
                alert('Appointment approved! You can now chat with the patient.')
            }
        } catch (error) {
            console.error('Failed to update appointment:', error)
            alert('Failed to update appointment. Please try again.')
        }
    }

    const addSlot = async () => {
        if (!startTime || !endTime) {
            alert('Please select both start and end times')
            return
        }
        
        setAddingSlot(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const slot = {
                doctorId: effectiveUserId,
                dayOfWeek: selectedDay,
                startTime: `2024-01-01T${startTime}:00Z`,
                endTime: `2024-01-01T${endTime}:00Z`
            }

            const response = await axios.post(`${API_URL}/api/appointments/availability`, slot)
            setSlots([...slots, response.data])
            alert('Availability added successfully!')
        } catch (error: any) {
            console.error('Failed to add availability:', error)
            alert(`Failed to add availability: ${error.response?.data?.error || error.message}`)
        } finally {
            setAddingSlot(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING')

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#9DD4D3] via-[#C8E3D4] to-[#F5E6D3]">
            <Navbar />

            <div className="max-w-[1440px] mx-auto flex gap-0">
                <Sidebar />

                <main className="flex-1 p-6 overflow-y-auto">

                    {/* Pending Verification Banner */}
                    {isDoctorPending && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Clock className="w-8 h-8 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-yellow-900 mb-2">
                                        Verification Pending
                                    </h3>
                                    <p className="text-yellow-800 mb-3">
                                        Your doctor account is currently under review. You can view your dashboard, but posting and messaging features are disabled until your account is verified by our admin team.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-yellow-700">
                                        <Shield className="w-4 h-4" />
                                        <span>Typically takes 24-48 hours for verification</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    Welcome back, <span className="text-blue-600">{user?.username || user?.email?.split('@')[0]}</span>
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-600 font-medium">
                                        VERIFIED {(user as any)?.specialty?.toUpperCase() || 'DOCTOR'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Badges in Header */}
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-200 text-center w-[110px]">
                                    <div className="text-2xl font-bold text-blue-600 mb-0.5">{totalAppointments}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Appointments</div>
                                </div>
                                <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-200 text-center w-[110px]">
                                    <div className="text-2xl font-bold text-orange-600 mb-0.5">{pendingCount}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Pending</div>
                                </div>
                                <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-200 text-center w-[110px]">
                                    <div className="text-2xl font-bold text-green-600 mb-0.5">{messagesCount}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Messages</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column - Pending Appointments */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[550px] flex flex-col">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-900">Pending Appointments</h2>
                                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                                            {pendingCount}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                                    {fetching ? (
                                        <div className="py-8 text-center">
                                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Loading...</p>
                                        </div>
                                    ) : pendingAppointments.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500">No pending requests</p>
                                        </div>
                                    ) : (
                                        pendingAppointments.map((apt) => (
                                            <div key={apt.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        {apt.patient.avatar ? (
                                                            <img src={apt.patient.avatar} className="w-full h-full object-cover rounded-full" alt={apt.patient.username} />
                                                        ) : (
                                                            <span className="text-blue-600 font-bold text-lg">
                                                                {apt.patient.username.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900">{apt.patient.username}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {apt.patient.username.split(' ')[1] ? `${apt.patient.username.split(' ')[1].toLowerCase()}, ${apt.patient.username.split(' ')[0].toLowerCase()}` : apt.patient.username.toLowerCase()}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">{apt.reason || 'Check-up'}</p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                        Today
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(apt.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleApproveReject(apt.id, 'APPROVED')}
                                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveReject(apt.id, 'REJECTED')}
                                                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {pendingAppointments.length > 0 && (
                                        <button className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-semibold flex items-center justify-center gap-2">
                                            View All
                                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Column - Schedule Availability */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[550px] flex flex-col">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">Schedule Availability</h2>
                                                <p className="text-xs text-gray-500">Set your weekly consultation hours</p>
                                            </div>
                                        </div>
                                        <button className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Plus className="w-5 h-5 text-orange-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                                    <div>
                                        <div className="relative">
                                            <select
                                                value={selectedDay}
                                                onChange={(e) => setSelectedDay(Number(e.target.value))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white font-medium text-gray-900"
                                            >
                                                {DAYS.map((day, idx) => (
                                                    <option key={idx} value={idx}>{day}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                                            />
                                        </div>
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1">
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={addSlot}
                                        disabled={addingSlot}
                                        className="w-full px-6 py-3 bg-[#5CB8B2] text-white rounded-xl hover:bg-[#4DA9A3] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {addingSlot ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                Add Availability Slot
                                            </>
                                        )}
                                    </button>

                                    {/* Display existing slots */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-semibold text-gray-400 uppercase">Upcoming Slots</h3>
                                            <span className="text-xs text-orange-600 font-semibold">8 hrs</span>
                                        </div>
                                        <div className="space-y-2">
                                            {slots.map((slot, idx) => {
                                                const startTimeStr = typeof slot.startTime === 'string' 
                                                    ? slot.startTime.slice(11, 16) 
                                                    : new Date(slot.startTime).toISOString().slice(11, 16);
                                                const endTimeStr = typeof slot.endTime === 'string' 
                                                    ? slot.endTime.slice(11, 16) 
                                                    : new Date(slot.endTime).toISOString().slice(11, 16);
                                                
                                                return (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="font-semibold text-gray-900 text-sm flex-1">
                                                            {DAYS[slot.dayOfWeek]}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            {startTimeStr} - {endTimeStr}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            {slots.length === 0 && (
                                                <p className="text-gray-400 text-center py-4 text-sm">No slots set yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Recent Chats */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[550px] flex flex-col">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900">Recent Chats</h2>
                                        <button 
                                            onClick={() => router.push('/profile?tab=consultation')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            View all
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3 flex-1 overflow-y-auto">
                                    {loadingChats ? (
                                        <div className="py-8 text-center">
                                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Loading chats...</p>
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500">No conversations yet</p>
                                        </div>
                                    ) : (
                                        conversations.map((conv, index) => {
                                            const patient = conv.participants?.find((p: any) => p.id !== effectiveUserId)
                                            const lastMessage = conv.messages?.[conv.messages.length - 1]
                                            const timeAgo = lastMessage?.createdAt 
                                                ? getTimeAgo(new Date(lastMessage.createdAt))
                                                : 'Recently'
                                            
                                            return (
                                                <div 
                                                    key={conv.id}
                                                    onClick={() => router.push(`/profile?tab=consultation&conversationId=${conv.id}`)}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                                                >
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                                                        {patient?.username?.charAt(0).toUpperCase() || 'P'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                                {patient?.username || 'Patient'}
                                                            </h4>
                                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {lastMessage?.content || 'hello'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}
