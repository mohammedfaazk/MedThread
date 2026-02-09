'use client'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, role, loading } = useUser()
  const router = useRouter()

  // Removed automatic redirection to dashboard. 
  // All users now land on the MedThread main page as requested.

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <PostFeed />
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}
