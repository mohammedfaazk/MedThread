'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AlertTriangle, Trash2, UserX, Info, Shield } from 'lucide-react'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SettingsPage() {
  const { user, logout } = useJWTAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deletionPreview, setDeletionPreview] = useState<any>(null)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    if (user) {
      fetchDeletionPreview()
    }
  }, [user])

  const fetchDeletionPreview = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await axios.get(`${API_URL}/api/v1/account/deletion-preview`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setDeletionPreview(response.data.data)
      }
    } catch (error) {
      // Silently fail - deletion preview is optional
      console.warn('Could not fetch deletion preview (non-critical):', error)
      // Set default empty preview so UI doesn't break
      setDeletionPreview({
        dataToDelete: {
          posts: 0,
          comments: 0,
          votes: 0,
          communities: 0,
          followers: 0,
          following: 0
        }
      })
    }
  }

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to deactivate your account')
        return
      }

      const response = await axios.post(
        `${API_URL}/api/v1/account/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        alert('Account deactivated successfully. You can reactivate it by logging in again.')
        logout()
        router.push('/login')
      }
    } catch (error: any) {
      console.error('Failed to deactivate account:', error)
      alert(error.response?.data?.error || 'Failed to deactivate account')
    } finally {
      setLoading(false)
      setShowDeactivateModal(false)
    }
  }

  const handleDeletePermanently = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" exactly to confirm')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to delete your account')
        return
      }

      const response = await axios.delete(
        `${API_URL}/api/v1/account/delete-permanently`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { confirmation: deleteConfirmation }
        }
      )

      if (response.data.success) {
        alert('Account permanently deleted. We\'re sorry to see you go.')
        logout()
        router.push('/')
      }
    } catch (error: any) {
      console.error('Failed to delete account:', error)
      alert(error.response?.data?.error || 'Failed to delete account')
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
        <Sidebar />
        
        <main className="flex-1 max-w-[900px]">
          {/* Settings Navigation */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg mb-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/settings/profile')}
                className="p-4 bg-white/60 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Profile</h3>
                </div>
                <p className="text-sm text-gray-600">Edit your profile, avatar, and banner</p>
              </button>

              <button
                onClick={() => router.push('/settings/security')}
                className="p-4 bg-white/60 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Security</h3>
                </div>
                <p className="text-sm text-gray-600">Password and two-factor authentication</p>
              </button>

              <button
                onClick={() => router.push('/settings/notifications')}
                className="p-4 bg-white/60 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <p className="text-sm text-gray-600">Manage notification preferences</p>
              </button>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">General Settings</h2>
            
            <div className="space-y-8">
              {/* Account Settings */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Account Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-gray-700">Push notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-gray-700">Show NSFW content</span>
                  </label>
                </div>
              </div>

              {/* Privacy */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Privacy</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-gray-700">Make my profile public</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-gray-700">Allow direct messages</span>
                  </label>
                </div>
              </div>

              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg">
                Save Settings
              </button>
            </div>
          </div>

          {/* Account Management - Danger Zone */}
          <div className="bg-red-50/80 backdrop-blur-xl rounded-2xl border-2 border-red-200 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">Account Management</h2>
            </div>

            {/* Account Stats */}
            {deletionPreview && (
              <div className="bg-white/60 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Your Account Data:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold">{deletionPreview.dataToDelete.posts}</span> posts
                      </div>
                      <div>
                        <span className="font-semibold">{deletionPreview.dataToDelete.comments}</span> comments
                      </div>
                      <div>
                        <span className="font-semibold">{deletionPreview.dataToDelete.votes}</span> votes
                      </div>
                      <div>
                        <span className="font-semibold">{deletionPreview.dataToDelete.communities}</span> communities
                      </div>
                      <div>
                        <span className="font-semibold">{deletionPreview.dataToDelete.followers}</span> followers
                      </div>
                      <div>
                        <span className="font-semibold">{deletionPreview.dataToDelete.following}</span> following
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deactivate Account */}
            <div className="bg-white/60 rounded-xl p-6 mb-4">
              <div className="flex items-start gap-3 mb-4">
                <UserX className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Deactivate Account</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Temporarily disable your account. You can reactivate it anytime by logging in again.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4 list-disc">
                    <li>Your profile will be hidden from other users</li>
                    <li>Your posts and comments will remain visible</li>
                    <li>You can reactivate anytime by logging in</li>
                    <li>All your data will be preserved</li>
                  </ul>
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Account Permanently */}
            <div className="bg-white/60 rounded-xl p-6 border-2 border-red-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account Permanently</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    <strong className="text-red-700">Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-4 list-disc">
                    <li>All your posts and comments will be deleted</li>
                    <li>All your votes and awards will be removed</li>
                    <li>Your profile and account data will be erased</li>
                    <li>All appointments and messages will be deleted</li>
                    <li><strong className="text-red-700">This cannot be reversed</strong></li>
                  </ul>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <UserX className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Deactivate Account?</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Your account will be temporarily disabled. You can reactivate it anytime by logging in again.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Your posts and comments will remain visible, but your profile will be hidden.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
              >
                {loading ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Permanently Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Delete Account Permanently?</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              <strong className="text-red-700">This action cannot be undone!</strong> All your data will be permanently deleted.
            </p>

            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-semibold mb-2">
                What will be deleted:
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                <li>All posts and comments</li>
                <li>All votes and awards</li>
                <li>Profile and account data</li>
                <li>Appointments and messages</li>
                <li>Community memberships</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type <span className="text-red-600">"DELETE MY ACCOUNT"</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePermanently}
                disabled={loading || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </IridescenceLayout>
  )
}