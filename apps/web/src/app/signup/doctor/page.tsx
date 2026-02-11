'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Check, ChevronRight, Upload, Loader2, User, FileText, Mail, Phone, Lock, Briefcase, Building2, Calendar, MapPin, Camera } from 'lucide-react'
import { CameraCapture } from '@/components/CameraCapture'

const specializations = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician",
  "Orthopedic", "Gynecologist", "Psychiatrist", "ENT", "Ophthalmologist",
  "Urologist", "Pulmonologist", "Gastroenterologist", "Endocrinologist", "Nephrologist"
]

export default function DoctorSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Account Details
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    
    // Step 2: Professional Info
    license_number: '',
    license_authority: '',
    license_expiry: '',
    specialization: '',
    sub_specialization: '',
    hospital_name: '',
    hospital_address: '',
    years_experience: 0,
  })

  const [errors, setErrors] = useState<any>({})
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

  // Validation
  const validateStep1 = () => {
    const newErrors: any = {}
    
    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Valid phone number required (min 10 digits)'
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number'
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords don't match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: any = {}
    
    if (!formData.license_number) newErrors.license_number = 'License number required'
    if (!formData.license_authority) newErrors.license_authority = 'License authority required'
    if (!formData.license_expiry) newErrors.license_expiry = 'License expiry date required'
    if (!formData.specialization) newErrors.specialization = 'Specialization required'
    if (!formData.hospital_name) newErrors.hospital_name = 'Hospital name required'
    if (!formData.hospital_address) newErrors.hospital_address = 'Hospital address required'
    if (formData.years_experience < 0) newErrors.years_experience = 'Invalid experience'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: any = {}
    
    if (!profilePhoto) {
      newErrors.profile_photo = 'Please capture your profile photo'
    }
    
    if (!licenseFile) {
      newErrors.license_file = 'Please upload your medical license document'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleStep2Next = () => {
    if (validateStep2()) {
      setStep(3)
    }
  }

  const handleProfilePhotoCapture = (file: File) => {
    setProfilePhoto(file)
    setErrors({ ...errors, profile_photo: undefined })
  }

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ license_file: 'File size must be less than 5MB' })
        return
      }
      setLicenseFile(file)
      setErrors({ ...errors, license_file: undefined })
    }
  }

  const handleFinalSubmit = async () => {
    if (!validateStep3()) return

    setLoading(true)
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Convert profile photo to base64 for storage
      let profilePhotoBase64 = ''
      if (profilePhoto) {
        const reader = new FileReader()
        profilePhotoBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(profilePhoto)
        })
      }

      // Convert license document to base64
      let licenseDocBase64 = ''
      if (licenseFile) {
        const reader = new FileReader()
        licenseDocBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(licenseFile)
        })
      }
      
      // Step 1: Register user account
      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
        email: formData.email,
        username: formData.full_name.toLowerCase().replace(/\s+/g, '_'),
        password: formData.password,
        role: 'DOCTOR'
      })

      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.error || 'Registration failed')
      }

      const { token, user } = registerResponse.data.data

      // Step 2: Submit verification request with professional details
      const verificationPayload = {
        medicalLicenseNumber: formData.license_number,
        licenseIssuingAuthority: formData.license_authority,
        licenseExpiryDate: new Date(formData.license_expiry),
        specialty: formData.specialization,
        subSpecialty: formData.sub_specialization || undefined,
        yearsOfExperience: parseInt(formData.years_experience.toString()),
        hospitalAffiliation: formData.hospital_name,
        clinicAddress: formData.hospital_address,
        documents: {
          idProof: profilePhotoBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          medicalDegree: licenseDocBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          licenseDocument: licenseDocBase64,
          profilePhoto: profilePhotoBase64,
        }
      }

      await axios.post(
        `${API_URL}/api/v1/doctor-verification/submit`,
        verificationPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Step 3: Update user avatar
      if (profilePhotoBase64) {
        try {
          await axios.put(
            `${API_URL}/api/users/${user.id}`,
            { avatar: profilePhotoBase64 },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        } catch (avatarErr) {
          console.error('Avatar update failed:', avatarErr)
          // Continue anyway
        }
      }

      // Save token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
        specialty: formData.specialization,
        subSpecialty: formData.sub_specialization,
        yearsOfExperience: formData.years_experience,
        hospitalAffiliation: formData.hospital_name,
        clinicAddress: formData.hospital_address,
        avatar: profilePhotoBase64,
      }))

      alert('Account created successfully! Your verification request has been submitted. You will be notified once approved.')
      router.push('/login')
      
    } catch (error: any) {
      console.error('Signup error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      alert(error.response?.data?.error || error.response?.data?.message || error.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    setErrors({ ...errors, [field]: undefined })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-[#9DD4D3] via-[#C8E3D4] to-[#F5E6D3] p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel - Progress */}
        <div className="md:w-1/3 bg-blue-600 p-8 text-white hidden md:flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Join MedThread</h2>
            <p className="text-blue-100">The healthcare platform connecting doctors and patients.</p>
          </div>

          <div className="space-y-6">
            <div className={`flex items-center gap-3 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step > 1 ? 'bg-white text-blue-600 border-white' : step === 1 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-medium">Account Details</span>
            </div>

            <div className={`flex items-center gap-3 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step > 2 ? 'bg-white text-blue-600 border-white' : step === 2 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <span className="font-medium">Professional Info</span>
            </div>

            <div className={`flex items-center gap-3 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 3 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                3
              </div>
              <span className="font-medium">Verification</span>
            </div>
          </div>

          <div className="text-xs text-blue-200">© 2026 MedThread Healthcare</div>
        </div>

        {/* Right Panel - Forms */}
        <div className="flex-1 p-8 overflow-y-auto max-h-[90vh]">
          {/* Mobile Progress Indicator */}
          <div className="md:hidden mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Step {step} of 3: {step === 1 ? 'Account Details' : step === 2 ? 'Professional Info' : 'Verification'}
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Doctor Registration</h2>

          {/* Step 1: Account Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. John Doe"
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="doctor@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Min 8 chars"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                      className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm"
                    />
                  </div>
                  {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                </div>
              </div>

              <button
                onClick={handleStep1Next}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center mt-6"
              >
                Next Step <ChevronRight className="w-5 h-5 ml-2" />
              </button>

              <p className="text-center text-sm mt-4">
                Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
              </p>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Medical License Number *</label>
                  <input
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MCI-12345"
                  />
                  {errors.license_number && <p className="text-red-500 text-xs mt-1">{errors.license_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">License Authority *</label>
                  <input
                    value={formData.license_authority}
                    onChange={(e) => handleInputChange('license_authority', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Medical Council of India"
                  />
                  {errors.license_authority && <p className="text-red-500 text-xs mt-1">{errors.license_authority}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">License Expiry Date *</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => handleInputChange('license_expiry', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.license_expiry && <p className="text-red-500 text-xs mt-1">{errors.license_expiry}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization *</label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <select
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sub-Specialization</label>
                  <input
                    value={formData.sub_specialization}
                    onChange={(e) => handleInputChange('sub_specialization', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.years_experience && <p className="text-red-500 text-xs mt-1">{errors.years_experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hospital / Clinic Name *</label>
                <div className="relative">
                  <Building2 className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    value={formData.hospital_name}
                    onChange={(e) => handleInputChange('hospital_name', e.target.value)}
                    className="w-full pl-10 h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apollo Hospital"
                  />
                </div>
                {errors.hospital_name && <p className="text-red-500 text-xs mt-1">{errors.hospital_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hospital Address *</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <textarea
                    value={formData.hospital_address}
                    onChange={(e) => handleInputChange('hospital_address', e.target.value)}
                    className="w-full pl-10 pt-2 pb-2 pr-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Full hospital address"
                  />
                </div>
                {errors.hospital_address && <p className="text-red-500 text-xs mt-1">{errors.hospital_address}</p>}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 text-gray-700 font-medium h-12 rounded-xl hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleStep2Next}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center"
                >
                  Next Step <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">Step 3 of 3 - Almost done!</p>
              </div>
              
              {/* Profile Photo Capture */}
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" /> Profile Photo
                </h3>
                <CameraCapture onCapture={handleProfilePhotoCapture} />
                {errors.profile_photo && <p className="text-red-500 text-xs mt-2">{errors.profile_photo}</p>}
              </div>

              {/* License Document Upload */}
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Medical License Document
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    id="license"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleLicenseUpload}
                  />
                  <label htmlFor="license" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-gray-600 font-medium">Click to upload Medical License</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</span>
                    {licenseFile && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-700 text-sm font-bold flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          {licenseFile.name}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.license_file && <p className="text-red-500 text-xs mt-2">{errors.license_file}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your application will be reviewed by our admin team. You'll be notified via email once your account is verified and approved.
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-gray-100 text-gray-700 font-medium h-12 rounded-xl hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
