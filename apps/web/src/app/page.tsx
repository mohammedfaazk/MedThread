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
import dynamic from 'next/dynamic'

// Lazy-load Kendall so it doesn't affect initial page load
const KendallChat = dynamic(() => import('@/components/KendallChat'), { ssr: false })

export default function Home() {
  const { user, role, loading } = useJWTAuth()
  const router = useRouter()

  const isPatient = !loading && user && role === 'PATIENT'

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={structuredDataSchemas.organization()} />
      <StructuredData data={structuredDataSchemas.website()} />
      <StructuredData data={structuredDataSchemas.medicalOrganization()} />
      
      <div className="min-h-screen relative">
        {/* Iridescent Background - MedThread brand colors (cyan/blue/purple tones) */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <IridescenceCSS 
            color={[0.3, 0.6, 0.95]} 
            mouseReact 
            amplitude={0.3} 
            speed={0.6} 
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

        {/* Kendall AI Assistant — visible only to logged-in patients */}
        {isPatient && <KendallChat />}
      </div>
    </>
  )
}
