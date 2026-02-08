'use client'

import { useState, useEffect } from 'react'

interface ThreadDetailProps {
  threadId: string
}

export function ThreadDetail({ threadId }: ThreadDetailProps) {
  const [thread, setThread] = useState<any>(null)

  useEffect(() => {
    // Mock data
    setThread({
      id: threadId,
      patientUsername: 'patient_123',
      symptoms: ['Headache', 'Fever', 'Fatigue'],
      description: 'I have been experiencing severe headaches for the past 3 days...',
      age: 32,
      gender: 'male',
      duration: '3 days',
      createdAt: new Date()
    })
  }, [threadId])

  if (!thread) return <div>Loading...</div>

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-soft border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center shadow-soft">
          <span className="text-charcoal font-semibold text-lg">
            {thread.patientUsername[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-lg text-charcoal">{thread.patientUsername}</p>
          <p className="text-sm text-gray-500">Posted 2 hours ago</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {thread.symptoms.map((symptom: string, idx: number) => (
            <span
              key={idx}
              className="px-4 py-2 bg-yellow-50 text-charcoal rounded-full font-medium"
            >
              {symptom}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <span className="text-gray-500">Age:</span>
            <span className="ml-2 font-medium text-charcoal">{thread.age}</span>
          </div>
          <div>
            <span className="text-gray-500">Gender:</span>
            <span className="ml-2 font-medium text-charcoal">{thread.gender}</span>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <span className="ml-2 font-medium text-charcoal">{thread.duration}</span>
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{thread.description}</p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200/50">
        <button className="px-6 py-2.5 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all font-semibold shadow-soft hover:shadow-elevated">
          Reply to Thread
        </button>
      </div>
    </div>
  )
}
