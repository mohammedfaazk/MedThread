'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface RescheduleModalProps {
  appointment: {
    id: string;
    startTime: Date;
    endTime: Date;
    patientName?: string;
    doctorName?: string;
    reason?: string;
  };
  availableSlots: Array<{ startTime: Date; endTime: Date }>;
  onReschedule: (appointmentId: string, newStartTime: Date, newEndTime: Date) => Promise<void>;
  onClose: () => void;
}

export default function RescheduleModal({
  appointment,
  availableSlots,
  onReschedule,
  onClose
}: RescheduleModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: Date; endTime: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onReschedule(appointment.id, selectedSlot.startTime, selectedSlot.endTime);
      onClose();
    } catch (err) {
      setError('Failed to reschedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Appointment Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Current Appointment</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Date:</span> {format(new Date(appointment.startTime), 'MMMM d, yyyy')}</p>
            <p><span className="font-medium">Time:</span> {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}</p>
            {appointment.patientName && <p><span className="font-medium">Patient:</span> {appointment.patientName}</p>}
            {appointment.doctorName && <p><span className="font-medium">Doctor:</span> {appointment.doctorName}</p>}
            {appointment.reason && <p><span className="font-medium">Reason:</span> {appointment.reason}</p>}
          </div>
        </div>

        {/* Available Slots */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select New Time Slot</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No available slots found.</p>
              <p className="text-sm mt-2">Please try a different date or contact support.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlot(slot)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition
                    ${selectedSlot === slot
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900">
                    {format(new Date(slot.startTime), 'EEEE, MMMM d')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={loading || !selectedSlot}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
