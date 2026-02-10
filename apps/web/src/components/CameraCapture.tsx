'use client'

import { useRef, useState, useEffect } from 'react'
import { Camera, RotateCcw, X } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      setStream(mediaStream)
    } catch (err) {
      alert('Camera access denied or not available')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const takePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setPhoto(url)
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      onCapture(file)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const retake = () => {
    setPhoto(null)
    startCamera()
  }

  if (photo) {
    return (
      <div className="space-y-4">
        <img src={photo} alt="Captured" className="w-full rounded-lg border-2 border-green-500" />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setPhoto(null); stopCamera() }}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            <X className="w-4 h-4 inline mr-2" />
            Remove
          </button>
          <button
            type="button"
            onClick={retake}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retake
          </button>
        </div>
      </div>
    )
  }

  if (stream) {
    return (
      <div className="space-y-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
            Position your face in frame
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={stopCamera}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={takePhoto}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Take Photo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Camera className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-2">Profile Photo</h3>
      <p className="text-sm text-gray-500 mb-4">Take a live photo for verification</p>
      <button
        type="button"
        onClick={startCamera}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        Open Camera
      </button>
    </div>
  )
}
