'use client'

import { useState, useEffect } from 'react'
import { ThreadCard } from './ThreadCard'

export function ThreadFeed() {
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setThreads([
      {
        id: '1',
        patientUsername: 'patient_123',
        symptoms: ['Headache', 'Fever', 'Fatigue'],
        severity: 'MODERATE',
        doctorResponseCount: 2,
        replyCount: 5,
        upvotes: 12,
        createdAt: new Date()
      },
      {
        id: '2',
        patientUsername: 'patient_456',
        symptoms: ['Chest Pain', 'Shortness of Breath'],
        severity: 'HIGH',
        doctorResponseCount: 3,
        replyCount: 8,
        upvotes: 24,
        createdAt: new Date()
      }
    ])
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading threads...</div>
  }

  return (
    <div className="space-y-4">
      {threads.map(thread => (
        <ThreadCard key={thread.id} {...thread} />
      ))}
    </div>
  )
}
