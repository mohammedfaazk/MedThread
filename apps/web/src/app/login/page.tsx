'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { BlurText } from '@/components/enhancements/BlurText'
import { TypeText } from '@/components/enhancements/TypeText'
import Iridescence from '@/components/ui/Iridescence'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useJWTAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Memoize the color array to prevent Iridescence re-renders
  const iridescenceColor = useMemo<[number, number, number]>(() => [0.4, 0.7, 0.9], [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill all fields')
      return
    }

    // More lenient email validation - allow common formats
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login with:', email.trim());
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('🌐 API URL:', API_URL);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim(),
        password
      })

      console.log('✅ Login response:', response.data);
      console.log('✅ Response status:', response.status);

      if (response.data.success) {
        // Use the login function from context
        login(response.data.data.token, response.data.data.user);

        console.log('✅ Logged in successfully');

        // Redirect based on role - Send everyone to main feed to see posts and communities
        const user = response.data.data.user
        if (user.role === 'ADMIN') {
          console.log('➡️ Redirecting to /admin');
          router.push('/admin')
        } else if (user.role === 'DOCTOR') {
          // Check doctor verification status
          if (user.doctorVerificationStatus === 'PENDING' || user.doctorVerificationStatus === 'UNDER_REVIEW') {
            alert('Your doctor account is pending verification. You can browse and see all posts, but cannot create posts as a doctor until approved.')
          } else if (user.doctorVerificationStatus === 'REJECTED') {
            alert('Your doctor verification was rejected. Please contact support. You can still browse all posts and communities.')
          }
          console.log('➡️ Redirecting to / (main feed with posts and communities)');
          router.push('/')
        } else if (user.role === 'PATIENT') {
          console.log('➡️ Redirecting to / (main feed with posts and communities)');
          router.push('/')
        } else {
          console.log('➡️ Redirecting to / (unknown role)');
          router.push('/')
        }
      } else {
        console.error('❌ Login failed - API returned success: false');
        setError('Login failed - invalid response from server');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error message:', err.message);
      
      // Extract error message properly - handle both string and object errors
      let errorMessage = 'Login failed';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.status === 400) {
        const apiError = err.response?.data?.error;
        errorMessage = typeof apiError === 'string' ? apiError : (apiError?.message || 'Invalid request');
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please check if the database is connected.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the API is running.';
      } else {
        // Handle various error formats
        const apiError = err.response?.data?.error;
        const apiMessage = err.response?.data?.message;
        
        if (typeof apiError === 'string') {
          errorMessage = apiError;
        } else if (typeof apiError === 'object' && apiError?.message) {
          errorMessage = apiError.message;
        } else if (typeof apiMessage === 'string') {
          errorMessage = apiMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Iridescent Background - MedThread brand colors (cyan/blue tones) */}
      <div className="fixed inset-0 -z-10">
        <Iridescence 
          color={iridescenceColor} 
          mouseReact 
          amplitude={0.1} 
          speed={0.8} 
        />
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <BlurText text="Welcome Back" className="text-3xl font-bold text-gray-900 mb-2" />
          <TypeText text="Login to your MedThread account" className="text-gray-600" speed={50} />
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
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
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/70"
              placeholder="your@email.com"
              autoComplete="email"
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
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/70"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-sm text-gray-600 text-center bg-white/30 backdrop-blur-sm rounded-lg p-3">
            <strong>Test Accounts:</strong><br />
            Admin: admin@medthread.com / Admin@123456<br />
            Doctor: rifa@gmail.com / Doctor@123456<br />
            Patient: navin@gmail.com / Patient@123456
          </p>
        </div>
      </div>
    </div>
  )
}
