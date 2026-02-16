'use client'

import { useState } from 'react'
import axios from 'axios'
import { X, Calendar, Clock, DollarSign, FileText, CheckCircle2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ConsultationModalProps {
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  sourceThreadId?: string
  sourceReplyId?: string
  caseContext?: any
  onClose: () => void
}

export default function ConsultationModal({
  doctorId,
  doctorName,
  doctorSpecialty,
  sourceThreadId,
  sourceReplyId,
  caseContext,
  onClose
}: ConsultationModalProps) {
  const [step, setStep] = useState(1)
  const [consultationType, setConsultationType] = useState<string>('PAID_CONSULTATION')
  const [patientNotes, setPatientNotes] = useState('')
  const [preferredDateTime, setPreferredDateTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Create consultation request
      const consultationResponse = await axios.post(
        `${API_URL}/api/consultation-funnel/request`,
        {
          doctorId,
          sourceThreadId,
          sourceReplyId,
          consultationType,
          patientNotes,
          preferredDateTime: preferredDateTime ? new Date(preferredDateTime) : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // If paid consultation, create payment intent
      if (consultationType !== 'FREE_THREAD_RESPONSE') {
        const feeResponse = await axios.get(
          `${API_URL}/api/payment/consultation-fee/${consultationType}`
        )
        
        const paymentResponse = await axios.post(
          `${API_URL}/api/payment/create-intent`,
          {
            amount: feeResponse.data.fee,
            currency: 'usd',
            consultationId: consultationResponse.data.consultationId,
            consultationType
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        // In production, redirect to Stripe checkout or show payment form
        console.log('Payment intent created:', paymentResponse.data)
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error creating consultation request:', error)
      alert('Failed to create consultation request')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
          <p className="text-gray-600">
            Dr. {doctorName} will review your consultation request and respond soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Consultation</h2>
            <p className="text-sm text-gray-600 mt-1">with Dr. {doctorName} - {doctorSpecialty}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 p-6 border-b border-gray-200">
          <StepIndicator number={1} label="Type" active={step === 1} completed={step > 1} />
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <StepIndicator number={2} label="Details" active={step === 2} completed={step > 2} />
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <StepIndicator number={3} label="Confirm" active={step === 3} completed={false} />
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Select Consultation Type</h3>
              
              <ConsultationTypeCard
                type="PAID_CONSULTATION"
                title="Paid Consultation"
                description="One-on-one video consultation with detailed diagnosis and treatment plan"
                price="$50"
                duration="30 minutes"
                selected={consultationType === 'PAID_CONSULTATION'}
                onSelect={() => setConsultationType('PAID_CONSULTATION')}
              />
              
              <ConsultationTypeCard
                type="FOLLOW_UP"
                title="Follow-up Consultation"
                description="Follow-up on previous consultation or treatment progress"
                price="$30"
                duration="15 minutes"
                selected={consultationType === 'FOLLOW_UP'}
                onSelect={() => setConsultationType('FOLLOW_UP')}
              />
              
              <ConsultationTypeCard
                type="EMERGENCY"
                title="Emergency Consultation"
                description="Urgent medical consultation for immediate concerns"
                price="$100"
                duration="Available now"
                selected={consultationType === 'EMERGENCY'}
                onSelect={() => setConsultationType('EMERGENCY')}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Consultation Details</h3>
              
              {/* Case Context */}
              {caseContext && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Related Thread:</p>
                  <p className="text-sm text-blue-800">{caseContext.threadTitle}</p>
                </div>
              )}
              
              {/* Preferred Date/Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={preferredDateTime}
                  onChange={(e) => setPreferredDateTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Patient Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe your symptoms, concerns, or any specific questions you have..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Consultation Request</h3>
              
              <div className="space-y-3">
                <InfoRow icon={<Calendar />} label="Doctor" value={`Dr. ${doctorName}`} />
                <InfoRow icon={<FileText />} label="Specialty" value={doctorSpecialty} />
                <InfoRow icon={<Clock />} label="Type" value={consultationType.replace(/_/g, ' ')} />
                {preferredDateTime && (
                  <InfoRow 
                    icon={<Calendar />} 
                    label="Preferred Time" 
                    value={new Date(preferredDateTime).toLocaleString()} 
                  />
                )}
                <InfoRow icon={<DollarSign />} label="Estimated Fee" value="$50" />
              </div>
              
              {patientNotes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Notes:</p>
                  <p className="text-sm text-gray-600">{patientNotes}</p>
                </div>
              )}
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The doctor will review your request and respond with available time slots. 
                  Payment will be processed after you confirm the appointment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : step === 3 ? 'Send Request' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ number, label, active, completed }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
        completed ? 'bg-green-600 text-white' :
        active ? 'bg-blue-600 text-white' :
        'bg-gray-200 text-gray-600'
      }`}>
        {completed ? '✓' : number}
      </div>
      <span className="text-xs mt-1 text-gray-600">{label}</span>
    </div>
  )
}

function ConsultationTypeCard({ type, title, description, price, duration, selected, onSelect }: any) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 border-2 rounded-lg text-left transition ${
        selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="text-lg font-bold text-blue-600">{price}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-xs text-gray-500">{duration}</p>
    </button>
  )
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-600">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}
