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
    Star,
    Stethoscope,
    MapPin,
    Award,
    CheckCircle2,
    X,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react'

interface Doctor {
    id: string;
    username: string;
    email: string;
    specialty?: string;
    subSpecialty?: string;
    yearsOfExperience?: number;
    hospitalAffiliation?: string;
    avatar?: string;
    bio?: string;
    totalKarma?: number;
}

interface TimeSlot {
    id: string;
    doctorId: string;
    dayOfWeek: number;
    startTime: string | Date;
    endTime: string | Date;
    isBooked: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AppointmentsPage() {
    const { user, role, loading } = useJWTAuth()
    const router = useRouter()
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [reason, setReason] = useState('')
    const [loadingDoctors, setLoadingDoctors] = useState(false)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [booking, setBooking] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [specialtyFilter, setSpecialtyFilter] = useState('')

    useEffect(() => {
        if (!loading && (!user || role !== 'PATIENT')) {
            router.push('/')
        }
    }, [user, role, loading, router])

    useEffect(() => {
        if (user && role === 'PATIENT') {
            loadVerifiedDoctors()
        }
    }, [user, role])

    const loadVerifiedDoctors = async () => {
        setLoadingDoctors(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const response = await axios.get(`${API_URL}/api/v1/doctor-verification/verified`)
            console.log('[Appointments] API Response:', response.data)
            // API returns { success: true, data: { doctors: [...], pagination: {...} } }
            const doctorsList = response.data?.data?.doctors || response.data?.doctors || []
            console.log('[Appointments] Loaded doctors:', doctorsList.length)
            setDoctors(doctorsList)
        } catch (error) {
            console.error('Failed to load doctors:', error)
            setDoctors([])
        } finally {
            setLoadingDoctors(false)
        }
    }

    const loadDoctorAvailability = async (doctorId: string) => {
        setLoadingSlots(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            console.log('[Appointments] Loading availability for doctor:', doctorId)
            const response = await axios.get(`${API_URL}/api/appointments/doctors/${doctorId}/availability`)
            console.log('[Appointments] Availability response:', response.data?.length || 0, 'slots')
            setAvailableSlots(response.data || [])
        } catch (error) {
            console.error('Failed to load availability:', error)
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleDoctorSelect = (doctor: Doctor) => {
        setSelectedDoctor(doctor)
        setSelectedSlot(null)
        setReason('')
        loadDoctorAvailability(doctor.id)
    }

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedSlot || !user) {
            alert('Please select a doctor and time slot')
            return
        }

        setBooking(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            await axios.post(`${API_URL}/api/appointments/book`, {
                patientId: user.id,
                doctorId: selectedDoctor.id,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                reason: reason || 'General consultation'
            })

            alert('Appointment request sent successfully! The doctor will review and approve it.')
            setSelectedDoctor(null)
            setSelectedSlot(null)
            setReason('')
            router.push('/dashboard/patient')
        } catch (error: any) {
            console.error('Failed to book appointment:', error)
            alert(`Failed to book appointment: ${error.response?.data?.error || error.message}`)
        } finally {
            setBooking(false)
        }
    }

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter
        return matchesSearch && matchesSpecialty
    })

    const specialties = Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean)))

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

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <div className="max-w-[1440px] mx-auto flex gap-0">
                <Sidebar />

                <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Book an Appointment</h1>
                        <p className="text-slate-500">Choose from our verified medical professionals</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Doctor List */}
                        <div className="lg:col-span-2">
                            {/* Search and Filter */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search doctors by name or specialty..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <select
                                            value={specialtyFilter}
                                            onChange={(e) => setSpecialtyFilter(e.target.value)}
                                            className="pl-12 pr-8 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[200px]"
                                        >
                                            <option value="">All Specialties</option>
                                            {specialties.map(specialty => (
                                                <option key={specialty} value={specialty}>{specialty}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Doctors List */}
                            <div className="space-y-4">
                                {loadingDoctors ? (
                                    <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-slate-500">Loading doctors...</p>
                                    </div>
                                ) : filteredDoctors.length === 0 ? (
                                    <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                                        <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No doctors found</p>
                                        <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filters</p>
                                    </div>
                                ) : (
                                    filteredDoctors.map((doctor) => (
                                        <motion.div
                                            key={doctor.id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => handleDoctorSelect(doctor)}
                                            className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                                                ? 'border-blue-500 shadow-lg shadow-blue-100'
                                                : 'border-slate-100 hover:border-blue-200 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-start gap-6">
                                                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                                                    {doctor.avatar ? (
                                                        <img src={doctor.avatar} className="w-full h-full object-cover rounded-2xl" alt={doctor.username} />
                                                    ) : (
                                                        '👨‍⚕️'
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-900">Dr. {doctor.username}</h3>
                                                            <p className="text-blue-600 font-semibold text-sm">{doctor.specialty || 'General Physician'}</p>
                                                            {doctor.subSpecialty && (
                                                                <p className="text-slate-500 text-xs">{doctor.subSpecialty}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                                                            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                                                            <span className="text-sm font-bold text-orange-700">{doctor.totalKarma || 0}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 mb-3">
                                                        {doctor.yearsOfExperience && (
                                                            <div className="flex items-center gap-2 text-slate-600">
                                                                <Award className="w-4 h-4" />
                                                                <span className="text-sm font-medium">{doctor.yearsOfExperience} years exp.</span>
                                                            </div>
                                                        )}
                                                        {doctor.hospitalAffiliation && (
                                                            <div className="flex items-center gap-2 text-slate-600">
                                                                <MapPin className="w-4 h-4" />
                                                                <span className="text-sm font-medium">{doctor.hospitalAffiliation}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {doctor.bio && (
                                                        <p className="text-slate-500 text-sm line-clamp-2">{doctor.bio}</p>
                                                    )}

                                                    <div className="mt-4 flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        <span className="text-xs font-semibold text-green-700">Verified Doctor</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right: Booking Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-8">
                                {!selectedDoctor ? (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Select a doctor</p>
                                        <p className="text-slate-400 text-sm mt-2">Choose a doctor to view available time slots</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-slate-900">Book Appointment</h3>
                                            <button
                                                onClick={() => {
                                                    setSelectedDoctor(null)
                                                    setSelectedSlot(null)
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                                            >
                                                <X className="w-5 h-5 text-slate-400" />
                                            </button>
                                        </div>

                                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                                            <p className="text-sm font-semibold text-blue-900">Dr. {selectedDoctor.username}</p>
                                            <p className="text-xs text-blue-700">{selectedDoctor.specialty}</p>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">Available Time Slots</label>
                                            {loadingSlots ? (
                                                <div className="py-8 text-center">
                                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                    <p className="text-xs text-slate-400">Loading slots...</p>
                                                </div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="py-8 text-center">
                                                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500">No slots available</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                    {availableSlots.map((slot) => {
                                                        const startTime = new Date(slot.startTime)
                                                        const endTime = new Date(slot.endTime)
                                                        const isSelected = selectedSlot?.id === slot.id

                                                        return (
                                                            <button
                                                                key={slot.id}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`w-full p-3 rounded-xl border-2 transition-all text-left ${isSelected
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-slate-200 hover:border-blue-300 bg-white'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900">
                                                                            {DAYS[slot.dayOfWeek]}
                                                                        </p>
                                                                        <p className="text-xs text-slate-600">
                                                                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 mt-1">
                                                                            {startTime.toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Visit (Optional)</label>
                                            <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Describe your symptoms or reason for consultation..."
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                rows={4}
                                            />
                                        </div>

                                        <button
                                            onClick={handleBookAppointment}
                                            disabled={!selectedSlot || booking}
                                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {booking ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Booking...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="w-5 h-5" />
                                                    Request Appointment
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs text-slate-500 text-center mt-4">
                                            Your request will be sent to the doctor for approval
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
