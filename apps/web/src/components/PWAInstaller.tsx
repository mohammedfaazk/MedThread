'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installed')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#5CB8B2] to-[#4DA9A3] rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 mb-1">
              Install MedThread
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get quick access and work offline with our app
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-[#5CB8B2] to-[#4DA9A3] text-white py-2 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
