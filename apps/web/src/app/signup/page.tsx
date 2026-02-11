'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

// Medical specialties list
const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Practice',
  'Geriatrics',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Surgery',
  'Urology',
  'Other'
]

// License issuing authorities
const AUTHORITIES = [
  'Medical Council of India (MCI)',
  'National Medical Commission (NMC)',
  'State Medical Council',
  'General Medical Council (GMC) - UK',
  'American Medical Association (AMA)',
  'Other'
]

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

import { Stethoscope, UserRound } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Common fields
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Doctor-specific fields
  const [medicalLicenseNumber, setMedicalLicenseNumber] = useState('')
  const [licenseIssuingAuthority, setLicenseIssuingAuthority] = useState('')
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [subSpecialty, setSubSpecialty] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [hospitalAffiliation, setHospitalAffiliation] = useState('')
  const [clinicAddress, setClinicAddress] = useState('')

  // Document uploads (base64)
  const [idProof, setIdProof] = useState('')
  const [medicalDegree, setMedicalDegree] = useState('')
  const [licenseDocument, setLicenseDocument] = useState('')
  
  // File names for display
  const [idProofName, setIdProofName] = useState('')
  const [medicalDegreeName, setMedicalDegreeName] = useState('')
  const [licenseDocumentName, setLicenseDocumentName] = useState('')

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = calculatePasswordStrength(password)
  const getPasswordStrengthLabel = () => {
    if (password.length === 0) return ''
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    return 'Strong'
  }
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
    nameSetter: (value: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      
      nameSetter(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setter(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Username validation
  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username)
  }

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email || !username || !password) {
      setError('Please fill all required fields')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, and underscores')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      console.log('Registering patient with:', { email, username, role: 'PATIENT' })
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        username,
        password,
        role: 'PATIENT'
      })

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token)
        alert('Account created successfully! Welcome to MedThread.')
        router.push('/')
      }
    } catch (err: any) {
      console.error('Patient registration error:', err.response?.data)
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Common validation
    if (!email || !username || !password) {
      setError('Please fill all required fields')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, and underscores')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Doctor-specific validation
    if (!medicalLicenseNumber || !licenseIssuingAuthority || !specialty || !licenseExpiryDate) {
      setError('Please fill all required doctor fields')
      return
    }

    if (!yearsOfExperience || parseInt(yearsOfExperience) < 0) {
      setError('Please enter valid years of experience')
      return
    }

    // Check license expiry date is in future
    const expiryDate = new Date(licenseExpiryDate)
    if (expiryDate < new Date()) {
      setError('License expiry date must be in the future')
      return
    }

    if (!idProof || !medicalDegree || !licenseDocument) {
      setError('Please upload all required documents')
      return
    }

    setLoading(true)

    try {
      console.log('Registering doctor with:', { email, username, role: 'DOCTOR' })
      // Step 1: Register as doctor
      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        username,
        password,
        role: 'DOCTOR'
      })

      if (registerResponse.data.success) {
        const token = registerResponse.data.data.token
        localStorage.setItem('auth_token', token)

        // Step 2: Submit verification request
        try {
          console.log('Submitting verification with:', {
            medicalLicenseNumber,
            licenseIssuingAuthority,
            specialty,
            yearsOfExperience: parseInt(yearsOfExperience)
          })
          
          await axios.post(
            `${API_URL}/api/v1/doctor-verification/submit`,
            {
              medicalLicenseNumber,
              licenseIssuingAuthority,
              licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
              specialty,
              subSpecialty: subSpecialty || undefined,
              yearsOfExperience: parseInt(yearsOfExperience),
              hospitalAffiliation: hospitalAffiliation || undefined,
              clinicAddress: clinicAddress || undefined,
              documents: {
                idProof,
                medicalDegree,
                licenseDocument,
              }
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          alert('Doctor account created successfully! Your verification request has been submitted and is under review. You will be notified once approved.')
          router.push('/login')
        } catch (verifyErr: any) {
          console.error('Verification submission error:', verifyErr.response?.data || verifyErr)
          alert('Account created but verification submission failed. Please submit verification from your profile.')
          router.push('/')
        }
      }
    } catch (err: any) {
      console.error('Doctor registration error:', err.response?.data || err)
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-3xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join the MedThread Community</p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setUserType('patient')
              setError('')
            }}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              userType === 'patient'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">👤</span>
              <span>Patient</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              router.push('/signup/doctor')
            }}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              userType === 'doctor'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Stethoscope className="w-6 h-6" />
              <span>Doctor</span>
            </div>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={userType === 'patient' ? handlePatientSignup : handleDoctorSignup} className="space-y-6">
          {/* Common Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Choose a unique username"
                required
                minLength={3}
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, and underscores only</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{getPasswordStrengthLabel()}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use 8+ characters with uppercase, lowercase, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          {/* Doctor-Specific Fields */}
          {userType === 'doctor' && (
            <div className="space-y-5 border-t-2 border-gray-200 pt-6 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-lg text-blue-900 mb-1 flex items-center gap-2">
                  <span>🏥</span>
                  Doctor Verification Details
                </h3>
                <p className="text-sm text-blue-700">Please provide accurate information for verification</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={medicalLicenseNumber}
                    onChange={(e) => setMedicalLicenseNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter license number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issuing Authority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={licenseIssuingAuthority}
                    onChange={(e) => setLicenseIssuingAuthority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    required
                  >
                    <option value="">Select authority</option>
                    {AUTHORITIES.map((auth) => (
                      <option key={auth} value={auth}>
                        {auth}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    License Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={licenseExpiryDate}
                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                    required
                    min="0"
                    max="70"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical Specialty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    required
                  >
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub-Specialty
                  </label>
                  <input
                    type="text"
                    value={subSpecialty}
                    onChange={(e) => setSubSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hospital Affiliation
                </label>
                <input
                  type="text"
                  value={hospitalAffiliation}
                  onChange={(e) => setHospitalAffiliation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Hospital or clinic name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Clinic Address
                </label>
                <textarea
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Full clinic address (optional)"
                />
              </div>

              <div className="border-t-2 border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📄</span>
                  Upload Required Documents
                </h4>
                <p className="text-sm text-gray-600 mb-4">All documents must be clear and readable (PDF, JPG, PNG - Max 5MB each)</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ID Proof (Passport/Driver's License) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, setIdProof, setIdProofName)}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                        required
                      />
                    </div>
                    {idProof && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <span>✓</span> {idProofName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical Degree Certificate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, setMedicalDegree, setMedicalDegreeName)}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                        required
                      />
                    </div>
                    {medicalDegree && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <span>✓</span> {medicalDegreeName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical License Document <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, setLicenseDocument, setLicenseDocumentName)}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                        required
                      />
                    </div>
                    {licenseDocument && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <span>✓</span> {licenseDocumentName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg mt-8"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              `Create ${userType === 'patient' ? 'Patient' : 'Doctor'} Account`
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {userType === 'doctor' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">📋 Note:</span> Doctor accounts require verification. You'll be able to access the platform after admin approval.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
