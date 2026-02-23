'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Shield, Lock, Key, QrCode, Check, X } from 'lucide-react'
import QRCode from 'qrcode'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SecuritySettingsPage() {
  const { user } = useJWTAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 2FA Setup
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFactorSecret, setTwoFactorSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to change password')
        return
      }

      const response = await axios.put(
        `${API_URL}/api/profile/me/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        alert('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error: any) {
      console.error('Failed to change password:', error)
      alert(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const setup2FA = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to setup 2FA')
        return
      }

      const response = await axios.post(
        `${API_URL}/api/profile/me/2fa/setup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        const { secret, qrCode } = response.data.data
        setTwoFactorSecret(secret)
        
        // Generate QR code image
        const qrCodeDataUrl = await QRCode.toDataURL(qrCode)
        setQrCodeUrl(qrCodeDataUrl)
        setShow2FASetup(true)
      }
    } catch (error: any) {
      console.error('Failed to setup 2FA:', error)
      alert(error.response?.data?.error || 'Failed to setup 2FA')
    } finally {
      setLoading(false)
    }
  }

  const enable2FA = async () => {
    if (!verificationToken) {
      alert('Please enter the verification code')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${API_URL}/api/profile/me/2fa/enable`,
        {
          secret: twoFactorSecret,
          token: verificationToken
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        alert('2FA enabled successfully!')
        setIs2FAEnabled(true)
        setShow2FASetup(false)
        setVerificationToken('')
      }
    } catch (error: any) {
      console.error('Failed to enable 2FA:', error)
      alert(error.response?.data?.error || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    const token = prompt('Enter your 2FA code to disable:')
    if (!token) return

    setLoading(true)
    try {
      const authToken = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${API_URL}/api/profile/me/2fa/disable`,
        { token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      if (response.data.success) {
        alert('2FA disabled successfully')
        setIs2FAEnabled(false)
      }
    } catch (error: any) {
      console.error('Failed to disable 2FA:', error)
      alert(error.response?.data?.error || 'Failed to disable 2FA')
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

          {/* Password Change */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
            </div>

            {!is2FAEnabled && !show2FASetup && (
              <div>
                <p className="text-gray-700 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <button
                  onClick={setup2FA}
                  disabled={loading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {loading ? 'Setting up...' : 'Enable 2FA'}
                </button>
              </div>
            )}

            {show2FASetup && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2 font-semibold">
                    Step 1: Scan QR Code
                  </p>
                  <p className="text-sm text-blue-700 mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  {qrCodeUrl && (
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  )}
                  <p className="text-xs text-blue-600 mt-2 text-center">
                    Or enter this code manually: <code className="bg-blue-100 px-2 py-1 rounded">{twoFactorSecret}</code>
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2 font-semibold">
                    Step 2: Verify Code
                  </p>
                  <p className="text-sm text-green-700 mb-3">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <input
                    type="text"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShow2FASetup(false)
                      setVerificationToken('')
                    }}
                    className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={enable2FA}
                    disabled={loading || verificationToken.length !== 6}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            )}

            {is2FAEnabled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800 font-semibold">
                    Two-Factor Authentication is enabled
                  </p>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Your account is protected with 2FA. You'll need to enter a code from your authenticator app when logging in.
                </p>
                <button
                  onClick={disable2FA}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
