'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useJWTAuth } from '@/context/JWTAuthContext'

const CreatePostModal = dynamic(() => import('./CreatePostModal').then(m => ({ default: m.CreatePostModal })), { ssr: false })
const PatientCreatePostModal = dynamic(() => import('./PatientCreatePostModal').then(m => ({ default: m.PatientCreatePostModal })), { ssr: false })
import { TrendingUp, Info } from 'lucide-react'
import CountUp from './enhancements/CountUp'
import { TopDoctorsWidget } from './TopDoctorsWidget'

export function RightSidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { role } = useJWTAuth()

  const isPatient = role === 'PATIENT'

  const trendingTopics = [
    { topic: 'COVID-19 Vaccines', posts: 234, slug: 'covid-vaccines' },
    { topic: 'Mental Health', posts: 189, slug: 'mental-health' },
    { topic: 'Diabetes Management', posts: 156, slug: 'diabetes' },
    { topic: 'Sleep Disorders', posts: 143, slug: 'sleep' },
    { topic: 'Weight Loss', posts: 128, slug: 'weight-loss' },
  ]

  return (
    <aside className="hidden xl:block w-[312px] shrink-0">
      <div className="sticky top-[68px] h-[calc(100vh-84px)] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {/* About */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-lg">
          <div className="bg-[#00BCD4] h-12"></div>
          <div className="p-4">
            <h3 className="font-bold mb-2">About MedThread</h3>
            <p className="text-xs text-gray-600 mb-3">
              A trusted community where patients connect with verified healthcare professionals for medical guidance and support.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="block w-full py-2 bg-[#00BCD4] text-white rounded-full text-sm font-semibold hover:bg-[#00ACC1] text-center transition-all shadow-lg hover:shadow-xl"
            >
              {isPatient ? 'Ask a Question' : 'Create Post'}
            </button>
            <Link
              href="/communities/create"
              className="block w-full mt-2 py-2 border-2 border-[#00BCD4] text-[#00BCD4] rounded-full text-sm font-semibold hover:bg-[#00BCD4]/10 backdrop-blur-sm text-center transition-all"
            >
              Create Community
            </Link>
          </div>
        </div>

        {/* Top Doctors - New Enhanced Widget */}
        <TopDoctorsWidget />

        {/* Trending Topics */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
          <div className="px-4 py-3 border-b border-cyan-200/30">
            <h3 className="font-bold text-sm text-gray-800">Trending Topics</h3>
          </div>
          <div className="p-3">
            {trendingTopics.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/search?q=${item.slug}`}
                className="block py-2 hover:bg-gray-50 rounded-xl px-2 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    #{idx + 1} Trending
                  </span>
                  <span className="text-xs text-gray-500">
                    <CountUp from={0} to={item.posts} duration={1.5} className="inline" /> posts
                  </span>
                </div>
                <p className="text-sm font-semibold mt-1">{item.topic}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/trending"
            className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-cyan-50/50 border-t border-cyan-200/30 font-semibold transition-all"
          >
            View All Trending
          </Link>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-blue-50/50 backdrop-blur-xl rounded-2xl border border-blue-200/30 p-4 shadow-lg">
          <div className="flex gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Medical Disclaimer</p>
              <p className="text-xs text-blue-700">
                Information on MedThread is for educational purposes only. Always consult a qualified healthcare provider.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-900 px-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Link href="/about" className="hover:underline">About</Link>
            <span>•</span>
            <Link href="/help" className="hover:underline">Help</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Link href="/content-policy" className="hover:underline">Content Policy</Link>
            <span>•</span>
            <Link href="/mod-policy" className="hover:underline">Mod Policy</Link>
            <span>•</span>
            <Link href="/content-guidelines" className="hover:underline">Medical Guidelines</Link>
          </div>
          <p>© 2026 MedThread, Inc.</p>
        </div>
      </div>

      {isPatient
        ? <PatientCreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        : <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      }
    </aside>
  )
}