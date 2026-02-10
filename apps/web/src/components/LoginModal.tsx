'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              role: 'PATIENT'
            }
          }
        })
        if (authError) throw authError
        alert('Verification email sent! Please check your inbox.')
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-elevated border border-white/20 relative">
        <h2 className="text-2xl font-bold mb-6 text-charcoal">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-transparent bg-white/50 backdrop-blur-sm transition"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-charcoal text-white rounded-full hover:bg-charcoal-light transition font-semibold shadow-soft hover:shadow-elevated"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-charcoal hover:text-yellow-200 text-sm font-medium transition"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
