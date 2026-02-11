'use client'

import { useState, useEffect } from 'react'
import { useJWTAuth } from '@/context/JWTAuthContext'
import axios from 'axios'
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Briefcase, 
    Award, 
    Calendar,
    Edit2,
    Save,
    X,
    Shield,
    Building2,
    Stethoscope
} from 'lucide-react'

export function DoctorProfile() {
    const { user } = useJWTAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    
    const [profileData, setProfileData] = useState({
        username: '',
        full_name: '',
        email: '',
        specialty: '',
        subSpecialty: '',
        yearsOfExperience: 0,
        hospitalAffiliation: '',
        clinicAddress: '',
        bio: '',
        phone: '',
        medicalLicenseNumber: '',
        licenseIssuingAuthority: '',
        licenseExpiryDate: '',
        avatar: '',
    })

    // Fetch fresh data from API on mount
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.id) {
                console.log('[DoctorProfile] No user ID available')
                setLoading(false)
                return
            }
            
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                console.log('[DoctorProfile] Fetching profile for user:', user.id)
                const response = await axios.get(`${API_URL}/api/users/${user.id}`)
                
                console.log('[DoctorProfile] API Response:', response.data)
                
                if (response.data.success && response.data.data) {
                    const userData = response.data.data
                    console.log('[DoctorProfile] User data from API:', userData)
                    setProfileData({
                        username: userData.username || '',
                        full_name: userData.full_name || userData.username || '',
                        email: userData.email || '',
                        specialty: userData.specialty || '',
                        subSpecialty: userData.subSpecialty || '',
                        yearsOfExperience: userData.yearsOfExperience || 0,
                        hospitalAffiliation: userData.hospitalAffiliation || '',
                        clinicAddress: userData.clinicAddress || '',
                        bio: userData.bio || '',
                        phone: userData.phone || '',
                        medicalLicenseNumber: userData.medicalLicenseNumber || '',
                        licenseIssuingAuthority: userData.licenseIssuingAuthority || '',
                        licenseExpiryDate: userData.licenseExpiryDate ? new Date(userData.licenseExpiryDate).toISOString().split('T')[0] : '',
                        avatar: userData.avatar || '',
                    })
                } else {
                    console.log('[DoctorProfile] Unexpected response format:', response.data)
                }
            } catch (error) {
                console.error('[DoctorProfile] Failed to fetch profile data:', error)
                // Fallback to user object from context
                if (user) {
                    console.log('[DoctorProfile] Using fallback from context:', user)
                    setProfileData({
                        username: user.username || '',
                        full_name: (user as any)?.full_name || user.username || '',
                        email: user.email || '',
                        specialty: (user as any)?.specialty || '',
                        subSpecialty: (user as any)?.subSpecialty || '',
                        yearsOfExperience: (user as any)?.yearsOfExperience || 0,
                        hospitalAffiliation: (user as any)?.hospitalAffiliation || '',
                        clinicAddress: (user as any)?.clinicAddress || '',
                        bio: (user as any)?.bio || '',
                        phone: (user as any)?.phone || '',
                        medicalLicenseNumber: (user as any)?.medicalLicenseNumber || '',
                        licenseIssuingAuthority: (user as any)?.licenseIssuingAuthority || '',
                        licenseExpiryDate: '',
                        avatar: (user as any)?.avatar || '',
                    })
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [user?.id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const response = await axios.put(`${API_URL}/api/users/${user?.id}`, profileData)
            
            if (response.data.success) {
                // Update localStorage with fresh data
                const updatedUser = { ...user, ...response.data.data }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                
                alert('Profile updated successfully!')
                setIsEditing(false)
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        // Refetch original data from API
        const refetchData = async () => {
            if (!user?.id) return
            
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                const response = await axios.get(`${API_URL}/api/users/${user.id}`)
                
                if (response.data.success && response.data.data) {
                    const userData = response.data.data
                    setProfileData({
                        username: userData.username || '',
                        full_name: userData.full_name || userData.username || '',
                        email: userData.email || '',
                        specialty: userData.specialty || '',
                        subSpecialty: userData.subSpecialty || '',
                        yearsOfExperience: userData.yearsOfExperience || 0,
                        hospitalAffiliation: userData.hospitalAffiliation || '',
                        clinicAddress: userData.clinicAddress || '',
                        bio: userData.bio || '',
                        phone: userData.phone || '',
                        medicalLicenseNumber: userData.medicalLicenseNumber || '',
                        licenseIssuingAuthority: userData.licenseIssuingAuthority || '',
                        licenseExpiryDate: userData.licenseExpiryDate ? new Date(userData.licenseExpiryDate).toISOString().split('T')[0] : '',
                        avatar: userData.avatar || '',
                    })
                }
            } catch (error) {
                console.error('Failed to refetch profile data:', error)
            }
        }
        
        refetchData()
        setIsEditing(false)
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <p className="text-center text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                            {profileData.avatar ? (
                                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                profileData.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Dr. {profileData.full_name || profileData.username}
                            </h1>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-700">Verified Doctor</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Stethoscope className="w-4 h-4" />
                                <span className="text-sm font-medium">{profileData.specialty}</span>
                            </div>
                        </div>
                    </div>
                    
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Bio Section */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
                    {isEditing ? (
                        <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                    ) : (
                        <p className="text-gray-600">
                            {profileData.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                        </p>
                    )}
                </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialty */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Briefcase className="w-4 h-4" />
                            Specialty
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profileData.specialty}
                                onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-600">{profileData.specialty || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Sub-Specialty */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Stethoscope className="w-4 h-4" />
                            Sub-Specialty
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profileData.subSpecialty}
                                onChange={(e) => setProfileData({ ...profileData, subSpecialty: e.target.value })}
                                placeholder="Optional"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-600">{profileData.subSpecialty || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Years of Experience */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4" />
                            Years of Experience
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                value={profileData.yearsOfExperience}
                                onChange={(e) => setProfileData({ ...profileData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                min="0"
                                max="70"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-600">{profileData.yearsOfExperience} years</p>
                        )}
                    </div>

                    {/* Hospital Affiliation */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Building2 className="w-4 h-4" />
                            Hospital Affiliation
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profileData.hospitalAffiliation}
                                onChange={(e) => setProfileData({ ...profileData, hospitalAffiliation: e.target.value })}
                                placeholder="Hospital name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-600">{profileData.hospitalAffiliation || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Medical License Number */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Award className="w-4 h-4" />
                            Medical License Number
                        </label>
                        <p className="text-gray-600">{profileData.medicalLicenseNumber || 'Not available'}</p>
                        <p className="text-xs text-gray-400 mt-1">Contact admin to update</p>
                    </div>

                    {/* License Authority */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Shield className="w-4 h-4" />
                            Licensing Authority
                        </label>
                        <p className="text-gray-600">{profileData.licenseIssuingAuthority || 'Not available'}</p>
                        <p className="text-xs text-gray-400 mt-1">Contact admin to update</p>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <p className="text-gray-600">{profileData.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="text-gray-600">{profileData.phone || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Clinic Address */}
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            Clinic Address
                        </label>
                        {isEditing ? (
                            <textarea
                                value={profileData.clinicAddress}
                                onChange={(e) => setProfileData({ ...profileData, clinicAddress: e.target.value })}
                                placeholder="Full clinic address"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                            />
                        ) : (
                            <p className="text-gray-600">{profileData.clinicAddress || 'Not specified'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
