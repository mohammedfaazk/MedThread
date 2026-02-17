'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { getImageUrl } from '@/lib/imageUrl'
import axios from 'axios'
import {
  Settings,
  Users,
  Shield,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  ArrowLeft
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Community {
  id: string
  name: string
  displayName: string
  description: string
  icon?: string
  banner?: string
  isNSFW: boolean
  isPrivate: boolean
  memberCount: number
  isModerator: boolean
}

interface Member {
  id: string
  username: string
  avatar?: string
  role: string
  verified: boolean
  totalKarma: number
}

interface Moderator {
  id: string
  username: string
  avatar?: string
  permissions: any
  addedAt: string
}

export default function CommunitySettingsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useJWTAuth()
  const communityName = params.community as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [activeTab, setActiveTab] = useState<'settings' | 'members' | 'moderators'>('settings')
  
  // Settings form state
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [isNSFW, setIsNSFW] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    loadCommunityData()
  }, [communityName])

  const loadCommunityData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const headers = { Authorization: `Bearer ${token}` }

      const [communityRes, membersRes, moderatorsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/communities/${communityName}`, { headers }),
        axios.get(`${API_URL}/api/v1/communities/${communityName}/members`, { headers }),
        axios.get(`${API_URL}/api/v1/communities/${communityName}/moderators`, { headers })
      ])

      const communityData = communityRes.data
      setCommunity(communityData)
      setDisplayName(communityData.displayName)
      setDescription(communityData.description || '')
      setIsNSFW(communityData.isNSFW)
      setIsPrivate(communityData.isPrivate)

      setMembers(membersRes.data.members || membersRes.data)
      setModerators(moderatorsRes.data)

      // Check if user is moderator
      if (!communityData.isModerator) {
        alert('You must be a moderator to access this page')
        router.push(`/m/${communityName}`)
      }
    } catch (error: any) {
      console.error('Failed to load community data:', error)
      alert('Failed to load community data: ' + (error.response?.data?.error || error.message))
      router.push(`/m/${communityName}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!community) return

    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      await axios.put(
        `${API_URL}/api/v1/communities/${community.id}`,
        {
          displayName,
          description,
          isNSFW,
          isPrivate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Community settings updated successfully!')
      loadCommunityData()
    } catch (error: any) {
      console.error('Failed to update settings:', error)
      alert('Failed to update settings: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCommunity = async () => {
    if (!community) return
    if (deleteConfirmText !== community.name) {
      alert('Please type the community name correctly to confirm deletion')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      await axios.delete(
        `${API_URL}/api/v1/communities/${community.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      alert('Community deleted successfully')
      router.push('/')
    } catch (error: any) {
      console.error('Failed to delete community:', error)
      alert('Failed to delete community: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavbarEnhanced />
        <div className="flex max-w-[1400px] mx-auto">
          <Sidebar />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading moderator tools...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!community) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarEnhanced />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/m/${communityName}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to m/{communityName}
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Moderator Tools</h1>
            </div>
            <p className="text-gray-600">Manage m/{community.name}</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                  activeTab === 'settings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                  activeTab === 'members'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-5 h-5" />
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('moderators')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                  activeTab === 'moderators'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-5 h-5" />
                Moderators ({moderators.length})
              </button>
            </div>
          </div>

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Community Display Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Describe your community..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNSFW}
                        onChange={(e) => setIsNSFW(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          {isNSFW ? <EyeOff className="w-4 h-4 text-red-600" /> : <Eye className="w-4 h-4" />}
                          <span className="font-semibold text-gray-900">NSFW Content</span>
                        </div>
                        <p className="text-xs text-gray-500">Mark if community contains adult content</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          {isPrivate ? <Lock className="w-4 h-4 text-orange-600" /> : <Unlock className="w-4 h-4" />}
                          <span className="font-semibold text-gray-900">Private Community</span>
                        </div>
                        <p className="text-xs text-gray-500">Only members can view and post</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={loadCommunityData}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
                    <p className="text-red-800 text-sm">
                      Deleting a community is permanent and cannot be undone. All posts, comments, and member data will be lost.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Community
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Community Members</h2>
              
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No members yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <img src={getImageUrl(member.avatar) || ''} alt={member.username} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-blue-600 font-bold text-lg">
                              {member.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.username}</p>
                          <p className="text-sm text-gray-500">{member.totalKarma} karma</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {member.role === 'VERIFIED_DOCTOR' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Verified Doctor
                          </span>
                        )}
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove member"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Moderators Tab */}
          {activeTab === 'moderators' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Community Moderators</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                  <UserPlus className="w-5 h-5" />
                  Add Moderator
                </button>
              </div>
              
              {moderators.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No moderators</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moderators.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          {mod.avatar ? (
                            <img src={getImageUrl(mod.avatar) || ''} alt={mod.username} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-purple-600 font-bold text-lg">
                              {mod.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{mod.username}</p>
                            <Shield className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-sm text-gray-500">
                            Added {new Date(mod.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove moderator"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Delete Community</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the community, all posts, comments, and member data.
            </p>
            
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-red-600">{community.name}</span> to confirm:
            </p>
            
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              placeholder={community.name}
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCommunity}
                disabled={deleteConfirmText !== community.name}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
