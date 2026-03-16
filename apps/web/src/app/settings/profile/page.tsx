'use client'

// Profile settings page
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { User, Upload, X } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ProfileSettingsPage() {
  const { user, role } = useJWTAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    specialty: '',
    website: '',
    location: '',
    pincode: ''
  })
  const [healthConditions, setHealthConditions] = useState<Record<string, boolean | null>>({
    diabetes: null,
    heartDisease: null,
    highBloodPressure: null,
    highCholesterol: null,
    kidneyDisease: null,
    thyroid: null,
    foodAllergies: null,
    pregnant: null,
  })
  const [otherConditions, setOtherConditions] = useState('')
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthSaved, setHealthSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState('')

  // Check if user is a doctor
  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR'

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const [profileRes, healthRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/profile/me/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/health-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
        const profileData = profileRes.value.data.data
        setProfile(profileData)
        setFormData({
          username: profileData.username || '',
          bio: profileData.bio || '',
          specialty: profileData.specialty || '',
          website: '',
          location: '',
          pincode: profileData.pincode || ''
        })
        setAvatarPreview(getImageUrl(profileData.avatar))
        setBannerPreview(getImageUrl(profileData.banner))
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.data.success && healthRes.value.data.data) {
        const hp = healthRes.value.data.data
        const conditions = Array.isArray(hp.medicalConditions) ? hp.medicalConditions as string[] : []
        const hasData = conditions.length > 0 || (Array.isArray(hp.foodAllergies) && hp.foodAllergies.length > 0)
        setHealthConditions({
          diabetes: conditions.includes('Diabetes') ? true : hasData ? false : null,
          heartDisease: conditions.includes('Heart Disease') ? true : hasData ? false : null,
          highBloodPressure: conditions.includes('High Blood Pressure') ? true : hasData ? false : null,
          highCholesterol: conditions.includes('High Cholesterol') ? true : hasData ? false : null,
          kidneyDisease: conditions.includes('Kidney Disease') ? true : hasData ? false : null,
          thyroid: conditions.includes('Thyroid Problems') ? true : hasData ? false : null,
          foodAllergies: Array.isArray(hp.foodAllergies) && (hp.foodAllergies as string[]).length > 0 ? true : hasData ? false : null,
          pregnant: conditions.includes('Pregnancy') ? true : hasData ? false : null,
        })
        const known = ['Diabetes', 'Heart Disease', 'High Blood Pressure', 'High Cholesterol', 'Kidney Disease', 'Thyroid Problems', 'Pregnancy']
        const other = conditions.filter((c: string) => !known.includes(c))
        if (other.length > 0) setOtherConditions(other.join(', '))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const saveHealthConditions = async () => {
    setHealthLoading(true)
    setHealthSaved(false)
    const token = localStorage.getItem('auth_token')
    if (!token) return

    const medicalConditions: string[] = []
    if (healthConditions.diabetes) medicalConditions.push('Diabetes')
    if (healthConditions.heartDisease) medicalConditions.push('Heart Disease')
    if (healthConditions.highBloodPressure) medicalConditions.push('High Blood Pressure')
    if (healthConditions.highCholesterol) medicalConditions.push('High Cholesterol')
    if (healthConditions.kidneyDisease) medicalConditions.push('Kidney Disease')
    if (healthConditions.thyroid) medicalConditions.push('Thyroid Problems')
    if (healthConditions.pregnant) medicalConditions.push('Pregnancy')
    if (otherConditions.trim()) medicalConditions.push(otherConditions.trim())

    const foodAllergies = healthConditions.foodAllergies ? ['Food Allergies'] : []

    const riskLevel = (() => {
      if (
        (medicalConditions.includes('Diabetes') && medicalConditions.includes('High Blood Pressure')) ||
        (medicalConditions.includes('Heart Disease') && medicalConditions.includes('High Cholesterol')) ||
        (medicalConditions.includes('Kidney Disease') && medicalConditions.includes('Diabetes'))
      ) return 'HIGH'
      if (medicalConditions.length >= 2) return 'MEDIUM'
      if (medicalConditions.length === 1) return 'LOW'
      return 'NONE'
    })()

    try {
      await axios.put(
        `${API_URL}/api/v1/health-profile`,
        { medicalConditions, foodAllergies, riskLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHealthSaved(true)
      setTimeout(() => setHealthSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save health conditions:', err)
    } finally {
      setHealthLoading(false)
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(null)
      setUsernameMessage('')
      return
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameAvailable(false)
      setUsernameMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores')
      return
    }

    setCheckingUsername(true)
    try {
      const response = await axios.get(`${API_URL}/api/profile/check-username`, {
        params: { username }
      })

      if (response.data.success) {
        setUsernameAvailable(response.data.data.available)
        setUsernameMessage(response.data.data.message)
      }
    } catch (error) {
      console.error('Failed to check username:', error)
      setUsernameAvailable(null)
      setUsernameMessage('Failed to check username availability')
    } finally {
      setCheckingUsername(false)
    }
  }

  useEffect(() => {
    if (formData.username && formData.username !== profile?.username) {
      const debounce = setTimeout(() => {
        checkUsernameAvailability(formData.username)
      }, 500)
      return () => clearTimeout(debounce)
    }
  }, [formData.username])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar must be 2MB or less')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Banner must be 5MB or less')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setBannerPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async () => {
    // Only upload if avatarPreview is a new base64 image (starts with data:image)
    if (!avatarPreview || !avatarPreview.startsWith('data:image')) return

    // Don't upload if it's the same as the existing avatar
    const existingAvatarUrl = getImageUrl(profile?.avatar)
    if (avatarPreview === existingAvatarUrl) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.put(
        `${API_URL}/api/profile/me/avatar`,
        { image: avatarPreview },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        return response.data.data.avatar
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error)
      throw new Error(error.response?.data?.error || 'Failed to upload avatar')
    }
  }

  const uploadBanner = async () => {
    // Only upload if bannerPreview is a new base64 image (starts with data:image)
    if (!bannerPreview || !bannerPreview.startsWith('data:image')) return

    // Don't upload if it's the same as the existing banner
    const existingBannerUrl = getImageUrl(profile?.banner)
    if (bannerPreview === existingBannerUrl) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.put(
        `${API_URL}/api/profile/me/banner`,
        { image: bannerPreview },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        return response.data.data.banner
      }
    } catch (error: any) {
      console.error('Failed to upload banner:', error)
      throw new Error(error.response?.data?.error || 'Failed to upload banner')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to update your profile')
        return
      }

      // Upload images first and get the new URLs
      const [newAvatarUrl, newBannerUrl] = await Promise.all([
        uploadAvatar(),
        uploadBanner()
      ])

      // Update profile
      const profileUpdateData: any = {
        bio: formData.bio,
        pincode: formData.pincode
      }
      
      // Only include username if it changed and is available
      if (formData.username && formData.username !== profile?.username) {
        if (usernameAvailable === false) {
          alert('Please choose an available username')
          return
        }
        profileUpdateData.username = formData.username
      }
      
      // Only include specialty if user is a doctor
      if (isDoctor) {
        profileUpdateData.specialty = formData.specialty
      }

      const response = await axios.put(
        `${API_URL}/api/profile/me/profile`,
        profileUpdateData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        // Update the user object in localStorage and auth context
        const updatedUser = {
          ...user,
          bio: formData.bio,
          username: formData.username || user.username,
          specialty: isDoctor ? formData.specialty : user.specialty,
          avatar: newAvatarUrl || user.avatar,
          banner: newBannerUrl || user.banner,
          pincode: formData.pincode || (user as any).pincode,
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Force a page reload to update all components with new user data
        alert('Profile updated successfully!')
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      alert(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to access settings</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
        <Sidebar />
        
        <main className="flex-1 max-w-[900px]">
          {/* Breadcrumb */}
          <div className="mb-4">
            <button
              onClick={() => router.push('/settings')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Settings
            </button>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="your_username"
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {!checkingUsername && formData.username && formData.username !== profile?.username && usernameAvailable !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameAvailable ? (
                        <span className="text-green-600 text-xl">✓</span>
                      ) : (
                        <span className="text-red-600 text-xl">✗</span>
                      )}
                    </div>
                  )}
                </div>
                {usernameMessage && (
                  <p className={`text-sm mt-1 ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {usernameMessage}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Banner Image
                </label>
                <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl overflow-hidden">
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 cursor-pointer transition">
                    <div className="text-center text-white">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-semibold">Upload Banner</span>
                      <p className="text-xs mt-1">Max 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => setBannerPreview(null)}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer transition">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-600">Max 2MB</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-sm text-gray-600 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Specialty - Only for Doctors */}
              {isDoctor && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Specialty
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Cardiology, General Practice"
                  />
                </div>
              )}

              {/* Pincode */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter your pincode"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Used for area-wise doctor recommendations
                </p>
              </div>

              {/* Health Conditions - Only for Patients */}
              {role === 'PATIENT' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Health Conditions</h2>
                      <p className="text-sm text-gray-500">Used to personalize your diet plans</p>
                    </div>
                    {healthSaved && (
                      <span className="text-sm text-green-600 font-medium">✓ Saved</span>
                    )}
                  </div>

                  {[
                    { key: 'diabetes', label: 'Diabetes', icon: '🩸' },
                    { key: 'heartDisease', label: 'Heart Disease', icon: '❤️' },
                    { key: 'highBloodPressure', label: 'High Blood Pressure', icon: '💉' },
                    { key: 'highCholesterol', label: 'High Cholesterol', icon: '🫀' },
                    { key: 'kidneyDisease', label: 'Kidney Disease', icon: '🫘' },
                    { key: 'thyroid', label: 'Thyroid Problems', icon: '🦋' },
                    { key: 'foodAllergies', label: 'Food Allergies', icon: '🚫' },
                    { key: 'pregnant', label: 'Currently Pregnant', icon: '🤰' },
                  ].map(({ key, label, icon }) => (
                    <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>{icon}</span>{label}
                      </span>
                      <div className="flex gap-2">
                        {(['Yes', 'No'] as const).map(opt => {
                          const val = opt === 'Yes'
                          const active = healthConditions[key] === val
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setHealthConditions(prev => ({ ...prev, [key]: prev[key] === val ? null : val }))}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                active
                                  ? opt === 'Yes' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other conditions (optional)</label>
                    <input
                      type="text"
                      value={otherConditions}
                      onChange={e => setOtherConditions(e.target.value)}
                      placeholder="e.g., Asthma, PCOS..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={saveHealthConditions}
                    disabled={healthLoading}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {healthLoading ? 'Saving...' : 'Save Health Info'}
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/settings')}
                  className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
