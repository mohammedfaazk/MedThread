'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Mic, MicOff, RotateCcw, Minimize2,
  AlertTriangle, Sparkles, ChevronDown
} from 'lucide-react'
import { kendallAI } from '@/lib/kendall/aiService'
import { detectEmergency } from '@/lib/kendall/emergencyDetector'
import type { ChatMessage } from '@/lib/kendall/types'

const SUGGESTED_PROMPTS = [
  "I have a headache",
  "I feel feverish",
  "I have a sore throat",
  "I'm feeling nauseous",
]

const GREETING: ChatMessage = {
  id: 'greeting',
  sender: 'assistant',
  text: "Hi! I'm Kendall 👋 your AI health assistant. I can help with symptom guidance, general health questions, and advice on when to see a doctor.\n\nWhat's on your mind today?",
  timestamp: new Date(),
}

export default function KendallChat() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasEmergency, setHasEmergency] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    if (isOpen) setShowPulse(false)
  }, [isOpen])

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: new Date() },
    ])
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userText = text.trim()
    setInput('')
    addMessage({ sender: 'user', text: userText })
    setIsLoading(true)

    // --- Emergency detection (client-side, no API needed) ---
    const emergency = detectEmergency(userText)
    if (emergency.isEmergency && emergency.protocol) {
      const { condition, warning, actions } = emergency.protocol
      const emergencyText =
        `🚨 EMERGENCY DETECTED: ${condition}\n\n` +
        `⚠️ ${warning}\n\n` +
        `🩹 Immediate steps:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n` +
        `📍 Redirecting you to nearby hospitals...`

      setHasEmergency(true)
      addMessage({ sender: 'assistant', text: emergencyText, isEmergency: true })
      setIsLoading(false)

      // Navigate to /find-hospitals after a short delay
      setTimeout(() => {
        router.push('/find-hospitals')
      }, 2500)
      return
    }

    // --- Normal AI path ---
    try {
      const response = await kendallAI.chat(userText)
      addMessage({ sender: 'assistant', text: response })
    } catch {
      addMessage({
        sender: 'assistant',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, addMessage, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleReset = () => {
    kendallAI.reset()
    setMessages([GREETING])
    setHasEmergency(false)
    setInput('')
  }

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
            aria-label="Open Kendall AI Health Assistant"
          >
            {showPulse && (
              <span className="absolute inset-0 rounded-full animate-ping bg-sky-400 opacity-40" />
            )}
            <span className="text-2xl">🩺</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 1, height: 64 }
                : { opacity: 1, y: 0, scale: 1, height: 'auto' }
            }
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148,163,184,0.2)',
              maxHeight: isMinimized ? 64 : 580,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
                🩺
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold text-sm">Kendall</span>
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/80 text-xs">AI Health Assistant</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset() }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="New conversation"
                >
                  <RotateCcw className="w-4 h-4 text-white/80" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized
                    ? <ChevronDown className="w-4 h-4 text-white/80 rotate-180" />
                    : <Minimize2 className="w-4 h-4 text-white/80" />
                  }
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Emergency Banner */}
                <AnimatePresence>
                  {hasEmergency && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-red-600 px-4 py-2.5 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-white flex-shrink-0" />
                      <p className="text-xs text-white font-semibold flex-1">
                        🚨 Emergency detected — redirecting to nearby hospitals...
                      </p>
                      <button
                        onClick={() => router.push('/find-hospitals')}
                        className="text-xs bg-white text-red-600 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        Go now →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Disclaimer */}
                {!hasEmergency && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                    <p className="text-xs text-amber-700">
                      ⚕️ For informational purposes only. Not a substitute for professional medical advice.
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 280, maxHeight: 320 }}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5 ${
                          msg.isEmergency
                            ? 'bg-red-500'
                            : 'bg-gradient-to-br from-sky-400 to-indigo-500'
                        }`}>
                          {msg.isEmergency ? '🚑' : '🩺'}
                        </div>
                      )}
                      <div className="max-w-[82%]">
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-tr-sm'
                              : msg.isEmergency
                              ? 'bg-red-600 text-white border border-red-700 rounded-tl-sm font-medium'
                              : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                          }`}
                        >
                          {msg.text}
                          {msg.isEmergency && (
                            <button
                              onClick={() => router.push('/find-hospitals')}
                              className="mt-3 w-full flex items-center justify-center gap-2 bg-white text-red-600 font-bold text-xs py-2 px-3 rounded-xl hover:bg-red-50 transition-colors"
                            >
                              🏥 Find Nearby Hospitals →
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                        🩺
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                              className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested prompts */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="px-3 pb-3 pt-2 border-t border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Kendall anything health-related..."
                      disabled={isLoading}
                      className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={toggleVoice}
                      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                        isListening
                          ? 'bg-red-100 text-red-600'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                      }`}
                      title={isListening ? 'Stop listening' : 'Voice input'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="p-1.5 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
                      title="Send"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 mt-1.5">
                    Powered by Gemini AI · Not medical advice
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
