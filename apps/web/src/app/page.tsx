'use client'
import dynamic from 'next/dynamic'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { Suspense } from 'react'
import StructuredData, { structuredDataSchemas } from '@/components/StructuredData'
import IridescenceCSS from '@/components/ui/IridescenceCSS'
import { MedicalDisclaimer, EmergencyBanner } from '@/components/MedicalDisclaimer'

// Lazy-load heavy components
const Navbar = dynamic(() => import('@/components/Navbar').then(m => ({ default: m.Navbar })), { 
  ssr: false,
  loading: () => <div className="h-16 bg-white/40 backdrop-blur-md" />
})

const Sidebar = dynamic(() => import('@/components/Sidebar').then(m => ({ default: m.Sidebar })), { 
  ssr: false,
  loading: () => <div className="w-[260px] h-screen bg-white/40 backdrop-blur-md rounded-2xl animate-pulse" />
})

const PostFeed = dynamic(() => import('@/components/PostFeed').then(m => ({ default: m.PostFeed })), { 
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
})

const RightSidebar = dynamic(() => import('@/components/RightSidebar').then(m => ({ default: m.RightSidebar })), { 
  ssr: false,
  loading: () => <div className="w-80 h-screen bg-white/40 backdrop-blur-md rounded-2xl animate-pulse" />
})

const KendallChat = dynamic(() => import('@/components/KendallChat'), { 
  ssr: false,
  loading: () => null
})

export default function Home() {
  const { user, role, loading } = useJWTAuth()

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

        <Suspense fallback={<div className="h-16 bg-white/40 backdrop-blur-md" />}>
          <Navbar />
        </Suspense>
        
        <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12 h-screen overflow-hidden">
          <Suspense fallback={<div className="w-[260px] h-screen bg-white/40 backdrop-blur-md rounded-2xl animate-pulse" />}>
            <Sidebar />
          </Suspense>
          
          <main className="flex-1 max-w-[640px] overflow-y-auto h-[calc(100vh-88px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            <EmergencyBanner className="mb-6" />
            <MedicalDisclaimer className="mb-6" />
            <Suspense fallback={
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            }>
              <PostFeed />
            </Suspense>
          </main>
          
          <Suspense fallback={<div className="w-80 h-screen bg-white/40 backdrop-blur-md rounded-2xl animate-pulse" />}>
            <RightSidebar />
          </Suspense>
        </div>

        {/* Kendall AI Assistant — visible only to logged-in patients */}
        {isPatient && (
          <Suspense fallback={null}>
            <KendallChat />
          </Suspense>
        )}
      </div>
    </>
  )
}
