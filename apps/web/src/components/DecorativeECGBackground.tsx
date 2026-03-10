'use client'

import { useEffect, useRef } from 'react'

export function DecorativeECGBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    const speed = 1.5

    // Simple ECG pattern (normalized to 0-1)
    const ecgPattern = [
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
      0.5, 0.5, 0.51, 0.53, 0.5, 0.48, 0.5, 0.5, 0.5, 0.5,  // P wave
      0.5, 0.5, 0.5, 0.48, 0.42, 0.5, 0.85, 0.5, 0.35, 0.5,  // QRS complex
      0.5, 0.5, 0.5, 0.5, 0.51, 0.52, 0.51, 0.5, 0.5, 0.5,  // T wave
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
    ]

    const draw = () => {
      const width = canvas.getBoundingClientRect().width
      const height = canvas.getBoundingClientRect().height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw ECG wave
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)' // Cyan with low opacity
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(6, 182, 212, 0.3)'
      ctx.shadowBlur = 8

      const centerY = height / 2
      const amplitude = height * 0.25

      for (let x = 0; x < width; x++) {
        const patternIndex = Math.floor((x + offset) / 6) % ecgPattern.length
        const y = centerY - (ecgPattern[patternIndex] - 0.5) * amplitude

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      // Reset shadow
      ctx.shadowBlur = 0

      // Update offset
      offset += speed
      if (offset >= ecgPattern.length * 6) {
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
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 blur-[0.5px]"
        style={{ mixBlendMode: 'normal' }}
      />
    </div>
  )
}
