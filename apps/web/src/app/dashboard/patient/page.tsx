'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Calendar,
    Activity,
    MessageSquare,
    Search,
    MoreHorizontal,
    ChevronRight,
    Stethoscope,
    Utensils,
    Clock,
    Star,
    Zap,
    CheckCircle2,
    TrendingUp,
    AlertCircle
} from 'lucide-react'

interface Appointment {
    id: string;
    doctor: { id: string; user_id?: string; username: string; avatar?: string; specialization?: string };
    startTime: string;
    endTime: string;
    status: string;
    reason?: string;
}

export default function PatientDashboard() {
    const { user, role, profileId, loading } = useUser()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [fetching, setFetching] = useState(false)

    const effectiveUserId = profileId || user?.id;

    useEffect(() => {
        if (!loading && (!user || role !== 'PATIENT')) {
            router.push('/')
        }
    }, [user, role, loading, router])

    useEffect(() => {
        if (effectiveUserId && role === 'PATIENT') {
            loadAppointments()
            loadDoctors()
        }
    }, [effectiveUserId, role])

    const loadAppointments = async () => {
        setFetching(true)
        try {
            const res = await axios.get(`/api/appointments/appointments?userId=${effectiveUserId}&role=patient`)
            setAppointments(res.data)
        } catch (error) {
            console.error('Failed to load appointments:', error)
        } finally {
            setFetching(false)
        }
    }

    const loadDoctors = async () => {
        try {
            const response = await fetch('/doctor_data.json');
            if (response.ok) {
                const doctorData = await response.json();
                setDoctors(doctorData.slice(0, 4));
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Preparing your healthy experience...</p>
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
                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 flex items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden"
                    >
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                            Welcome back, <span className="text-blue-600">{user.email?.split('@')[0]}</span> 👋
                        </h1>
                    </motion.div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        {/* Left Column: Core Tools */}
                        <div className="xl:col-span-8 space-y-8">

                            {/* Top Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Diet Planner Card */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                            <Utensils className="w-7 h-7 text-green-600" />
                                        </div>
                                        <button onClick={() => router.push('/diet')} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 group-hover:text-slate-600">
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Diet Planner</h3>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[65%]" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">1,450 / 2,200 kcal</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-8">
                                        <NutrientInfo label="Protein" value="45g" color="blue" />
                                        <NutrientInfo label="Carbs" value="120g" color="orange" />
                                        <NutrientInfo label="Fats" value="38g" color="purple" />
                                    </div>
                                    <button
                                        onClick={() => router.push('/diet')}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Track Diet <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <img
                                        src="https://illustrations.popsy.co/blue/fruit-basket.svg"
                                        alt="Nutrition"
                                        className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-700"
                                    />
                                </motion.div>

                                {/* Symptom Checker Card */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                                            <Activity className="w-7 h-7 text-orange-600" />
                                        </div>
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            AI Assisted
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Symptom Checker</h3>
                                    <p className="text-slate-500 text-sm mb-6 flex-1">
                                        Describe how you're feeling and let our AI provide medical insights.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {['Headache', 'Fever', 'Fatigue'].map(s => (
                                            <span key={s} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer transition">
                                                +{s}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => router.push('/symptom-checker')}
                                        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all"
                                    >
                                        Analyze Symptoms
                                    </button>
                                </motion.div>
                            </div>

                            {/* Upcoming Appointments - Full Width */}
                            <motion.div
                                whileHover={{ scale: 1.005 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">Upcoming Appointments</h3>
                                        <p className="text-slate-500 text-sm mt-1">Manage your scheduled consultations with medical experts</p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/profile?tab=consultation')}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Consultations
                                    </button>
                                </div>

                                {fetching ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="border border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex-1 flex flex-col justify-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-medium mb-6">No upcoming appointments scheduled</p>
                                        <button
                                            onClick={() => router.push('/doctors')}
                                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition mx-auto"
                                        >
                                            Book New Appointment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {appointments.map((apt) => (
                                            <div key={apt.id} className="bg-slate-50/50 p-6 rounded-[1.5rem] flex items-center gap-8 group hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all border border-transparent hover:border-blue-100">
                                                <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                    {apt.doctor.avatar ? <img src={apt.doctor.avatar} className="w-full h-full object-cover rounded-2xl" /> : '👨‍⚕️'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-slate-900 text-lg">Dr. {apt.doctor.username}</h4>
                                                        <StatusPill status={apt.status} />
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-medium">{apt.doctor.specialization || 'Healthcare Professional'}</p>
                                                    <div className="flex items-center gap-6 mt-4">
                                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                            <Clock className="w-4 h-4 text-blue-600" />
                                                            <span className="text-xs font-bold text-slate-700">{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                            <Calendar className="w-4 h-4 text-blue-600" />
                                                            <span className="text-xs font-bold text-slate-700">{new Date(apt.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        {apt.reason && (
                                                            <div className="flex items-center gap-2 text-slate-400 italic">
                                                                <MessageSquare className="w-4 h-4" />
                                                                <p className="text-xs truncate max-w-[200px]">{apt.reason}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/profile?tab=consultation&doctorId=${apt.doctor.user_id || apt.doctor.id}`)
                                                        }}
                                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="Start Chat"
                                                    >
                                                        <MessageSquare className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Right Column: Medications & Secondary Tools */}
                        <div className="xl:col-span-4 space-y-8">

                            {/* Medication Reminder Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Clock className="w-7 h-7 text-white" />
                                    </div>
                                    <button className="text-white/40 hover:text-white transition">
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-bold mb-1 relative z-10">Medications</h3>
                                <p className="text-slate-400 text-sm mb-8 relative z-10 tracking-wide">Daily health routine</p>

                                <div className="space-y-6 relative z-10">
                                    <MedicationItem
                                        name="Atorvastatin"
                                        dosage="10mg • 1 tab"
                                        time="08:00 AM"
                                        completed={true}
                                    />
                                    <MedicationItem
                                        name="Vitamin D3"
                                        dosage="2000 IU • 1 cap"
                                        time="10:00 AM"
                                        active={true}
                                    />
                                    <MedicationItem
                                        name="Metformin"
                                        dosage="500mg • 2 tabs"
                                        time="08:00 PM"
                                    />
                                </div>

                                <button
                                    onClick={() => router.push('/medications')}
                                    className="w-full mt-10 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-lg shadow-white/5"
                                >
                                    Track Medications
                                </button>

                                {/* Decorative glow 1 */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                                {/* Decorative glow 2 */}
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                            </motion.div>

                            {/* Recommended Doctors section (Moved from left column) */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900">Top Rated Doctors</h3>
                                    <button onClick={() => router.push('/doctors')} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1">
                                        View All <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {doctors.slice(0, 4).map((doctor, i) => (
                                        <motion.div
                                            key={doctor.id}
                                            whileHover={{ x: 5 }}
                                            onClick={() => router.push(`/u/${doctor.user_id || doctor.id}`)}
                                            className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-slate-100"
                                        >
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                                                👨‍⚕️
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{doctor.name || doctor.full_name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">{doctor.specialization || 'Specialist'}</p>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />
                                                        <span className="text-[10px] font-bold text-slate-700">{doctor.reputation_score || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/profile?tab=consultation&doctorId=${doctor.user_id || doctor.id}`)
                                                }}
                                                className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"
                                                title="Chat with Doctor"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}

function StatusPill({ status }: { status: string }) {
    const styles: Record<string, string> = {
        APPROVED: 'bg-green-50 text-green-700 border-green-100',
        PENDING: 'bg-orange-50 text-orange-700 border-orange-100',
        UPCOMING: 'bg-blue-50 text-blue-700 border-blue-100',
        COMPLETED: 'bg-slate-50 text-slate-500 border-slate-200',
    }
    const current = styles[status] || styles.PENDING
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${current}`}>
            {status}
        </span>
    )
}

function NutrientInfo({ label, value, color }: { label: string, value: string, color: string }) {
    const colors: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50',
        orange: 'text-orange-600 bg-orange-50',
        purple: 'text-purple-600 bg-purple-50',
    }
    return (
        <div className={`p-4 rounded-2xl flex flex-col items-center text-center ${colors[color]}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">{label}</span>
            <span className="text-sm font-black">{value}</span>
        </div>
    )
}

function MedicationItem({ name, dosage, time, completed = false, active = false }: any) {
    return (
        <div className="flex items-center gap-4 group cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${completed ? 'bg-green-500/20 text-green-400' : active ? 'bg-white text-slate-900 shadow-xl' : 'bg-white/5 text-white/40'
                }`}>
                {completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className={`w-5 h-5 ${active ? 'animate-pulse' : ''}`} />}
            </div>
            <div className="flex-1">
                <h4 className={`text-sm font-bold tracking-wide transition-opacity ${completed ? 'opacity-40' : 'opacity-100'}`}>{name}</h4>
                <p className={`text-[11px] font-medium tracking-wider transition-opacity ${completed ? 'opacity-30' : 'text-slate-400'}`}>{dosage}</p>
            </div>
            <span className={`text-[11px] font-black tracking-widest uppercase transition-opacity ${completed ? 'opacity-20' : active ? 'text-white' : 'text-white/30'}`}>
                {time}
            </span>
        </div>
    )
}

function LeafPattern({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 200" className={`w-96 h-96 ${className}`} fill="currentColor">
            <path d="M40,100 Q40,40 100,40 Q160,40 160,100 Q160,160 100,160 Q40,160 40,100 Z" opacity="0.1" />
            <path d="M70,100 Q70,70 100,70 Q130,70 130,100 Q130,130 100,130 Q70,130 70,100 Z" opacity="0.2" />
        </svg>
    )
}
