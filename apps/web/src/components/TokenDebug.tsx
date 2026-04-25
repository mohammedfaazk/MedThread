'use client'

import { useEffect, useState } from 'react'

export function TokenDebug() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    setToken(storedToken)
    setUser(storedUser ? JSON.parse(storedUser) : null)
    
    console.log('🔍 Token Debug:', {
      tokenExists: !!storedToken,
      tokenLength: storedToken?.length,
      tokenPreview: storedToken ? storedToken.substring(0, 50) + '...' : 'none',
      userExists: !!storedUser,
      user: storedUser ? JSON.parse(storedUser) : null
    })
  }, [])

  if (!token) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">❌ No token found in localStorage</p>
        <p className="text-red-600 text-sm mt-2">You need to log in first</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-700 font-semibold">✅ Token found in localStorage</p>
      <p className="text-green-600 text-sm mt-2">Token: {token.substring(0, 50)}...</p>
      {user && (
        <p className="text-green-600 text-sm">User: {user.username} ({user.role})</p>
      )}
    </div>
  )
}
