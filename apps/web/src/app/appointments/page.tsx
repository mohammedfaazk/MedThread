'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getImageUrl } from '@/lib/imageUrl'
import axios from 'axios'
import { motion } from 'framer-motion'
import IridescenceLayout from '@/components/IridescenceLayout'
import PageLoader from '@/components/PageLoader'
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
    const searchParams = useSearchParams()
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [reason, setReason] = useState('')
    const [loadingDoctors, setLoadingDoctors] = useState(false)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [booking, setBooking] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [specialtyFilter, setSpecialtyFilter] = useState('')
    const [locationFilter, setLocationFilter] = useState('')
    const [showAvailableOnly, setShowAvailableOnly] = useState(false)
    const [doctorAvailability, setDoctorAvailability] = useState<Record<string, boolean>>({})

    // Read specialty from URL params
    useEffect(() => {
        const specialty = searchParams.get('specialty')
        if (specialty) {
            setSpecialtyFilter(specialty)
        }
    }, [searchParams])

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

    // Check availability for all doctors
    useEffect(() => {
        if (doctors.length > 0) {
            checkDoctorsAvailability()
        }
    }, [doctors])

    const checkDoctorsAvailability = async () => {
        const availabilityMap: Record<string, boolean> = {}
        const token = localStorage.getItem('auth_token')
        
        for (const doctor of doctors) {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                const response = await axios.get(`${API_URL}/api/appointments/doctors/${doctor.id}/availability`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const slots = response.data || []
                // Doctor has availability if they have any unbooked slots
                availabilityMap[doctor.id] = slots.some((slot: TimeSlot) => !slot.isBooked)
            } catch (error) {
                console.error(`Failed to check availability for doctor ${doctor.id}:`, error)
                availabilityMap[doctor.id] = false
            }
        }
        
        setDoctorAvailability(availabilityMap)
    }

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

    const loadDoctorAvailability = async (doctorId: string, date: string) => {
        if (!date) return
        
        setLoadingSlots(true)
        setAvailableSlots([])
        setSelectedSlot(null)
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            console.log('[Appointments] Loading availability for doctor:', doctorId, 'on date:', date)
            
            // Get the day of week from the selected date
            const selectedDateObj = new Date(date)
            const dayOfWeek = selectedDateObj.getDay()
            
            const token = localStorage.getItem('auth_token')
            const response = await axios.get(`${API_URL}/api/appointments/doctors/${doctorId}/availability`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('[Appointments] Availability response:', response.data?.length || 0, 'slots')
            
            // Filter slots for the selected day of week
            const slotsForDay = (response.data || []).filter((slot: TimeSlot) => slot.dayOfWeek === dayOfWeek)
            
            // Convert slots to actual date/time for the selected date
            const slotsWithDates = slotsForDay.map((slot: TimeSlot) => {
                const startTime = new Date(slot.startTime)
                const endTime = new Date(slot.endTime)
                
                // Create new dates with the selected date but original times
                const newStartTime = new Date(date)
                newStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)
                
                const newEndTime = new Date(date)
                newEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)
                
                return {
                    ...slot,
                    startTime: newStartTime,
                    endTime: newEndTime
                }
            })
            
            setAvailableSlots(slotsWithDates)
        } catch (error) {
            console.error('Failed to load availability:', error)
            setAvailableSlots([])
        } finally {
            setLoadingSlots(false)
        }
    }

    const handleDateChange = (date: string) => {
        setSelectedDate(date)
        setSelectedSlot(null)
        
        if (selectedDoctor && date) {
            loadDoctorAvailability(selectedDoctor.id, date)
        }
    }

    const handleDoctorSelect = (doctor: Doctor) => {
        setSelectedDoctor(doctor)
        setSelectedDate('')
        setSelectedSlot(null)
        setAvailableSlots([])
        setReason('')
    }

    const handleBookAppointment = async () => {
        if (!selectedDoctor || !selectedSlot || !user) {
            alert('Please select a doctor, date, and time slot')
            return
        }

        setBooking(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const token = localStorage.getItem('auth_token')
            
            // Ensure dates are in ISO string format
            const startTime = selectedSlot.startTime instanceof Date 
                ? selectedSlot.startTime.toISOString() 
                : new Date(selectedSlot.startTime).toISOString();
            const endTime = selectedSlot.endTime instanceof Date 
                ? selectedSlot.endTime.toISOString() 
                : new Date(selectedSlot.endTime).toISOString();
            
            // Ensure reason is at least 10 characters
            const appointmentReason = reason && reason.length >= 10 
                ? reason 
                : 'General consultation - routine checkup';
            
            console.log('[Appointments] Booking with token:', token ? 'Token exists' : 'No token')
            console.log('[Appointments] Booking data:', {
                patientId: user.id,
                doctorId: selectedDoctor.id,
                startTime,
                endTime,
                reason: appointmentReason
            })
            
            const response = await axios.post(`${API_URL}/api/appointments/book`, {
                patientId: user.id,
                doctorId: selectedDoctor.id,
                startTime,
                endTime,
                reason: appointmentReason
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            console.log('[Appointments] Booking successful:', response.data)
            alert('Appointment request sent successfully! The doctor will review and approve it.')
            setSelectedDoctor(null)
            setSelectedDate('')
            setSelectedSlot(null)
            setAvailableSlots([])
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
        
        // Location filter - check city, state, or hospital affiliation
        const matchesLocation = !locationFilter || 
            doctor.hospitalAffiliation?.toLowerCase().includes(locationFilter.toLowerCase())
        
        // Availability filter
        const matchesAvailability = !showAvailableOnly || doctorAvailability[doctor.id] === true
        
        return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability
    })

    const specialties = Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean)))

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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Book an Appointment</h1>
                                <p className="text-black">Choose from our verified medical professionals</p>
                            </div>
                            <button
                                onClick={() => router.push('/appointments/history')}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg"
                            >
                                <Clock className="w-5 h-5" />
                                View History
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Doctor List */}
                        <div className="lg:col-span-2">
                            {/* Search and Filter */}
                            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg mb-6 hover:shadow-xl transition-all">
                                <div className="flex flex-col gap-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search doctors by name or specialty..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-2.5 border border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 backdrop-blur-sm transition-all text-sm"
                                        />
                                    </div>
                                    
                                    {/* Filters Row - Equal Width */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Specialty Filter */}
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <select
                                                value={specialtyFilter}
                                                onChange={(e) => setSpecialtyFilter(e.target.value)}
                                                className="w-full pl-10 pr-8 py-2.5 border border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-white/50 backdrop-blur-sm transition-all text-sm cursor-pointer"
                                            >
                                                <option value="">All Specialties</option>
                                                {specialties.map(specialty => (
                                                    <option key={specialty} value={specialty}>{specialty}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Location Filter */}
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Location or hospital..."
                                                value={locationFilter}
                                                onChange={(e) => setLocationFilter(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 border border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 backdrop-blur-sm transition-all text-sm"
                                            />
                                        </div>
                                        
                                        {/* Availability Toggle */}
                                        <label className="flex items-center gap-1.5 cursor-pointer pl-2 pr-2.5 h-[42px] border border-neutral-400/20 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={showAvailableOnly}
                                                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                                                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                                            />
                                            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                                                Available Only
                                            </span>
                                        </label>
                                    </div>
                                    
                                    {/* Active Filters Display */}
                                    {(specialtyFilter || locationFilter || showAvailableOnly) && (
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-400/20">
                                            <span className="text-xs text-slate-500 font-medium">Active filters:</span>
                                            {specialtyFilter && (
                                                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    {specialtyFilter}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer hover:text-blue-900" 
                                                        onClick={() => setSpecialtyFilter('')}
                                                    />
                                                </span>
                                            )}
                                            {locationFilter && (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    📍 {locationFilter}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer hover:text-green-900" 
                                                        onClick={() => setLocationFilter('')}
                                                    />
                                                </span>
                                            )}
                                            {showAvailableOnly && (
                                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                    ✓ Available
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer hover:text-purple-900" 
                                                        onClick={() => setShowAvailableOnly(false)}
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Doctors List */}
                            <div className="space-y-4">
                                {loadingDoctors ? (
                                    <div className="bg-white/40 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-lg text-center">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-slate-500">Loading doctors...</p>
                                    </div>
                                ) : filteredDoctors.length === 0 ? (
                                    <div className="bg-white/40 backdrop-blur-xl p-12 rounded-2xl border border-white/20 shadow-lg text-center">
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
                                            className={`bg-white/40 backdrop-blur-xl p-6 rounded-2xl border-2 cursor-pointer transition-all shadow-lg hover:shadow-xl ${selectedDoctor?.id === doctor.id
                                                ? 'border-blue-500/60 shadow-blue-200'
                                                : 'border-white/20 hover:border-blue-300/40'
                                                }`}
                                        >
                                            <div className="flex items-start gap-6">
                                                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                                                    {doctor.avatar ? (
                                                        <img src={getImageUrl(doctor.avatar) || ''} className="w-full h-full object-cover rounded-2xl" alt={doctor.username} />
                                                    ) : (
                                                        <Stethoscope className="w-8 h-8 text-blue-600" />
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

                                                    <div className="mt-4 flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            <span className="text-xs font-semibold text-green-700">Verified Doctor</span>
                                                        </div>
                                                        {doctorAvailability[doctor.id] !== undefined && (
                                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                                                doctorAvailability[doctor.id] 
                                                                    ? 'bg-green-50 text-green-700' 
                                                                    : 'bg-gray-50 text-gray-500'
                                                            }`}>
                                                                <Clock className="w-3 h-3" />
                                                                <span className="text-xs font-semibold">
                                                                    {doctorAvailability[doctor.id] ? 'Available' : 'No slots'}
                                                                </span>
                                                            </div>
                                                        )}
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
                            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg sticky top-8 hover:shadow-xl transition-all">
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
                                                className="p-2 hover:bg-neutral-300/20 rounded-lg transition-all"
                                            >
                                                <X className="w-5 h-5 text-slate-400" />
                                            </button>
                                        </div>

                                        <div className="mb-6 p-4 bg-blue-50/50 backdrop-blur-sm rounded-xl border border-blue-200/30">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('[Appointments] Navigating to doctor profile:', selectedDoctor.id);
                                                    router.push(`/u/${selectedDoctor.id}`);
                                                }}
                                                className="text-sm font-semibold text-blue-900 hover:text-blue-700 hover:underline transition-all flex items-center gap-1 group cursor-pointer"
                                            >
                                                Dr. {selectedDoctor.username}
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                            <p className="text-xs text-blue-700 mt-1">{selectedDoctor.specialty}</p>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => handleDateChange(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border-2 border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white/50 backdrop-blur-sm transition-all text-slate-900 font-medium"
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                Select a date to see available time slots
                                            </p>
                                        </div>

                                        {selectedDate && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">Available Time Slots</label>
                                                {loadingSlots ? (
                                                    <div className="py-8 text-center">
                                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                        <p className="text-xs text-slate-400">Loading available slots...</p>
                                                    </div>
                                                ) : availableSlots.length === 0 ? (
                                                    <div className="py-8 text-center bg-gray-50/50 rounded-xl border border-gray-200">
                                                        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-500 font-medium">No slots available</p>
                                                        <p className="text-xs text-slate-400 mt-1">Try selecting a different date</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                                                        {availableSlots.map((slot) => {
                                                            const startTime = new Date(slot.startTime)
                                                            const endTime = new Date(slot.endTime)
                                                            const isSelected = selectedSlot?.id === slot.id

                                                            return (
                                                                <button
                                                                    key={slot.id}
                                                                    onClick={() => setSelectedSlot(slot)}
                                                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                                        ? 'border-blue-500 bg-blue-50/70 backdrop-blur-sm shadow-md'
                                                                        : 'border-neutral-400/20 hover:border-blue-300/50 bg-white/50 backdrop-blur-sm hover:shadow-sm'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                                                <Clock className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-bold text-slate-900">
                                                                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </p>
                                                                                <p className="text-xs text-slate-500 mt-0.5">
                                                                                    {DAYS[startTime.getDay()]}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        {isSelected && (
                                                                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Visit (Optional)</label>
                                            <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Describe your symptoms or reason for consultation..."
                                                className="w-full px-4 py-3 border border-neutral-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none bg-white/50 backdrop-blur-sm transition-all"
                                                rows={4}
                                            />
                                        </div>

                                        <button
                                            onClick={handleBookAppointment}
                                            disabled={!selectedSlot || booking}
                                            className="w-full py-4 bg-[#00BCD4] text-white rounded-xl font-bold hover:bg-[#00ACC1] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
        </IridescenceLayout>
    )
}
