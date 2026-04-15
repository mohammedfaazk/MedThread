'use client';

import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RescheduleModalProps {
  appointmentId: string;
  currentDate: string;
  currentTime: string;
  doctorName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RescheduleModal({
  appointmentId,
  currentDate,
  currentTime,
  doctorName,
  onClose,
  onSuccess
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDate || !newTime) {
      alert('Please select both date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to reschedule');
        return;
      }

      // Combine date and time
      const startTime = new Date(`${newDate}T${newTime}`);
      const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 minutes later

      await axios.put(
        `${API_URL}/api/v1/appointments/${appointmentId}/reschedule`,
        {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Appointment rescheduled successfully! Waiting for doctor approval.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to reschedule:', error);
      alert(error.response?.data?.error || 'Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reschedule Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Appointment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-2">Current Appointment</p>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Doctor:</span> {doctorName}
          </p>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Date:</span> {new Date(currentDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Time:</span> {currentTime}
          </p>
        </div>

        {/* Reschedule Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              New Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              New Time
            </label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need to reschedule?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Note:</span> Your rescheduled appointment will need to be approved by the doctor again.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
