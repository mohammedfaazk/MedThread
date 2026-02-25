'use client'

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, FileText, Pill, ArrowRight, Star } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BookingProps {
  doctorId: string;
  doctorName: string;
  specialty: string;
  avatar?: string;
  rating?: number;
  nextAvailableSlot?: string;
}

export default function PatientJourneyBooking({
  doctorId,
  doctorName,
  specialty,
  avatar,
  rating,
  nextAvailableSlot
}: BookingProps) {
  const [step, setStep] = useState<'booking' | 'questionnaire' | 'confirmation'>('booking');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Booking form
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'video' | 'in-person'>('video');

  // Questionnaire form
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomDuration, setSymptomDuration] = useState('');
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  useEffect(() => {
    // Track discovery
    trackDiscovery();
  }, []);

  const trackDiscovery = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `${API_URL}/api/patient-journey/track-discovery`,
        {
          doctorId,
          source: 'rating_site',
          keyword: specialty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error tracking discovery:', error);
    }
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Create appointment
      const response = await axios.post(
        `${API_URL}/api/appointments`,
        {
          doctorId,
          scheduledAt: `${selectedDate}T${selectedTime}`,
          consultationType,
          reason: 'Initial consultation'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAppointmentId(response.data.data.id);
        setStep('questionnaire');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Submit questionnaire
      await axios.post(
        `${API_URL}/api/patient-journey/questionnaire`,
        {
          appointmentId,
          doctorId,
          chiefComplaint,
          symptoms,
          symptomDuration,
          currentMedications,
          allergies
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Complete questionnaire
      await axios.put(
        `${API_URL}/api/patient-journey/questionnaire/${appointmentId}`,
        {
          answers: {
            chiefComplaint,
            symptoms,
            symptomDuration,
            currentMedications,
            allergies
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStep('confirmation');
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Failed to submit questionnaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${step === 'booking' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 'booking' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {step === 'booking' ? '1' : <CheckCircle className="w-6 h-6" />}
          </div>
          <span className="ml-2 font-semibold">Book Appointment</span>
        </div>

        <div className="w-16 h-1 bg-gray-300 mx-4"></div>

        <div className={`flex items-center ${
          step === 'questionnaire' ? 'text-blue-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 'questionnaire' ? 'bg-blue-600 text-white' : 
            step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step === 'confirmation' ? <CheckCircle className="w-6 h-6" /> : '2'}
          </div>
          <span className="ml-2 font-semibold">Questionnaire</span>
        </div>

        <div className="w-16 h-1 bg-gray-300 mx-4"></div>

        <div className={`flex items-center ${step === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
          <span className="ml-2 font-semibold">Confirmation</span>
        </div>
      </div>

      {/* Doctor Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt={doctorName} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {doctorName[0]}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold">Dr. {doctorName}</h3>
            <p className="text-gray-600">{specialty}</p>
            {rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {nextAvailableSlot && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Next Available</div>
              <div className="font-semibold text-green-600">{nextAvailableSlot}</div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Booking */}
      {step === 'booking' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-6">Book Your Appointment</h2>

          <div className="space-y-6">
            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Consultation Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConsultationType('video')}
                  className={`p-4 border-2 rounded-lg ${
                    consultationType === 'video'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Video Consultation</div>
                  <div className="text-sm text-gray-600">Online via video call</div>
                </button>
                <button
                  onClick={() => setConsultationType('in-person')}
                  className={`p-4 border-2 rounded-lg ${
                    consultationType === 'in-person'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">In-Person</div>
                  <div className="text-sm text-gray-600">Visit clinic</div>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || loading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Booking...' : 'Continue to Questionnaire'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Questionnaire */}
      {step === 'questionnaire' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-6">Pre-Consultation Questionnaire</h2>
          <p className="text-gray-600 mb-6">Help your doctor prepare for your consultation</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Chief Complaint *</label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="What brings you here today?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Symptoms</label>
              <input
                type="text"
                placeholder="e.g., fever, headache, cough"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setSymptoms([...symptoms, e.currentTarget.value]);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {symptoms.map((symptom, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {symptom}
                    <button
                      onClick={() => setSymptoms(symptoms.filter((_, i) => i !== index))}
                      className="ml-2 text-blue-900 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">How long have you had these symptoms?</label>
              <select
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              >
                <option value="">Select duration</option>
                <option value="less_than_24h">Less than 24 hours</option>
                <option value="1_3_days">1-3 days</option>
                <option value="4_7_days">4-7 days</option>
                <option value="1_2_weeks">1-2 weeks</option>
                <option value="more_than_2_weeks">More than 2 weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Current Medications</label>
              <input
                type="text"
                placeholder="Press Enter to add"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setCurrentMedications([...currentMedications, e.currentTarget.value]);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {currentMedications.map((med, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {med}
                    <button
                      onClick={() => setCurrentMedications(currentMedications.filter((_, i) => i !== index))}
                      className="ml-2 text-purple-900 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Allergies</label>
              <input
                type="text"
                placeholder="Press Enter to add"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setAllergies([...allergies, e.currentTarget.value]);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {allergies.map((allergy, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    {allergy}
                    <button
                      onClick={() => setAllergies(allergies.filter((_, i) => i !== index))}
                      className="ml-2 text-red-900 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleQuestionnaireSubmit}
              disabled={!chiefComplaint || loading}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : 'Complete Booking'}
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Your appointment with Dr. {doctorName} has been confirmed.
          </p>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Appointment Reminders</div>
                  <div className="text-sm text-gray-600">You'll receive reminders 24 hours and 1 hour before</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Consultation</div>
                  <div className="text-sm text-gray-600">Join via video call at the scheduled time</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Pill className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Prescription</div>
                  <div className="text-sm text-gray-600">Digital prescription will be sent after consultation</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/appointments'}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View My Appointments
          </button>
        </div>
      )}
    </div>
  );
}
