'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { ThreadDetail } from '@/components/ThreadDetail'
import { ReplyList } from '@/components/ReplyList'

export default function ThreadPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ThreadDetail threadId={params.id} />
        <div className="mt-6">
          <ReplyList threadId={params.id} />
        </div>
      </main>
    </div>
  )
}
