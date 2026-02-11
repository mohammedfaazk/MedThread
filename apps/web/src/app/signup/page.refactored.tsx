'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setter(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !username || !password) {
      setError('Please fill all required fields')
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
    setError('')

    try {
      const response = await axios.post('http://localhost:3001/api/v1/auth/register', {
        email,
        username,
        password,
        role: 'PATIENT'
      })

      if (response.data.success) {
        // Store token
        localStorage.setItem('auth_token', response.data.data.token)
        alert('Account created successfully!')
        router.push('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !username || !password) {
      setError('Please fill all required fields')
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

    if (!medicalLicenseNumber || !licenseIssuingAuthority || !specialty) {
      setError('Please fill all doctor-specific fields')
      return
    }

    if (!idProof || !medicalDegree || !licenseDocument) {
      setError('Please upload all required documents')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Step 1: Register as doctor
      const registerResponse = await axios.post('http://localhost:3001/api/v1/auth/register', {
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
          await axios.post(
            'http://localhost:3001/api/v1/doctor-verification/submit',
            {
              medicalLicenseNumber,
              licenseIssuingAuthority,
              licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
              specialty,
              subSpecialty: subSpecialty || undefined,
              yearsOfExperience: parseInt(yearsOfExperience) || 0,
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

          alert('Doctor account created! Your verification request has been submitted. You will be notified once approved.')
          router.push('/login')
        } catch (verifyErr: any) {
          console.error('Verification submission error:', verifyErr)
          alert('Account created but verification submission failed. Please submit verification from your profile.')
          router.push('/')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-gray-600 text-center mb-6">Join MedThread Community</p>

        {/* User Type Selection */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUserType('patient')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              userType === 'patient'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👤 Patient
          </button>
          <button
            onClick={() => setUserType('doctor')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              userType === 'doctor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👨‍⚕️ Doctor
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={userType === 'patient' ? handlePatientSignup : handleDoctorSignup}>
          {/* Common Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Doctor-Specific Fields */}
          {userType === 'doctor' && (
            <div className="space-y-4 mb-6 border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Doctor Verification Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number *</label>
                  <input
                    type="text"
                    value={medicalLicenseNumber}
                    onChange={(e) => setMedicalLicenseNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Authority *</label>
                  <input
                    type="text"
                    value={licenseIssuingAuthority}
                    onChange={(e) => setLicenseIssuingAuthority(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry Date *</label>
                  <input
                    type="date"
                    value={licenseExpiryDate}
                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., Cardiology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Specialty</label>
                  <input
                    type="text"
                    value={subSpecialty}
                    onChange={(e) => setSubSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Affiliation</label>
                <input
                  type="text"
                  value={hospitalAffiliation}
                  onChange={(e) => setHospitalAffiliation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
                <textarea
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Optional"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Upload Documents *</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof (Passport/License) *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, setIdProof)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                      required
                    />
                    {idProof && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Degree Certificate *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, setMedicalDegree)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                      required
                    />
                    {medicalDegree && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Document *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, setLicenseDocument)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                      required
                    />
                    {licenseDocument && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Account...' : `Sign Up as ${userType === 'patient' ? 'Patient' : 'Doctor'}`}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
