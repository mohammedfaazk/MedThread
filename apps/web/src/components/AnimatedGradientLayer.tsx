'use client'

import { motion } from 'framer-motion'

export function AnimatedGradientLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #E6F4FF 0%, #FFFFFF 50%, #FFF4CC 100%)',
            'linear-gradient(135deg, #CFEFFF 0%, #F0F9FF 50%, #FFE082 100%)',
            'linear-gradient(135deg, #E6F4FF 0%, #FFFFFF 50%, #FFF4CC 100%)',
          ],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Flowing wave shapes */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0,50 Q250,20 500,50 T1000,50 T1500,50 T2000,50"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          animate={{
            d: [
              "M0,50 Q250,20 500,50 T1000,50 T1500,50 T2000,50",
              "M0,50 Q250,80 500,50 T1000,50 T1500,50 T2000,50",
              "M0,50 Q250,20 500,50 T1000,50 T1500,50 T2000,50",
            ],
            x: [0, -500, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        <motion.path
          d="M0,150 Q300,120 600,150 T1200,150 T1800,150 T2400,150"
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="1.5"
          opacity="0.6"
          animate={{
            d: [
              "M0,150 Q300,120 600,150 T1200,150 T1800,150 T2400,150",
              "M0,150 Q300,180 600,150 T1200,150 T1800,150 T2400,150",
              "M0,150 Q300,120 600,150 T1200,150 T1800,150 T2400,150",
            ],
            x: [0, -600, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>

      {/* Subtle grid lines with parallax */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5" />
    </div>
  )
}
