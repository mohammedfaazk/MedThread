'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Save, Upload, Plus, X, Award, GraduationCap, FileText, Briefcase } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function EditProfilePage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const [profile, setProfile] = useState({
    professionalBio: '',
    registrationNumber: '',
    languagesSpoken: [] as string[],
    consultationFee: '',
    clinicName: '',
    clinicWebsite: '',
    education: [] as any[],
    certifications: [] as any[],
    publications: [] as any[],
    awards: [] as any[]
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      const response = await axios.get(
        `${API_URL}/api/doctor-profile/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Extract profile data from verificationDocuments
      const docs = response.data.verificationDocuments || {}
      setProfile({
        professionalBio: response.data.bio || '',
        registrationNumber: docs.registrationNumber || '',
        languagesSpoken: docs.languagesSpoken || [],
        consultationFee: docs.consultationFee || '',
        clinicName: docs.clinicName || '',
        clinicWebsite: docs.clinicWebsite || '',
        education: docs.education || [],
        certifications: docs.certifications || [],
        publications: docs.publications || [],
        awards: docs.professionalAwards || []
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      await axios.put(
        `${API_URL}/api/doctor-profile/${userId}`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, { degree: '', institution: '', year: '', field: '' }]
    })
  }

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    })
  }

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...profile.education]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, education: updated })
  }

  const addCertification = () => {
    setProfile({
      ...profile,
      certifications: [...profile.certifications, { 
        name: '', 
        issuingOrganization: '', 
        issueDate: '', 
        expiryDate: '', 
        credentialId: '' 
      }]
    })
  }

  const removeCertification = (index: number) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter((_, i) => i !== index)
    })
  }

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...profile.certifications]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, certifications: updated })
  }

  const addPublication = () => {
    setProfile({
      ...profile,
      publications: [...profile.publications, { 
        title: '', 
        journal: '', 
        year: '', 
        authors: [], 
        doi: '', 
        url: '' 
      }]
    })
  }

  const removePublication = (index: number) => {
    setProfile({
      ...profile,
      publications: profile.publications.filter((_, i) => i !== index)
    })
  }

  const updatePublication = (index: number, field: string, value: any) => {
    const updated = [...profile.publications]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, publications: updated })
  }

  const addAward = () => {
    setProfile({
      ...profile,
      awards: [...profile.awards, { title: '', organization: '', year: '', description: '' }]
    })
  }

  const removeAward = (index: number) => {
    setProfile({
      ...profile,
      awards: profile.awards.filter((_, i) => i !== index)
    })
  }

  const updateAward = (index: number, field: string, value: any) => {
    const updated = [...profile.awards]
    updated[index] = { ...updated[index], [field]: value }
    setProfile({ ...profile, awards: updated })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Professional Profile</h1>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {[
                { key: 'basic', label: 'Basic Info', icon: <Briefcase className="w-4 h-4" /> },
                { key: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
                { key: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
                { key: 'publications', label: 'Publications', icon: <FileText className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium transition ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={profile.professionalBio}
                    onChange={(e) => setProfile({ ...profile, professionalBio: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write a compelling professional bio..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={profile.registrationNumber}
                      onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Fee ($)
                    </label>
                    <input
                      type="number"
                      value={profile.consultationFee}
                      onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      value={profile.clinicName}
                      onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Website
                    </label>
                    <input
                      type="url"
                      value={profile.clinicWebsite}
                      onChange={(e) => setProfile({ ...profile, clinicWebsite: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Education History</h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Education
                  </button>
                </div>

                {profile.education.map((edu, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                      <button
                        onClick={() => removeEducation(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., MBBS, MD"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <input
                          type="number"
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Cardiology"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {profile.education.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No education added yet</p>
                    <button
                      onClick={addEducation}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first education
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Certification
                  </button>
                </div>

                {profile.certifications.map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Certification #{index + 1}</h4>
                      <button
                        onClick={() => removeCertification(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuingOrganization}
                          onChange={(e) => updateCertification(index, 'issuingOrganization', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                        <input
                          type="date"
                          value={cert.issueDate}
                          onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                        <input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
                        <input
                          type="text"
                          value={cert.credentialId}
                          onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {profile.certifications.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No certifications added yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Publications</h3>
                  <button
                    onClick={addPublication}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Publication
                  </button>
                </div>

                {profile.publications.map((pub, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Publication #{index + 1}</h4>
                      <button
                        onClick={() => removePublication(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={pub.title}
                          onChange={(e) => updatePublication(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Journal</label>
                          <input
                            type="text"
                            value={pub.journal}
                            onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                          <input
                            type="number"
                            value={pub.year}
                            onChange={(e) => updatePublication(index, 'year', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                          <input
                            type="text"
                            value={pub.doi}
                            onChange={(e) => updatePublication(index, 'doi', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                          <input
                            type="url"
                            value={pub.url}
                            onChange={(e) => updatePublication(index, 'url', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {profile.publications.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No publications added yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
