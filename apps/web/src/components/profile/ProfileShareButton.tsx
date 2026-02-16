'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Mail, MessageCircle } from 'lucide-react'

interface ProfileShareButtonProps {
  username: string
}

export default function ProfileShareButton({ username }: ProfileShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const profileUrl = `${window.location.origin}/doctor/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out Dr. ${username}'s profile on MedThread`)
    const body = encodeURIComponent(`I thought you might be interested in Dr. ${username}'s professional profile:\n\n${profileUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Check out Dr. ${username}'s profile on MedThread: ${profileUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Check out Dr. ${username}'s professional profile on MedThread`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(profileUrl)}`, '_blank')
  }

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Share2 className="w-4 h-4" />
        Share Profile
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Copy Link</span>
                  </>
                )}
              </button>

              <button
                onClick={shareViaEmail}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Share via Email</span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Share on WhatsApp</span>
              </button>

              <button
                onClick={shareViaTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DA1F2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
                <span className="text-gray-700">Share on Twitter</span>
              </button>

              <button
                onClick={shareViaLinkedIn}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-gray-700">Share on LinkedIn</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
