"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

interface AvailabilitySlot {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

interface AppointmentCalendarProps {
    doctorId: string;
    patientId: string;
    onBookingComplete?: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
    doctorId,
    patientId,
    onBookingComplete
}) => {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);

    const [existingAppointment, setExistingAppointment] = useState<any>(null);

    useEffect(() => {
        loadAvailability();
        if (patientId) {
            loadExistingAppointment();
        }
    }, [doctorId, patientId]);

    const loadExistingAppointment = async () => {
        try {
            const res = await axios.get(`/api/appointments/appointments?userId=${patientId}&role=patient`);
            const relevant = res.data.find((a: any) => a.doctorId === doctorId && a.status !== 'REJECTED');
            if (relevant) {
                setExistingAppointment(relevant);
            }
        } catch (error) {
            console.error('Failed to load existing appointment:', error);
        }
    }

    const loadAvailability = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/appointments/doctors/${doctorId}/availability`);
            if (res.data && res.data.length > 0) {
                setAvailability(res.data);
            } else {
                generateDummySlots();
            }
        } catch (error) {
            console.error('Failed to load availability, using dummy data:', error);
            generateDummySlots();
        } finally {
            setLoading(false);
        }
    };

    const generateDummySlots = () => {
        const dummySlots: AvailabilitySlot[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayOfWeek = date.getDay();

            // Add 3 slots per day
            for (let hour = 14; hour < 17; hour++) {
                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(date);
                end.setHours(hour + 1, 0, 0, 0);

                dummySlots.push({
                    id: `dummy-${dayOfWeek}-${hour}-${i}`,
                    dayOfWeek,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                    isBooked: false
                });
            }
        }
        setAvailability(dummySlots);
    };

    const bookAppointment = async () => {
        if (!selectedSlot) return;

        try {
            await axios.post('/api/appointments/book', {
                patientId,
                doctorId,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                reason
            });

            alert('Appointment request sent! Waiting for doctor approval.');
            setSelectedSlot(null);
            setReason('');
            onBookingComplete?.();
        } catch (error) {
            console.error('Failed to book appointment:', error);
            alert('Failed to book appointment');
        }
    };

    // Group slots by day
    const slotsByDay = availability.reduce((acc, slot) => {
        if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
        acc[slot.dayOfWeek].push(slot);
        return acc;
    }, {} as Record<number, AvailabilitySlot[]>);

    if (loading) {
        return <div className="p-4">Loading availability...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {existingAppointment && (
                <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${existingAppointment.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                    <div>
                        <p className={`font-bold ${existingAppointment.status === 'APPROVED' ? 'text-green-800' : 'text-yellow-800'}`}>
                            Your appointment status: {existingAppointment.status}
                        </p>
                        <p className="text-sm opacity-80">
                            {new Date(existingAppointment.startTime).toLocaleString()}
                        </p>
                    </div>
                    {existingAppointment.status === 'APPROVED' && (
                        <Link
                            href={`/profile?tab=consultation&doctor=${doctorId}`}
                            className="px-6 py-2 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition shadow-sm animate-pulse"
                        >
                            Go to Consultation
                        </Link>
                    )}
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>

            {availability.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No availability slots available</p>
            ) : (
                <div className="space-y-6">
                    {Object.entries(slotsByDay).map(([day, slots]) => (
                        <div key={day}>
                            <h3 className="font-semibold text-lg mb-3">{DAYS[Number(day)]}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {slots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        disabled={slot.isBooked}
                                        className={`p-3 rounded-lg border-2 transition ${slot.isBooked
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : selectedSlot?.id === slot.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {' - '}
                                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {slot.isBooked && <div className="text-xs mt-1">Booked</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedSlot && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Selected Slot</h3>
                    <p className="mb-4">
                        {DAYS[selectedSlot.dayOfWeek]},{' '}
                        {new Date(selectedSlot.startTime).toLocaleTimeString()} -{' '}
                        {new Date(selectedSlot.endTime).toLocaleTimeString()}
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Reason for Consultation</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly describe your concern..."
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <button
                        onClick={bookAppointment}
                        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                    >
                        Request Appointment
                    </button>
                </div>
            )}
        </div>
    );
};
