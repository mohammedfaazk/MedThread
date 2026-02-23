'use client'

import type { Metadata } from 'next'
import './globals.css'
import { SocketProvider } from '@/context/SocketContext'
import { JWTAuthProvider } from '@/context/JWTAuthContext'
import { UserProvider } from '@/context/UserContext'
import { PWAInstaller } from '@/components/PWAInstaller'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { MobileNav } from '@/components/MobileNav'
import { useEffect } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('SW registration failed:', err)
      })
    }

    // Initialize PWA manager
    import('@/lib/pwaManager').then(({ pwaManager }) => {
      pwaManager.initialize()
    })

    // Prevent pull-to-refresh on mobile
    let lastTouchY = 0
    const preventPullToRefresh = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch.clientY > lastTouchY && window.scrollY === 0) {
        e.preventDefault()
      }
      lastTouchY = touch.clientY
    }

    document.addEventListener('touchstart', (e) => {
      lastTouchY = e.touches[0].clientY
    }, { passive: false })
    
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })

    return () => {
      document.removeEventListener('touchmove', preventPullToRefresh)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#5CB8B2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MedThread" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased touch-manipulation">
        <JWTAuthProvider>
          <UserProvider>
            <SocketProvider>
              <PWAInstaller />
              <OfflineIndicator />
              {children}
              <MobileNav />
            </SocketProvider>
          </UserProvider>
        </JWTAuthProvider>
      </body>
    </html>
  )
}
