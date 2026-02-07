'use client'

import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'
import { UserProvider } from '@/context/UserContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </UserProvider>
      </body>
    </html>
  )
}
