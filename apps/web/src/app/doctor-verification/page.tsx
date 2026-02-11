'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Shield, FileText, Calendar, Building2, MapPin, Phone, Stethoscope } from 'lucide-react'

export default function DoctorVerificationPage() {
    const { user } = useJWTAuth()
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        medicalLicenseNumber: '',
        licenseIssuingAuthority: '',
        licenseExpiryDate: '',
        specialty: '',
        subSpecialty: '',
        yearsOfExperience: 0,
        hospitalAffiliation: '',
        clinicAddress: '',
        phone: '',
        // Document URLs (simplified - in production, you'd upload files)
        idProof: 'pending_upload',
        medicalDegree: 'pending_upload',
        licenseDocument: 'pending_upload',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            
            const payload = {
                medicalLicenseNumber: formData.medicalLicenseNumber,
                licenseIssuingAuthority: formData.licenseIssuingAuthority,
                licenseExpiryDate: new Date(formData.licenseExpiryDate),
                specialty: formData.specialty,
                subSpecialty: formData.subSpecialty || undefined,
                yearsOfExperience: parseInt(formData.yearsOfExperience.toString()),
                hospitalAffiliation: formData.hospitalAffiliation || undefined,
                clinicAddress: formData.clinicAddress || undefined,
                phone: formData.phone || undefined,
                documents: {
                    idProof: formData.idProof,
                    medicalDegree: formData.medicalDegree,
                    licenseDocument: formData.licenseDocument,
                }
            }

            const response = await axios.post(
                `${API_URL}/api/v1/doctor-verification/submit`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            if (response.data.success || response.data.message) {
                alert('Verification request submitted successfully! You will be notified once reviewed.')
                router.push('/dashboard/doctor')
            }
        } catch (error: any) {
            console.error('Verification submission failed:', error)
            alert(error.response?.data?.error || 'Failed to submit verification request')
        } finally {
            setSubmitting(false)
        }
    }

    if (!user || user.role !== 'DOCTOR') {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">Only users with DOCTOR role can access this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Doctor Verification</h1>
                    </div>
                    
                    <p className="text-gray-600 mb-8">
                        Please provide your professional details and credentials for verification. 
                        Once approved by our admin team, you'll be able to consult with patients.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Medical License */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4" />
                                    Medical License Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.medicalLicenseNumber}
                                    onChange={(e) => setFormData({ ...formData, medicalLicenseNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., MCI-12345"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Shield className="w-4 h-4" />
                                    Licensing Authority *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.licenseIssuingAuthority}
                                    onChange={(e) => setFormData({ ...formData, licenseIssuingAuthority: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Medical Council of India"
                                />
                            </div>
                        </div>

                        {/* License Expiry */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4" />
                                License Expiry Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.licenseExpiryDate}
                                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Specialty */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Stethoscope className="w-4 h-4" />
                                    Specialty *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Cardiology, Pediatrics"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Stethoscope className="w-4 h-4" />
                                    Sub-Specialty
                                </label>
                                <input
                                    type="text"
                                    value={formData.subSpecialty}
                                    onChange={(e) => setFormData({ ...formData, subSpecialty: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4" />
                                Years of Experience *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                max="70"
                                value={formData.yearsOfExperience}
                                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Hospital */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Building2 className="w-4 h-4" />
                                Hospital Affiliation
                            </label>
                            <input
                                type="text"
                                value={formData.hospitalAffiliation}
                                onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Hospital name"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        {/* Clinic Address */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <MapPin className="w-4 h-4" />
                                Clinic Address
                            </label>
                            <textarea
                                value={formData.clinicAddress}
                                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Full clinic address"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit for Verification'}
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 text-center">
                            * Required fields. Your information will be reviewed by our admin team.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
