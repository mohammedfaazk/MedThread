'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    CheckCircle2,
    Clock,
    MessageSquare,
    MoreHorizontal,
    MoreVertical,
    Plus,
    Search,
    Star,
    TrendingUp,
    User,
    Users,
    Activity,
    Brain,
    AlertCircle,
    ChevronRight,
    Filter,
    ArrowUpRight,
    Zap,
    Shield
} from 'lucide-react'

interface Appointment {
    id: string;
    patient: { username: string; avatar?: string };
    startTime: string;
    endTime: string;
    status: string;
    reason?: string;
}

export default function DoctorDashboard() {
    const { user, role, profileId, loading } = useUser()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [fetching, setFetching] = useState(false)
    const [isVerified, setIsVerified] = useState(true) // Mocking verification status

    const effectiveUserId = profileId || user?.id;

    useEffect(() => {
        if (!loading && (!user || role !== 'VERIFIED_DOCTOR')) {
            router.push('/')
        }
    }, [user, role, loading, router])

    useEffect(() => {
        if (effectiveUserId && role === 'VERIFIED_DOCTOR') {
            loadAppointments()
        }
    }, [effectiveUserId, role])

    const loadAppointments = async () => {
        setFetching(true)
        try {
            const res = await axios.get(`/api/appointments/appointments?userId=${effectiveUserId}&role=doctor`)
            setAppointments(res.data)
        } catch (error) {
            console.error('Failed to load appointments:', error)
        } finally {
            setFetching(false)
        }
    }

    const handleApproveReject = async (appointmentId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await axios.put(`/api/appointments/appointments/${appointmentId}`, {
                status,
                doctorId: effectiveUserId
            })
            loadAppointments()
        } catch (error) {
            console.error('Failed to update appointment:', error)
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium tracking-wide">Securing your medical portal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <div className="max-w-[1440px] mx-auto flex gap-0">
                <Sidebar />

                <main className="flex-1 p-8 lg:p-12 overflow-y-auto">

                    {/* Doctor Overview Header */}
                    <div className="mb-10 flex flex-col md:flex-row items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" /> Verified Practitioner
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-tight">Cardiology Specialist</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                                Welcome back, <span className="text-blue-600">Dr. {user.email?.split('@')[0]}</span>
                            </h1>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4">
                            <StatsBadge icon={<Calendar className="w-4 h-4" />} count="12" label="Appointments" color="blue" />
                            <StatsBadge icon={<AlertCircle className="w-4 h-4" />} count="04" label="Pending" color="orange" />
                            <StatsBadge icon={<MessageSquare className="w-4 h-4" />} count="18" label="Messages" color="green" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        {/* Left Column (Primary Focus) */}
                        <div className="xl:col-span-8 space-y-8">

                            {/* Pending Appointments Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Pending Requests</h2>
                                        <p className="text-slate-500 text-sm mt-0.5 font-medium tracking-tight">Review and manage upcoming patient consultations</p>
                                    </div>
                                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 transition shadow-sm border border-transparent hover:border-slate-100">
                                        <Filter className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4">
                                    {fetching ? (
                                        <div className="py-20 flex flex-col items-center justify-center opacity-40">
                                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Fetching cases...</p>
                                        </div>
                                    ) : appointments.filter(a => a.status === 'PENDING').length === 0 ? (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                                            <p className="text-slate-500 text-sm">No pending appointment requests at the moment.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 p-2">
                                            {appointments.filter(a => a.status === 'PENDING').map((apt) => (
                                                <motion.div
                                                    key={apt.id}
                                                    whileHover={{ x: 4 }}
                                                    className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col md:flex-row md:items-center gap-6 group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-700 group-hover:text-white transition-all">
                                                            {apt.patient.avatar ? <img src={apt.patient.avatar} className="w-full h-full object-cover rounded-2xl" /> : '👤'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">u/{apt.patient.username}</h3>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                                                    <Clock className="w-3.5 h-3.5" /> {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                                                    <Calendar className="w-3.5 h-3.5" /> {new Date(apt.startTime).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 px-4 border-l border-slate-50 hidden lg:block">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Chief Complaint</span>
                                                        <p className="text-sm text-slate-600 line-clamp-2 italic">
                                                            "{apt.reason || "Patient requested a general check-up regarding their symptoms..."}"
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApproveReject(apt.id, 'APPROVED')}
                                                            className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveReject(apt.id, 'REJECTED')}
                                                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Secondary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Manage Slots Tool */}
                                <ToolCard
                                    icon={<Calendar className="w-6 h-6 text-blue-600" />}
                                    title="Manage Slots"
                                    description="Configure your weekly availability and emergency hours"
                                    cta="Update Slots"
                                    onClick={() => router.push('/profile?tab=appointments')}
                                    bg="blue"
                                />
                                {/* Case Timeline Tool */}
                                <ToolCard
                                    icon={<Brain className="w-6 h-6 text-purple-600" />}
                                    title="Case Timeline"
                                    description="Track active patient progress and medical history"
                                    cta="Review Cases"
                                    onClick={() => { }}
                                    bg="purple"
                                />
                            </div>
                        </div>

                        {/* Right Column (Secondary Info) */}
                        <div className="xl:col-span-4 space-y-8">

                            {/* Chat Preview Panel */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-slate-900">Recent Chats</h2>
                                    <MessageSquare className="w-5 h-5 text-slate-300" />
                                </div>
                                <div className="space-y-6">
                                    <ChatItem
                                        name="Meghamam"
                                        message="Doctor, the pain is subsiding after the medication..."
                                        time="2m ago"
                                        unread={true}
                                        urgent={true}
                                    />
                                    <ChatItem
                                        name="John Doe"
                                        message="Thank you for the advice yesterday."
                                        time="1h ago"
                                    />
                                    <ChatItem
                                        name="Sarah Connor"
                                        message="Can we move the appointment?"
                                        time="3h ago"
                                    />
                                </div>
                                <button
                                    onClick={() => router.push('/profile?tab=consultation')}
                                    className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    Open Consultations <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>

                            {/* Reputation Snapshot */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Reputation Score</span>
                                    </div>
                                    <div className="mb-8">
                                        <div className="text-5xl font-black mb-1">4.92</div>
                                        <p className="text-blue-100 text-sm font-medium">Top 5% of Cardiology Specialists</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs py-2 border-t border-white/10">
                                            <span className="opacity-60">Patient Reviews</span>
                                            <span className="font-bold">128 Total</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs py-2 border-t border-white/10">
                                            <span className="opacity-60">Avg. Response Time</span>
                                            <span className="font-bold">14 Minutes</span>
                                        </div>
                                    </div>
                                    <button className="w-full mt-8 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition group-hover:scale-[1.02]">
                                        View Public Profile
                                    </button>
                                </div>
                                <Activity className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                            </motion.div>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}

function StatsBadge({ icon, count, label, color }: { icon: any, count: string, label: string, color: 'blue' | 'orange' | 'green' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        green: 'bg-green-50 text-green-600 border-green-100'
    }
    return (
        <div className={`px-4 py-2 rounded-2xl border ${colors[color]} flex items-center gap-3 shadow-sm`}>
            {icon}
            <div className="flex flex-col">
                <span className="text-lg font-black leading-none">{count}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>
            </div>
        </div>
    )
}

function ToolCard({ icon, title, description, cta, onClick, bg }: { icon: any, title: string, description: string, cta: string, onClick: () => void, bg: 'blue' | 'purple' }) {
    const bgs = {
        blue: 'hover:bg-blue-50/50 hover:border-blue-100',
        purple: 'hover:bg-purple-50/50 hover:border-purple-100'
    }
    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all cursor-pointer group ${bgs[bg]}`}
        >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                {description}
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:gap-3 transition-all">
                {cta} <ArrowUpRight className="w-4 h-4" />
            </div>
        </motion.div>
    )
}

function ChatItem({ name, message, time, unread = false, urgent = false }: any) {
    return (
        <div className="flex items-center gap-4 cursor-pointer group">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl border border-slate-200 group-hover:border-blue-300 transition-colors">
                👤
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-slate-900 text-sm">{name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{time}</span>
                </div>
                <p className={`text-xs truncate ${unread ? 'font-black text-slate-800' : 'text-slate-500 font-medium'}`}>
                    {message}
                </p>
            </div>
            {unread && (
                <div className={`w-2.5 h-2.5 rounded-full ${urgent ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`} />
            )}
        </div>
    )
}
