'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

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
            alert(`Appointment ${status.toLowerCase()}!`)
        } catch (error) {
            console.error('Failed to update appointment:', error)
        }
    }

    if (loading || !user) return <div className="p-8">Loading...</div>

    return (
        <div className="min-h-screen bg-[#DAE0E6]">
            <Navbar />
            <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
                <Sidebar />
                <main className="flex-1 max-w-[900px]">
                    <div className="bg-white rounded border border-gray-300 p-6 mb-4">
                        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
                        <p className="text-gray-600">Manage your patient requests and schedule</p>
                    </div>

                    <div className="bg-white rounded border border-gray-300 p-6">
                        <h2 className="text-xl font-bold mb-4">Pending Appointments</h2>
                        {fetching ? (
                            <p>Loading...</p>
                        ) : appointments.filter(a => a.status === 'PENDING').length === 0 ? (
                            <p className="text-gray-500">No pending requests</p>
                        ) : (
                            <div className="space-y-4">
                                {appointments.filter(a => a.status === 'PENDING').map((apt) => (
                                    <div key={apt.id} className="border rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold">u/{apt.patient.username}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(apt.startTime).toLocaleString()}
                                            </p>
                                            {apt.reason && <p className="text-sm mt-1">"{apt.reason}"</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveReject(apt.id, 'APPROVED')}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproveReject(apt.id, 'REJECTED')}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
