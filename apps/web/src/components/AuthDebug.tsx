'use client'

import { useEffect, useState } from 'react'
import { useJWTAuth } from '@/context/JWTAuthContext'

export function AuthDebug() {
  const [authData, setAuthData] = useState<any>(null)
  const contextData = useJWTAuth()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')
    
    setAuthData({
      localStorage: {
        hasToken: !!token,
        token: token?.substring(0, 20) + '...',
        user: user ? JSON.parse(user) : null
      },
      context: {
        user: contextData.user,
        role: contextData.role,
        loading: contextData.loading,
        isDoctorVerified: contextData.isDoctorVerified,
        isDoctorPending: contextData.isDoctorPending
      }
    })
  }, [contextData])

  if (!authData) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50 max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Auth Debug (JWT)</h3>
      <pre className="overflow-auto">
        {JSON.stringify(authData, null, 2)}
      </pre>
    </div>
  )
}
