'use client';

import { useState } from 'react';
import { X, CheckCircle, Clock, UserX } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PatientFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  conversationId?: string;
  appointmentId?: string;
  wasClinicVisit?: boolean;
}

export function PatientFeedbackModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  conversationId,
  appointmentId,
  wasClinicVisit = false
}: PatientFeedbackModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFeedback = async (status: 'CURED' | 'NOT_YET' | 'CONSULT_NEW_DOCTOR') => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/enhanced-analytics/patient-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId,
          conversationId,
          appointmentId,
          status,
          wasClinicVisit
        })
      });

      const result = await response.json();
      
      if (result.success) {
        if (status === 'CURED') {
          alert('Thank you for your feedback! We\'re glad you\'re feeling better.');
          onClose();
        } else if (status === 'NOT_YET') {
          alert('We hope you feel better soon. We\'ll check in with you again in 2 days.');
          onClose();
        } else {
          alert('We\'re sorry to hear that. You can browse other doctors on our platform.');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-2">How are you feeling?</h2>
        <p className="text-gray-600 mb-6">
          We'd like to know about your consultation with Dr. {doctorName}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleFeedback('CURED')}
            disabled={submitting}
            className="w-full flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition disabled:opacity-50"
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-green-900">✅ Cured</p>
              <p className="text-sm text-green-700">I'm feeling much better now</p>
            </div>
          </button>

          <button
            onClick={() => handleFeedback('NOT_YET')}
            disabled={submitting}
            className="w-full flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl hover:bg-yellow-100 transition disabled:opacity-50"
          >
            <Clock className="w-6 h-6 text-yellow-600" />
            <div className="text-left">
              <p className="font-semibold text-yellow-900">🔄 Not Yet</p>
              <p className="text-sm text-yellow-700">Still recovering, check back later</p>
            </div>
          </button>

          <button
            onClick={() => handleFeedback('CONSULT_NEW_DOCTOR')}
            disabled={submitting}
            className="w-full flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
          >
            <UserX className="w-6 h-6 text-red-600" />
            <div className="text-left">
              <p className="font-semibold text-red-900">🔀 Consult Another Doctor</p>
              <p className="text-sm text-red-700">I'd like to try a different doctor</p>
            </div>
          </button>
        </div>

        {submitting && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
