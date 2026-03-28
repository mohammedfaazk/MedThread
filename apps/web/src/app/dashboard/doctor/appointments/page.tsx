'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/imageUrl'
import IridescenceLayout from '@/components/IridescenceLayout'
import PageLoader from '@/components/PageLoader'
import {
    Calendar,
    Clock,
    MessageSquare,
    User,
    CheckCircle2,
    XCircle,
    Filter,
    Search,
    ArrowLeft
} from 'lucide-react'

interface Appointment {
    id: string;
    patient: { 
        id: string;
        username: string; 
        email: string;
        avatar?: string;
    };
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    reason?: string;
    conversation?: {
        id: string;
        messages: any[];
    };
}

const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    APPROVED: 'bg-green-100 text-green-700 border-green-300',
    REJECTED: 'bg-red-100 text-red-700 border-red-300',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-300',
    CANCELLED: 'bg-gray-100 text-gray-700 border-gray-300'
};

export default function DoctorAppointmentsPage() {
    const { user, role, loading, isDoctorVerified } = useJWTAuth()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
    const [fetching, setFetching] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    const effectiveUserId = user?.id;

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token')
        return token ? { 'Authorization': `Bearer ${token}` } : {}
    }

    useEffect(() => {
        if (!loading && (!user || (role !== 'VERIFIED_DOCTOR' && role !== 'DOCTOR'))) {
            router.push('/')
        }
    }, [user, role, loading, router])

    useEffect(() => {
        if (effectiveUserId && (role === 'VERIFIED_DOCTOR' || role === 'DOCTOR')) {
            if (isDoctorVerified || role === 'VERIFIED_DOCTOR') {
                loadAppointments()
            }
        }
    }, [effectiveUserId, role, isDoctorVerified])

    useEffect(() => {
        // Filter appointments based on status and search query
        let filtered = appointments;

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(apt => 
                apt.patient.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.reason && apt.reason.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        setFilteredAppointments(filtered);
    }, [appointments, statusFilter, searchQuery]);

    const loadAppointments = async () => {
        setFetching(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${API_URL}/api/appointments/appointments?userId=${effectiveUserId}&role=doctor`)
            
            // Sort appointments by date (newest first)
            const sortedAppointments = res.data.sort((a: Appointment, b: Appointment) => 
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
            
            setAppointments(sortedAppointments)
        } catch (error) {
            console.error('Failed to load appointments:', error)
        } finally {
            setFetching(false)
        }
    }

    const handleApproveReject = async (appointmentId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const token = localStorage.getItem('auth_token')
            
            if (!token) {
                alert('Authentication required. Please log in again.')
                router.push('/login')
                return
            }
            
            await axios.put(`${API_URL}/api/appointments/appointments/${appointmentId}`, {
                status,
                doctorId: effectiveUserId
            }, {
                headers: getAuthHeaders()
            })
            
            loadAppointments()
            
            if (status === 'APPROVED') {
                alert('Appointment approved! You can now chat with the patient.')
            } else {
                alert('Appointment rejected.')
            }
        } catch (error) {
            console.error('Failed to update appointment:', error)
            alert('Failed to update appointment. Please try again.')
        }
    }

    const handleMarkComplete = async (appointmentId: string) => {
        if (!confirm('Mark this appointment as completed?')) {
            return
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const token = localStorage.getItem('auth_token')
            
            if (!token) {
                alert('Authentication required. Please log in again.')
                router.push('/login')
                return
            }
            
            await axios.post(`${API_URL}/api/appointments/appointments/${appointmentId}/complete`, {
                userId: effectiveUserId
            }, {
                headers: getAuthHeaders()
            })
            
            alert('Appointment marked as completed!')
            loadAppointments()
        } catch (error: any) {
            console.error('Failed to complete appointment:', error)
            alert(`Failed to complete appointment: ${error.response?.data?.error || error.message}`)
        }
    }

    const handleChatClick = (appointment: Appointment) => {
        if (appointment.status !== 'APPROVED') {
            alert('Chat is only available for approved appointments.')
            return
        }
        
        if (appointment.conversation) {
            router.push(`/chat?conversation=${appointment.conversation.id}`)
        } else {
            alert('No conversation found for this appointment.')
        }
    }

    const getStatusBadge = (status: string) => {
        return (
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING}`}>
                {status}
            </span>
        );
    }

    if (loading || !user) {
        return <PageLoader message="Loading appointments..." />
    }

    return (
        <IridescenceLayout>
            <NavbarEnhanced />

            <div className="max-w-[1440px] mx-auto flex gap-0">
                <Sidebar />

                <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => router.push('/dashboard/doctor')}
                                className="p-2 hover:bg-neutral-300/20 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
                                <p className="text-slate-500">Manage your patient appointments</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by patient name, email, or reason..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 backdrop-blur-sm transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-12 pr-8 py-3 border border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-white/50 backdrop-blur-sm min-w-[200px] transition-all"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointments List */}
                    <div className="space-y-4">
                        {fetching ? (
                            <div className="bg-white/40 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-lg text-center">
                                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Loading appointments...</p>
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="bg-white/40 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-lg text-center">
                                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No appointments found</p>
                                <p className="text-slate-400 text-sm mt-2">
                                    {statusFilter !== 'ALL' || searchQuery ? 'Try adjusting your filters' : 'You don\'t have any appointments yet'}
                                </p>
                            </div>
                        ) : (
                            filteredAppointments.map((appointment) => (
                                <motion.div
                                    key={appointment.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start gap-6">
                                        {/* Patient Avatar */}
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                                            {appointment.patient.avatar ? (
                                                <img 
                                                    src={getImageUrl(appointment.patient.avatar) || ''} 
                                                    className="w-full h-full object-cover rounded-2xl" 
                                                    alt={appointment.patient.username} 
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-blue-600" />
                                            )}
                                        </div>

                                        {/* Appointment Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                        {appointment.patient.username}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm">{appointment.patient.email}</p>
                                                </div>
                                                {getStatusBadge(appointment.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <Calendar className="w-5 h-5" />
                                                    <span className="text-sm font-medium">
                                                        {new Date(appointment.startTime).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <Clock className="w-5 h-5" />
                                                    <span className="text-sm font-medium">
                                                        {new Date(appointment.startTime).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })} - {new Date(appointment.endTime).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            {appointment.reason && (
                                                <div className="mb-4 p-3 bg-slate-50/50 rounded-xl">
                                                    <p className="text-sm text-slate-600 mb-1 font-medium">Reason:</p>
                                                    <p className="text-sm text-slate-800">{appointment.reason}</p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-3">
                                                {appointment.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveReject(appointment.id, 'APPROVED')}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveReject(appointment.id, 'REJECTED')}
                                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {appointment.status === 'APPROVED' && (
                                                    <>
                                                        {appointment.conversation && (
                                                            <button
                                                                onClick={() => handleChatClick(appointment)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                                Open Chat
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleMarkComplete(appointment.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Mark Complete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Summary Stats */}
                    {!fetching && appointments.length > 0 && (
                        <div className="mt-8 bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-900">{appointments.length}</div>
                                    <div className="text-sm text-slate-500">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {appointments.filter(a => a.status === 'PENDING').length}
                                    </div>
                                    <div className="text-sm text-slate-500">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {appointments.filter(a => a.status === 'APPROVED').length}
                                    </div>
                                    <div className="text-sm text-slate-500">Approved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {appointments.filter(a => a.status === 'COMPLETED').length}
                                    </div>
                                    <div className="text-sm text-slate-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {appointments.filter(a => a.status === 'REJECTED').length}
                                    </div>
                                    <div className="text-sm text-slate-500">Rejected</div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </IridescenceLayout>
    )
}