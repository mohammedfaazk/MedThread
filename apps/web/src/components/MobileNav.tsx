'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, MessageCircle, User, Bell } from 'lucide-react'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { motion } from 'framer-motion'

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useJWTAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/create', icon: PlusCircle, label: 'Create' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: user ? '/profile' : '/login', icon: User, label: 'Profile' },
  ]

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }, index) => {
          const isActive = pathname === href
          const isHovered = hoveredIndex === index
          
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px]"
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
                  y: isActive ? -4 : isHovered ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`flex flex-col items-center gap-1 ${
                  isActive 
                    ? 'text-[#5CB8B2]' 
                    : 'text-gray-600'
                }`}
              >
                <motion.div
                  animate={{
                    rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`p-2 rounded-xl ${
                    isActive ? 'bg-[#5CB8B2]/10' : ''
                  }`}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="text-xs font-medium">{label}</span>
              </motion.div>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 w-1 h-1 bg-[#5CB8B2] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
