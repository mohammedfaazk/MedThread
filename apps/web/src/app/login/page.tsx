'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useJWTAuth } from '@/context/JWTAuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useJWTAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login with:', email);
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      })

      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        // Use the login function from context
        login(response.data.data.token, response.data.data.user);
        
        console.log('✅ Logged in successfully');
        
        // Redirect based on role
        const user = response.data.data.user
        if (user.role === 'ADMIN') {
          console.log('➡️ Redirecting to /admin');
          router.push('/admin')
        } else if (user.role === 'DOCTOR') {
          // Check doctor verification status
          if (user.doctorVerificationStatus === 'APPROVED') {
            console.log('➡️ Redirecting to /dashboard/doctor');
            router.push('/dashboard/doctor')
          } else if (user.doctorVerificationStatus === 'PENDING' || user.doctorVerificationStatus === 'UNDER_REVIEW') {
            alert('Your doctor account is pending verification. You can browse but cannot post as a doctor until approved.')
            console.log('➡️ Redirecting to / (pending verification)');
            router.push('/')
          } else if (user.doctorVerificationStatus === 'REJECTED') {
            alert('Your doctor verification was rejected. Please contact support.')
            console.log('➡️ Redirecting to / (rejected)');
            router.push('/')
          } else {
            console.log('➡️ Redirecting to /dashboard/doctor (default)');
            router.push('/dashboard/doctor')
          }
        } else if (user.role === 'PATIENT') {
          console.log('➡️ Redirecting to /dashboard/patient');
          router.push('/dashboard/patient')
        } else {
          console.log('➡️ Redirecting to / (unknown role)');
          router.push('/')
        }
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your MedThread account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            <strong>Test Accounts:</strong><br />
            Admin: admin@medthread.com / Admin@123456
          </p>
        </div>
      </div>
    </div>
  )
}
