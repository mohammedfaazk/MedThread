'use client'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import StructuredData, { structuredDataSchemas } from '@/components/StructuredData'
import IridescenceCSS from '@/components/ui/IridescenceCSS'

export default function Home() {
  const { user, role, loading } = useJWTAuth()
  const router = useRouter()

  // Force recompilation to trigger ogl error

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={structuredDataSchemas.organization()} />
      <StructuredData data={structuredDataSchemas.website()} />
      <StructuredData data={structuredDataSchemas.medicalOrganization()} />
      
      <div className="min-h-screen relative">
        {/* Iridescent Background - MedThread brand colors (cyan/blue tones) */}
        <div className="fixed inset-0 -z-10">
          <IridescenceCSS 
            color={[0.4, 0.7, 0.9]} 
            mouseReact 
            amplitude={0.1} 
            speed={0.8} 
          />
        </div>

        <Navbar />
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
