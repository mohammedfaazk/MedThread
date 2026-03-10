'use client'

import { motion } from 'framer-motion'
import { AnimatedGradientLayer } from './AnimatedGradientLayer'
import { ECGWaveBackground } from './ECGWaveBackground'

interface WelcomeHeroBannerProps {
  userName: string
}

export function WelcomeHeroBanner({ userName }: WelcomeHeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ 
        y: -6,
        transition: { duration: 0.3 }
      }}
      className="group relative mb-8 overflow-hidden rounded-[28px] p-12 shadow-2xl border border-white/40 cursor-default"
    >
      {/* Animated gradient background layer */}
      <AnimatedGradientLayer />

      {/* ECG wave background */}
      <div className="absolute inset-0 opacity-70 group-hover:opacity-90 transition-opacity duration-500">
        <ECGWaveBackground />
      </div>

      {/* Ambient glow behind text */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Welcome back,{' '}
            <motion.span
              className="relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {/* Radial highlight behind username */}
              <motion.span
                className="absolute inset-0 bg-gradient-radial from-cyan-400/30 via-transparent to-transparent blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Animated gradient text */}
              <span
                className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%]"
                style={{
                  animation: 'gradientShift 4s ease infinite',
                }}
              >
                {userName}
              </span>

              {/* Light sweep effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 2,
                  delay: 1,
                  ease: 'easeInOut',
                }}
              />
            </motion.span>
          </h1>
        </motion.div>
      </div>

      {/* Hover glow intensification */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </motion.div>
  )
}
