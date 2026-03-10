'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu } from 'lucide-react'
import { ReactNode } from 'react'

interface EnhancedSidebarAnimationProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function EnhancedSidebarAnimation({ 
  isOpen, 
  onClose, 
  children 
}: EnhancedSidebarAnimationProps) {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const sidebarVariants = {
    hidden: { 
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -20 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            {/* Close button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10"
            >
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </motion.div>

            {/* Sidebar content with stagger animation */}
            <motion.div
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
              className="p-4"
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hamburger menu button component
interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isOpen ? 'open' : 'closed'}
        className="w-6 h-6 flex flex-col justify-center items-center"
      >
        <motion.span
          variants={{
            closed: { rotate: 0, y: -4 },
            open: { rotate: 45, y: 0 }
          }}
          transition={{ duration: 0.3 }}
          className="w-6 h-0.5 bg-gray-700 block mb-1"
        />
        <motion.span
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 }
          }}
          transition={{ duration: 0.2 }}
          className="w-6 h-0.5 bg-gray-700 block mb-1"
        />
        <motion.span
          variants={{
            closed: { rotate: 0, y: 4 },
            open: { rotate: -45, y: 0 }
          }}
          transition={{ duration: 0.3 }}
          className="w-6 h-0.5 bg-gray-700 block"
        />
      </motion.div>
    </motion.button>
  )
}

// Staggered menu item wrapper
export function StaggeredMenuItem({ children }: { children: ReactNode }) {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -20 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  )
}
