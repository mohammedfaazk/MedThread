'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { AnimatedCard } from '@/components/AnimatedCard'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { WelcomeHeroBanner } from '@/components/WelcomeHeroBanner'
import Iridescence from '@/components/ui/Iridescence'
import { GlassIcon } from '@/components/enhancements/GlassIcon'
import { CountUpNumber } from '@/components/enhancements/CountUpNumber'
import SpotlightCard from '@/components/enhancements/SpotlightCard'
import { HealthTipsWidget } from '@/components/health/HealthTipsWidget'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { getImageUrl } from '@/lib/imageUrl'
import { motion } from 'framer-motion'
import PageLoader from '@/components/PageLoader'
import {
    Plus,
    Calendar,
    Activity,
    MessageSquare,
    Utensils,
    Clock,
    Star,
    TrendingUp,
    CheckCircle2,
    UserRound,
    Pill,
    Search
} from 'lucide-react'

interface Appointment {
    id: string;
    doctor: { id: string; user_id?: string; username: string; avatar?: string; specialization?: string };
    startTime: string;
    endTime: string;
    status: string;
    reason?: string;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: 'once' | 'twice' | 'thrice' | 'four_times';
    times: string[];
    instructions: string;
    ongoing: boolean;
    startDate: string;
    endDate?: string;
}

interface TodayDose {
    medication: Medication;
    time: string;
    taken: boolean;
}

