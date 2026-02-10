"use client";

import React, { useState } from 'react';
import axios from 'axios';

interface AvailabilitySlot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

interface AvailabilitySchedulerProps {
    doctorId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({ doctorId }) => {
    const [selectedDay, setSelectedDay] = useState(1); // Monday
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(false);

    const addSlot = async () => {
        if (!startTime || !endTime) {
            alert('Please select both start and end times');
            return;
        }
        
        setLoading(true);
        try {
            const slot = {
                doctorId,
                dayOfWeek: selectedDay,
                startTime: `2024-01-01T${startTime}:00Z`,
                endTime: `2024-01-01T${endTime}:00Z`
            };

            await axios.post('/api/appointments/availability', slot);
            setSlots([...slots, slot]);
            alert('Availability added successfully!');
        } catch (error) {
            console.error('Failed to add availability:', error);
            alert('Failed to add availability');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Set Your Availability</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Day of Week</label>
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {DAYS.map((day, idx) => (
                            <option key={idx} value={idx}>{day}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Time</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">End Time</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <button
                    onClick={addSlot}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                    Add Availability Slot
                </button>
            </div>

            {/* Display existing slots */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Your Availability</h3>
                <div className="space-y-2">
                    {slots.map((slot, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                            <span>
                                {DAYS[slot.dayOfWeek]}: {slot.startTime.slice(11, 16)} - {slot.endTime.slice(11, 16)}
                            </span>
                        </div>
                    ))}
                    {slots.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No availability slots set yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};
