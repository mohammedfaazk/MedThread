'use client'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, role, loading } = useJWTAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <PostFeed />
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}
