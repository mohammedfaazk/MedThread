'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Shield, Clock, CheckCircle, XCircle, Eye, FileText, User, Calendar, Award } from 'lucide-react'

interface PendingDoctor {
  id: string
  username: string
  email: string
  doctorVerificationStatus: string
  medicalLicenseNumber: string
  licenseIssuingAuthority: string
  licenseExpiryDate: string
  specialty: string
  subSpecialty?: string
  yearsOfExperience: number
  hospitalAffiliation?: string
  clinicAddress?: string
  kycDocuments: {
    idProof: string
    medicalDegree: string
    licenseDocument: string
  }
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalDoctors: number
  pendingVerifications: number
  approvedDoctors: number
  rejectedDoctors: number
  suspendedDoctors: number
  recentApprovals: number
  approvalRate: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [viewingDocument, setViewingDocument] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('auth_token')
    
    if (!user || !token) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'ADMIN') {
      alert('Access denied. Admin only.')
      router.push('/')
      return
    }

    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const headers = { Authorization: `Bearer ${token}` }

      // Load pending verifications and stats
      const [pendingRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/v1/doctor-verification/pending', { headers }),
        axios.get('http://localhost:3001/api/v1/doctor-verification/stats', { headers })
      ])

      setPendingDoctors(pendingRes.data.data.requests || [])
      setStats(statsRes.data.data)
    } catch (error: any) {
      console.error('Failed to load data:', error)
      alert('Failed to load data: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (doctor: PendingDoctor) => {
    setSelectedDoctor(doctor)
    setShowModal(true)
    setRejectionReason('')
    setApprovalNotes('')
  }

  const handleApprove = async () => {
    if (!selectedDoctor) return

    setActionLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      await axios.post(
        `http://localhost:3001/api/v1/doctor-verification/${selectedDoctor.id}/approve`,
        { notes: approvalNotes || 'Approved by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Doctor approved successfully!')
      setShowModal(false)
      setSelectedDoctor(null)
      loadData()
    } catch (error: any) {
      console.error('Approval failed:', error)
      alert('Approval failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedDoctor) return
    
    if (!rejectionReason || rejectionReason.length < 10) {
      alert('Please provide a rejection reason (minimum 10 characters)')
      return
    }

    setActionLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      await axios.post(
        `http://localhost:3001/api/v1/doctor-verification/${selectedDoctor.id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Doctor verification rejected')
      setShowModal(false)
      setSelectedDoctor(null)
      loadData()
    } catch (error: any) {
      console.error('Rejection failed:', error)
      alert('Rejection failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Doctor Verification Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <User className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{stats.totalDoctors}</span>
              </div>
              <p className="text-sm text-gray-600">Total Doctors</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold text-orange-600">{stats.pendingVerifications}</span>
              </div>
              <p className="text-sm text-gray-600">Pending Verification</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-green-600">{stats.approvedDoctors}</span>
              </div>
              <p className="text-sm text-gray-600">Approved</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">{stats.approvalRate}%</span>
              </div>
              <p className="text-sm text-gray-600">Approval Rate</p>
            </div>
          </div>
        )}

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Doctor Verifications</h2>
            <p className="text-sm text-gray-500 mt-1">Review and approve doctor registration requests</p>
          </div>

          <div className="p-6">
            {pendingDoctors.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {doctor.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{doctor.username}</h3>
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                          </div>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            {doctor.doctorVerificationStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Specialty</p>
                            <p className="text-sm font-semibold text-gray-900">{doctor.specialty}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="text-sm font-semibold text-gray-900">{doctor.yearsOfExperience} years</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">License Number</p>
                            <p className="text-sm font-semibold text-gray-900">{doctor.medicalLicenseNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Submitted</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(doctor.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {doctor.hospitalAffiliation && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Hospital:</span> {doctor.hospitalAffiliation}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewDetails(doctor)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Doctor Verification Review</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Doctor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Specialty</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.specialty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sub-Specialty</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.subSpecialty || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.medicalLicenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issuing Authority</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.licenseIssuingAuthority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License Expiry</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedDoctor.licenseExpiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedDoctor.hospitalAffiliation && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Hospital Affiliation</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.hospitalAffiliation}</p>
                  </div>
                )}
                {selectedDoctor.clinicAddress && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Clinic Address</p>
                    <p className="font-semibold text-gray-900">{selectedDoctor.clinicAddress}</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded Documents</h3>
                <div className="space-y-4">
                  {selectedDoctor.kycDocuments.idProof && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Profile Photo</span>
                        </div>
                        <button
                          onClick={() => setViewingDocument(selectedDoctor.kycDocuments.idProof)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          View Full Size
                        </button>
                      </div>
                      <img
                        src={selectedDoctor.kycDocuments.idProof}
                        alt="Profile Photo"
                        className="w-full h-48 object-contain bg-gray-100 rounded cursor-pointer hover:opacity-80 transition"
                        onClick={() => setViewingDocument(selectedDoctor.kycDocuments.idProof)}
                      />
                    </div>
                  )}

                  {selectedDoctor.kycDocuments.licenseDocument && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Medical License Document</span>
                        </div>
                        <button
                          onClick={() => setViewingDocument(selectedDoctor.kycDocuments.licenseDocument)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          View Full Size
                        </button>
                      </div>
                      <img
                        src={selectedDoctor.kycDocuments.licenseDocument}
                        alt="License Document"
                        className="w-full h-48 object-contain bg-gray-100 rounded cursor-pointer hover:opacity-80 transition"
                        onClick={() => setViewingDocument(selectedDoctor.kycDocuments.licenseDocument)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes about this verification..."
                />
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Provide a detailed reason for rejection (minimum 10 characters)..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Approve Doctor'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  {actionLoading ? 'Processing...' : 'Reject Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingDocument(null)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]">
            <button
              onClick={() => setViewingDocument(null)}
              className="absolute top-4 right-4 bg-white text-gray-900 rounded-full p-3 hover:bg-gray-100 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={viewingDocument}
              alt="Document"
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <a
                href={viewingDocument}
                download
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </a>
              <a
                href={viewingDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