export default function PatientDashboard() {
    const { user, role, loading } = useJWTAuth()
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [fetching, setFetching] = useState(false)
    const [todayMedications, setTodayMedications] = useState<TodayDose[]>([])

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
            loadTodayMedications()
        }
    }, [effectiveUserId, role])

    const loadAppointments = async () => {
        setFetching(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const token = localStorage.getItem('auth_token')
            const res = await axios.get(`${API_URL}/api/appointments/appointments?userId=${effectiveUserId}&role=patient`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('[Patient Dashboard] Loaded appointments:', res.data)
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

    const loadTodayMedications = () => {
        if (!effectiveUserId) return;

        try {
            const stored = localStorage.getItem(`medications_${effectiveUserId}`);
            if (!stored) {
                setTodayMedications([]);
                return;
            }

            const medications: Medication[] = JSON.parse(stored);
            const today = new Date().toISOString().split('T')[0];
            const todayDoses: TodayDose[] = [];

            medications.forEach(med => {
                // Check if medication is active today
                const startDate = new Date(med.startDate);
                const endDate = med.endDate ? new Date(med.endDate) : null;
                const todayDate = new Date(today);

                if (todayDate >= startDate && (!endDate || todayDate <= endDate)) {
                    // Get next 3 upcoming doses
                    const now = new Date();
                    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                    med.times.forEach(time => {
                        const takenKey = `taken_${effectiveUserId}_${med.id}_${today}_${time}`;
                        const taken = !!localStorage.getItem(takenKey);

                        // Only add if not taken or if it's upcoming
                        if (!taken || time >= currentTime) {
                            todayDoses.push({
                                medication: med,
                                time,
                                taken,
                            });
                        }
                    });
                }
            });

            // Sort by time and take first 3
            todayDoses.sort((a, b) => a.time.localeCompare(b.time));
            setTodayMedications(todayDoses.slice(0, 3));
        } catch (error) {
            console.error('Error loading medications:', error);
            setTodayMedications([]);
        }
    }

    if (loading || !user) {
        return <PageLoader message="Preparing your healthy experience..." />
    }

    return (
        <div className="min-h-screen relative">
            <NavbarEnhanced />

            <div className="max-w-[1440px] mx-auto flex gap-0">
                <Sidebar />

                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Premium Welcome Hero Banner */}
                    <WelcomeHeroBanner userName={user.username || user.email?.split('@')[0] || 'User'} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Core Tools */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Top Tools Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Diet Planner Card */}
                                <AnimatedCard delay={0.1}>
                                <SpotlightCard className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <GlassIcon icon={Utensils} color="green" label="Diet" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Diet Planner</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[65%]" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500">
                                            <CountUpNumber value={1450} duration={1500} /> / 2,200
                                        </span>
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
                                </SpotlightCard>
                                </AnimatedCard>

                                {/* AI Detective Card */}
                                <AnimatedCard delay={0.2}>
                                <SpotlightCard className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <GlassIcon icon={Search} color="orange" label="AI Detective" size={24} />
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-semibold uppercase">
                                            AI
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">AI Detective</h3>
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
                                        onClick={() => router.push('/ai-detective')}
                                        className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition"
                                    >
                                        Analyze Symptoms
                                    </button>
                                </SpotlightCard>
                                </AnimatedCard>

                                {/* Symptom Trends Card */}
                                <AnimatedCard delay={0.25}>
                                <SpotlightCard className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <GlassIcon icon={TrendingUp} color="red" label="Trends" size={24} />
                                        <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded text-[10px] font-semibold uppercase">
                                            Regional
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Symptom Trends</h3>
                                    <p className="text-gray-500 text-sm mb-4 flex-1">
                                        See what symptoms are trending in your area, city, state, and across India.
                                    </p>
                                    <button
                                        onClick={() => router.push('/trends')}
                                        className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition"
                                    >
                                        View Trends
                                    </button>
                                </SpotlightCard>
                                </AnimatedCard>
                            </div>

                            {/* Upcoming Appointments - Full Width */}
                            <AnimatedCard delay={0.3}>
                            <SpotlightCard className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all flex flex-col overflow-hidden"
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
                                                    {apt.doctor.avatar ? <img src={getImageUrl(apt.doctor.avatar) || ''} className="w-full h-full object-cover rounded-full" alt={apt.doctor.username} /> : (
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
                                                        router.push('/chat')
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
                            </SpotlightCard>
                            </AnimatedCard>
                        </div>

                        {/* Right Column: Medications & Secondary Tools */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Health Tips Widget */}
                            <HealthTipsWidget />

                            {/* Medication Reminder Card */}
                            <AnimatedCard delay={0.4}>
                            <SpotlightCard className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <GlassIcon icon={Clock} color="blue" label="Meds" size={24} />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">Medications</h3>
                                <p className="text-gray-500 text-xs mb-6">Daily health routine</p>

                                {todayMedications.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Pill className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">No medications tracked yet</p>
                                        <p className="text-gray-500 text-xs">Start tracking your daily medications</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {todayMedications.map((dose, idx) => (
                                            <div 
                                                key={`${dose.medication.id}-${dose.time}-${idx}`}
                                                className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/30 hover:shadow-md transition"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                                            {dose.medication.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {dose.medication.dosage}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3 h-3 text-gray-500" />
                                                            <span className="text-xs text-gray-600">{dose.time}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                        dose.taken 
                                                            ? 'bg-green-100' 
                                                            : 'bg-orange-100'
                                                    }`}>
                                                        {dose.taken ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Clock className="w-4 h-4 text-orange-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => router.push('/medications')}
                                    className="w-full mt-6 py-3 bg-[#00BCD4] text-white rounded-xl font-semibold hover:bg-[#00ACC1] transition shadow-lg"
                                >
                                    {todayMedications.length === 0 ? 'Track Medications' : 'Manage Medications'}
                                </button>
                            </SpotlightCard>
                            </AnimatedCard>

                            {/* Top Doctors section */}
                            <AnimatedCard delay={0.5}>
                            <SpotlightCard className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all">
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
                            </SpotlightCard>
                            </AnimatedCard>

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
    
    // Extract number from value (e.g., "45g" -> 45)
    const numericValue = parseInt(value.match(/\d+/)?.[0] || '0')
    const unit = value.replace(/\d+/g, '')
    
    return (
        <div className={`p-3 rounded-xl flex flex-col items-center text-center ${colors[color]}`}>
            <span className="text-[10px] font-semibold uppercase mb-1">{label}</span>
            <span className="text-xs font-bold">
                <CountUpNumber value={numericValue} duration={1200} />
                {unit}
            </span>
        </div>
    )
}
