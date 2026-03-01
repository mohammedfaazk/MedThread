'use client'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import StructuredData, { structuredDataSchemas } from '@/components/StructuredData'

export default function Home() {
  const { user, role, loading } = useJWTAuth()
  const router = useRouter()

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={structuredDataSchemas.organization()} />
      <StructuredData data={structuredDataSchemas.website()} />
      <StructuredData data={structuredDataSchemas.medicalOrganization()} />
      
      <div className="min-h-screen">
        <NavbarEnhanced />
        <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
          <Sidebar />
          <main className="flex-1 max-w-[640px]">
            <PostFeed />
          </main>
          <RightSidebar />
        </div>
      </div>
    </>
  )
}
