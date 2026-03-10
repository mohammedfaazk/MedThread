'use client'

import { motion } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#E6F4FF] via-white to-[#FFF4CC]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          backgroundSize: '200% 200%'
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-200/15 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4
        }}
      />
    </div>
  )
}
