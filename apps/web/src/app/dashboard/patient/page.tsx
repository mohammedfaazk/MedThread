'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Plus,
    Calendar,
    Activity,
    MessageSquare,
    Utensils,
    Clock,
    Star,
    CheckCircle2,
    UserRound
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
    const { user, role, loading } = useJWTAuth()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [fetching, setFetching] = useState(false)

    const effectiveUserId = user?.id;

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
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${API_URL}/api/appointments/appointments?userId=${effectiveUserId}&role=patient`)
            setAppointments(res.data)
        } catch (error) {
            console.error('Failed to load appointments:', error)
        } finally {
            setFetching(false)
        }
    }

    const loadDoctors = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            console.log('[Patient Dashboard] Fetching verified doctors from API...')
            
            try {
                const response = await axios.get(`${API_URL}/api/v1/doctor-verification/verified`)
                console.log('[Patient Dashboard] API Response:', response.data)
                
                // API returns { success: true, data: { doctors: [...], pagination: {...} } }
                const doctorsList = response.data?.data?.doctors || response.data?.doctors || []
                console.log(`[Patient Dashboard] Found ${doctorsList.length} verified doctors`)
                
                if (doctorsList.length > 0) {
                    // Sort by totalKarma/reputation_score (same as RightSidebar) and take top 4
                    const sortedDoctors = doctorsList
                        .sort((a: any, b: any) => (b.totalKarma || b.reputation_score || 0) - (a.totalKarma || a.reputation_score || 0))
                        .slice(0, 4)
                    setDoctors(sortedDoctors)
                    return
                }
            } catch (apiError) {
                console.warn('[Patient Dashboard] API fetch failed, falling back to JSON:', apiError)
            }
            
            // Fallback to doctor_data.json
            console.log('[Patient Dashboard] Loading doctors from doctor_data.json')
            const jsonResponse = await fetch('/doctor_data.json');
            if (jsonResponse.ok) {
                const doctorData = await jsonResponse.json();
                // Sort by reputation_score and take top 4
                const sortedDoctors = doctorData
                    .sort((a: any, b: any) => (b.reputation_score || 0) - (a.reputation_score || 0))
                    .slice(0, 4);
                setDoctors(sortedDoctors);
            }
        } catch (error) {
            console.error('[Patient Dashboard] Error loading doctors:', error);
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
        <div className="min-h-screen">
            <Navbar />

            <div className="max-w-[1440px] mx-auto flex gap-0">
                <Sidebar />

                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome back, <span className="text-blue-600">{user.email?.split('@')[0]}</span>
                        </h1>
                        <p className="text-sm text-gray-600 font-medium">Your health dashboard</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Core Tools */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Top Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Diet Planner Card */}
                                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Utensils className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Diet Planner</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[65%]" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500">1,450 / 2,200</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <NutrientInfo label="Protein" value="45g" color="blue" />
                                        <NutrientInfo label="Carbs" value="120g" color="orange" />
                                        <NutrientInfo label="Fats" value="38g" color="purple" />
                                    </div>
                                    <button
                                        onClick={() => router.push('/diet')}
                                        className="w-full py-3 bg-[#00BCD4] text-white rounded-xl font-semibold hover:bg-[#00ACC1] transition shadow-lg"
                                    >
                                        Track Diet
                                    </button>
                                </div>

                                {/* Symptom Checker Card */}
                                <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-semibold uppercase">
                                            AI
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Symptom Checker</h3>
                                    <p className="text-gray-500 text-sm mb-4 flex-1">
                                        Describe symptoms and get AI insights.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {['Headache', 'Fever', 'Fatigue'].map(s => (
                                            <span key={s} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => router.push('/symptom-checker')}
                                        className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                                    >
                                        Analyze Symptoms
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Appointments - Full Width */}
                            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all flex flex-col overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
                                        <p className="text-gray-500 text-xs mt-1">Manage your scheduled consultations</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push('/appointments')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2 text-sm"
                                        >
                                            <Calendar className="w-4 h-4" /> Book
                                        </button>
                                        <button
                                            onClick={() => router.push('/chat')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Chat
                                        </button>
                                    </div>
                                </div>

                                {fetching ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : appointments.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 mb-4">No upcoming appointments</p>
                                        <button
                                            onClick={() => router.push('/doctors')}
                                            className="px-6 py-2 bg-[#00BCD4] text-white rounded-xl font-semibold hover:bg-[#00ACC1] transition shadow-lg"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {appointments.map((apt) => (
                                            <div key={apt.id} className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-100">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {apt.doctor.avatar ? <img src={apt.doctor.avatar} className="w-full h-full object-cover rounded-full" alt={apt.doctor.username} /> : (
                                                        <span className="text-blue-600 font-bold text-lg">
                                                            {apt.doctor.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-gray-900">Dr. {apt.doctor.username}</h4>
                                                        <StatusPill status={apt.status} />
                                                    </div>
                                                    <p className="text-xs text-gray-500">{apt.doctor.specialization || 'Healthcare Professional'}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(apt.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/chat?doctorId=${apt.doctor.user_id || apt.doctor.id}`)
                                                    }}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                                                    title="Start Chat"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Medications & Secondary Tools */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Medication Reminder Card */}
                            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">Medications</h3>
                                <p className="text-gray-500 text-xs mb-6">Daily health routine</p>

                                <div className="space-y-3">
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
                                    className="w-full mt-6 py-3 bg-[#00BCD4] text-white rounded-xl font-semibold hover:bg-[#00ACC1] transition shadow-lg"
                                >
                                    Track Medications
                                </button>
                            </div>

                            {/* Top Doctors section */}
                            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Top Doctors This Week</h3>
                                    <button onClick={() => router.push('/doctors')} className="text-blue-600 text-xs font-semibold hover:underline">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {doctors.length === 0 ? (
                                        <p className="text-xs text-center text-gray-500 py-4">No doctors found</p>
                                    ) : (
                                        doctors.map((doctor, idx) => {
                                            const displayUsername = doctor.username || doctor.id;
                                            const displayName = doctor.full_name || doctor.name || `Dr. ${displayUsername}`;
                                            const reputation = doctor.reputation_score || doctor.reputation || 0;

                                            return (
                                                <div
                                                    key={doctor.id}
                                                    onClick={() => router.push(`/u/${doctor.id}`)}
                                                    className="flex items-center gap-3 py-2 hover:bg-neutral-300/20 rounded-xl px-2 cursor-pointer transition-all"
                                                >
                                                    <span className="text-sm font-bold text-gray-500 w-4">{idx + 1}</span>
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserRound className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate">{displayName}</p>
                                                        <p className="text-xs text-gray-500 truncate">{doctor.specialization || doctor.specialty || 'Verified Doctor'}</p>
                                                    </div>
                                                    <span className="text-xs text-[#FF4500] font-semibold flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-[#FF4500]" />
                                                        {reputation}
                                                    </span>
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

function StatusPill({ status }: { status: string }) {
    const styles: Record<string, string> = {
        APPROVED: 'bg-green-50 text-green-700 border-green-100',
        PENDING: 'bg-orange-50 text-orange-700 border-orange-100',
        UPCOMING: 'bg-blue-50 text-blue-700 border-blue-100',
        COMPLETED: 'bg-gray-50 text-gray-500 border-gray-200',
    }
    const current = styles[status] || styles.PENDING
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border ${current}`}>
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
        <div className={`p-3 rounded-xl flex flex-col items-center text-center ${colors[color]}`}>
            <span className="text-[10px] font-semibold uppercase mb-1">{label}</span>
            <span className="text-xs font-bold">{value}</span>
        </div>
    )
}

function MedicationItem({ name, dosage, time, completed = false, active = false }: any) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${completed ? 'bg-green-100 text-green-600' : active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                {completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold text-gray-900 ${completed ? 'line-through opacity-50' : ''}`}>{name}</h4>
                <p className="text-[10px] text-gray-500">{dosage}</p>
            </div>
            <span className="text-[10px] font-semibold text-gray-600 uppercase">
                {time}
            </span>
        </div>
    )
}
