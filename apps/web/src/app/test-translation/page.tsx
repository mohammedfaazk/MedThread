'use client'

import { useState } from 'react'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
]

export default function TestTranslationPage() {
  const [text, setText] = useState('Hello, how are you today?')
  const [targetLang, setTargetLang] = useState('hi')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTranslate = async () => {
    setLoading(true)
    setError('')
    setTranslatedText('')

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${API_URL}/api/v1/technical/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          targetLang,
          sourceLang: 'en'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setTranslatedText(result.data.translatedText)
      } else {
        setError(result.error || 'Translation failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <NavbarEnhanced />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
            <h1 className="text-3xl font-bold text-charcoal mb-2">Translation Test</h1>
            <p className="text-gray-600 mb-6">Test the free LibreTranslate API</p>

            <div className="space-y-6">
              {/* Input Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text to Translate
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter text in English..."
                />
              </div>

              {/* Target Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Language
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={loading || !text.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? 'Translating...' : 'Translate'}
              </button>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">Error: {error}</p>
                </div>
              )}

              {/* Result */}
              {translatedText && (
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Translation:</h3>
                  <p className="text-lg text-gray-900">{translatedText}</p>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ About</h3>
                <p className="text-sm text-blue-700">
                  This uses the free LibreTranslate API. No API key required!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IridescenceLayout>
  )
}
