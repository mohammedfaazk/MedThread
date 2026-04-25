'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshSessionPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear old token and user data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user')

    // Show message
    alert('Session cleared. You will be redirected to login.')

    // Redirect to login
    setTimeout(() => {
      router.push('/login')
    }, 500)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Refreshing Session...</h1>
        <p className="text-gray-600">Please wait while we clear your session and redirect you to login.</p>
      </div>
    </div>
  )
}
