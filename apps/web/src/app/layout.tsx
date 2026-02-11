'use client'

import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'
import { JWTAuthProvider } from '@/context/JWTAuthContext'
import { UserProvider } from '@/context/UserContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <JWTAuthProvider>
          <UserProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </UserProvider>
        </JWTAuthProvider>
      </body>
    </html>
  )
}
