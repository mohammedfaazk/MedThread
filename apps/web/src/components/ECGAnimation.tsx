'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function ECGAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heartbeat, setHeartbeat] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    let animationId: number
    let offset = 0
    const speed = 2

    // ECG wave pattern (normalized to 0-1)
    const ecgPattern = [
      0.5, 0.5, 0.5, 0.5, 0.52, 0.55, 0.5, 0.45, 0.5, 0.5,  // P wave
      0.5, 0.5, 0.5, 0.48, 0.4, 0.5, 0.9, 0.5, 0.3, 0.5,    // QRS complex (spike)
      0.5, 0.5, 0.5, 0.5, 0.52, 0.54, 0.52, 0.5, 0.5, 0.5,  // T wave
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,     // Baseline
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
    ]

    const draw = () => {
      const width = canvas.getBoundingClientRect().width
      const height = canvas.getBoundingClientRect().height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'
      ctx.lineWidth = 1

      // Vertical lines
      const gridSize = 20
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw ECG wave
      ctx.beginPath()
      ctx.strokeStyle = '#06B6D4'
      ctx.lineWidth = 3
      ctx.shadowColor = '#06B6D4'
      ctx.shadowBlur = 15

      const centerY = height / 2
      const amplitude = height * 0.3

      for (let x = 0; x < width; x++) {
        const patternIndex = Math.floor((x + offset) / 8) % ecgPattern.length
        const y = centerY - (ecgPattern[patternIndex] - 0.5) * amplitude

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Trigger heartbeat animation on spike
        if (ecgPattern[patternIndex] > 0.8 && x > width / 2 - 20 && x < width / 2 + 20) {
          setHeartbeat(true)
          setTimeout(() => setHeartbeat(false), 200)
        }
      }

      ctx.stroke()

      // Add glow effect
      ctx.shadowBlur = 25
      ctx.stroke()

      // Reset shadow
      ctx.shadowBlur = 0

      // Update offset
      offset += speed
      if (offset >= ecgPattern.length * 8) {
        offset = 0
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 to-blue-100/30 rounded-3xl blur-2xl" />
      
      {/* Canvas container */}
      <div className="relative w-full h-full bg-white/40 backdrop-blur-sm rounded-3xl border border-cyan-200/50 shadow-xl overflow-hidden p-6">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut'
            }}
            style={{
              left: `${20 + i * 15}%`,
              bottom: '20%'
            }}
          />
        ))}

        {/* Heart icon with pulse */}
        <motion.div
          className="absolute top-6 right-6"
          animate={{
            scale: heartbeat ? [1, 1.3, 1] : 1,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut'
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full blur-xl"
              animate={{
                opacity: heartbeat ? [0.5, 0, 0] : 0,
                scale: heartbeat ? [1, 2] : 1
              }}
              transition={{
                duration: 0.6
              }}
            />
            <Heart
              className={`w-8 h-8 relative z-10 transition-colors duration-200 ${
                heartbeat ? 'text-red-500 fill-red-500' : 'text-red-400 fill-red-400'
              }`}
            />
          </div>
        </motion.div>

        {/* BPM indicator */}
        <motion.div
          className="absolute bottom-6 right-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-cyan-200/50 shadow-lg"
          animate={{
            scale: heartbeat ? [1, 1.05, 1] : 1
          }}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${heartbeat ? 'bg-red-500' : 'bg-cyan-500'} transition-colors duration-200`} />
            <span className="text-sm font-bold text-gray-700">72 BPM</span>
          </div>
        </motion.div>

        {/* Status label */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-green-50 backdrop-blur-sm rounded-xl border border-green-200/50 shadow-sm">
          <span className="text-xs font-semibold text-green-700">● Healthy</span>
        </div>
      </div>
    </div>
  )
}
