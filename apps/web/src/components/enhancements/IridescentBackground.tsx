'use client'

import { motion } from 'framer-motion'

export function IridescentBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient (existing) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6e3af] to-[#7dc2f1]" />
      
      {/* Iridescent overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255, 215, 102, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(91, 184, 178, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(255, 140, 66, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255, 215, 102, 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 102, 0.6) 0%, transparent 70%)',
          top: '10%',
          left: '10%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(91, 184, 178, 0.6) 0%, transparent 70%)',
          bottom: '10%',
          right: '10%',
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
