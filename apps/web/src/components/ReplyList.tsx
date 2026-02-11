'use client'

import { useState, useEffect } from 'react'
import { ReplyCard } from './ReplyCard'

interface ReplyListProps {
  threadId: string
}

export function ReplyList({ threadId }: ReplyListProps) {
  const [replies, setReplies] = useState<any[]>([])

  useEffect(() => {
    // Mock data
    setReplies([
      {
        id: '1',
        authorName: 'Dr. Sarah Johnson',
        authorRole: 'VERIFIED_DOCTOR',
        content: 'Based on your symptoms, this could be a viral infection. I recommend rest and hydration.',
        isDoctorVerified: true,
        helpfulCount: 15,
        createdAt: new Date()
      },
      {
        id: '2',
        authorName: 'John Doe',
        authorRole: 'PATIENT',
        content: 'I had similar symptoms last month. It took about a week to recover.',
        isDoctorVerified: false,
        helpfulCount: 3,
        createdAt: new Date()
      }
    ])
  }, [threadId])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Responses ({replies.length})</h2>
      {replies.map(reply => (
        <ReplyCard key={reply.id} {...reply} />
      ))}
    </div>
  )
}
