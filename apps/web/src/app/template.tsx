'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

export default function Template({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { startLoading, stopLoading } = useLoading()

  useEffect(() => {
    // Prefetch common routes for faster navigation
    const commonRoutes = [
      '/dashboard/patient',
      '/dashboard/doctor',
      '/chat',
      '/appointments',
      '/ai-detective',
      '/profile',
      '/settings'
    ]

    // Prefetch after a short delay to not block initial render
    const timer = setTimeout(() => {
      commonRoutes.forEach(route => {
        router.prefetch(route)
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  // Apply body classes based on current route
  useEffect(() => {
    // Remove chat-page class from all pages
    document.body.classList.remove('chat-page')

    // Add chat-page class only for chat routes
    if (pathname?.startsWith('/chat')) {
      document.body.classList.add('chat-page')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('chat-page')
    }
  }, [pathname])

  // Show loading overlay on route change
  useEffect(() => {
    // Stop loading when pathname changes (route has loaded)
    stopLoading()
  }, [pathname, stopLoading])

  return <>{children}</>
}
