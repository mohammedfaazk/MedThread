'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export function ECGWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spike, setSpike] = useState(false)
  const spikeRef = useRef(false)
  const lastSpikeTimeRef = useRef(0)

  useEffect(() => {
    spikeRef.current = spike
  }, [spike])

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
    let shimmerOffset = 0

    // Enhanced ECG pattern - one complete heartbeat cycle
    const ecgPattern = [
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,  // baseline
      0.5, 0.5, 0.51, 0.54, 0.52, 0.49, 0.5, 0.5,  // P wave
      0.5, 0.5, 0.47, 0.38, 0.5, 0.95, 0.5, 0.28,  // QRS complex (spike)
      0.5, 0.5, 0.5, 0.52, 0.55, 0.53, 0.5, 0.5,  // T wave
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,  // baseline
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,  // baseline
    ]

    const getPatternValue = (position: number) => {
      const index = Math.floor(position)
      const t = position - index
      
      const currentIndex = index % ecgPattern.length
      const nextIndex = (index + 1) % ecgPattern.length
      
      const currentValue = ecgPattern[currentIndex]
      const nextValue = ecgPattern[nextIndex]
      
      // Smooth cosine interpolation
      const smoothT = (1 - Math.cos(t * Math.PI)) / 2
      return currentValue + (nextValue - currentValue) * smoothT
    }

    const draw = () => {
      const width = canvas.getBoundingClientRect().width
      const height = canvas.getBoundingClientRect().height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      const centerY = height / 2
      const amplitude = height * 0.4
      const pixelsPerPoint = 10

      // Draw multiple layered ECG waves for depth
      const layers = [
        { opacity: 0.15, offsetX: 0, blur: 0, lineWidth: 1.5 },
        { opacity: 0.3, offsetX: -15, blur: 5, lineWidth: 2 },
        { opacity: 0.6, offsetX: 0, blur: 10, lineWidth: 2.5 },
        { opacity: 1, offsetX: 0, blur: 15, lineWidth: 3 },
      ]

      layers.forEach((layer, layerIndex) => {
        ctx.beginPath()
        
        // Gradient stroke
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, `rgba(6, 182, 212, ${layer.opacity * 0.6})`)
        gradient.addColorStop(0.5, `rgba(6, 182, 212, ${layer.opacity})`)
        gradient.addColorStop(1, `rgba(34, 211, 238, ${layer.opacity * 0.7})`)
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = layer.lineWidth
        ctx.shadowColor = '#06B6D4'
        ctx.shadowBlur = layer.blur

        // Draw the wave continuously across the entire width
        for (let x = 0; x <= width; x++) {
          const scrollPosition = (x - offset + layer.offsetX) / pixelsPerPoint
          const interpolated = getPatternValue(scrollPosition)
          const y = centerY - (interpolated - 0.5) * amplitude

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          // Trigger spike animation when spike passes through center
          if (layerIndex === 3 && interpolated > 0.85 && x > width / 2 - 20 && x < width / 2 + 20) {
            const now = Date.now()
            if (!spikeRef.current && now - lastSpikeTimeRef.current > 1000) {
              lastSpikeTimeRef.current = now
              setSpike(true)
              setTimeout(() => setSpike(false), 300)
            }
          }
        }

        ctx.stroke()
      })

      // Shimmer effect
      shimmerOffset += 0.5
      if (shimmerOffset > width + 200) {
        shimmerOffset = -200
      }

      const shimmerGradient = ctx.createLinearGradient(shimmerOffset - 100, 0, shimmerOffset + 100, 0)
      shimmerGradient.addColorStop(0, 'rgba(6, 182, 212, 0)')
      shimmerGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)')
      shimmerGradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

      ctx.fillStyle = shimmerGradient
      ctx.fillRect(shimmerOffset - 100, 0, 200, height)

      // Reset shadow
      ctx.shadowBlur = 0

      // Update offset for continuous scrolling - no modulo, just keep incrementing
      offset += speed

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', updateSize)
    }
  }, []) // Empty dependency array - never restart

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Spike burst effect */}
      {spike && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-400 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-300 rounded-full blur-2xl"
          />
        </>
      )}
    </div>
  )
}
