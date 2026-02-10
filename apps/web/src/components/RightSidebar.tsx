'use client'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function RightSidebar() {
  const [topDoctors, setTopDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopDoctors()
  }, [])

  const fetchTopDoctors = async () => {
    try {
      // Fetch from API first
      console.log('[UI] Loading doctors from API...');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      try {
        const response = await fetch(`${API_URL}/api/v1/doctor-verification/verified`);
        if (response.ok) {
          const data = await response.json();
          console.log('[UI] API Response:', data);
          
          // API returns { success: true, data: { doctors: [...] } }
          const doctorsList = data?.data?.doctors || data?.doctors || [];
          
          if (doctorsList.length > 0) {
            console.log(`[UI] Found ${doctorsList.length} verified doctors from API`);
            // Sort by totalKarma/reputation and limit to 5
            const sortedDoctors = doctorsList
              .sort((a: any, b: any) => (b.totalKarma || b.reputation_score || 0) - (a.totalKarma || a.reputation_score || 0))
              .slice(0, 5);
            setTopDoctors(sortedDoctors);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('[UI] API fetch failed, falling back to JSON:', apiError);
      }
      
      // Fallback to local JSON data
      console.log('[UI] Loading doctors from doctor_data.json');
      try {
        const response = await fetch('/doctor_data.json');
        if (response.ok) {
          const doctorData = await response.json();
          // Sort by reputation_score if available, limit to 5
          const sortedDoctors = doctorData
            .sort((a: any, b: any) => (b.reputation_score || 0) - (a.reputation_score || 0))
            .slice(0, 5);
          setTopDoctors(sortedDoctors);
        } else {
          console.warn('[UI] Failed to load doctor_data.json');
        }
      } catch (jsonError) {
        console.error('[UI] Error loading doctor_data.json:', jsonError);
      }
    } catch (error) {
      console.error('Error fetching top doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const trendingTopics = [
    { topic: 'COVID-19 Vaccines', posts: 234, slug: 'covid-vaccines' },
    { topic: 'Mental Health', posts: 189, slug: 'mental-health' },
    { topic: 'Diabetes Management', posts: 156, slug: 'diabetes' },
    { topic: 'Sleep Disorders', posts: 143, slug: 'sleep' },
    { topic: 'Weight Loss', posts: 128, slug: 'weight-loss' },
  ]

  return (
    <aside className="hidden xl:block w-[312px] shrink-0">
      <div className="sticky top-[68px] space-y-4">
        {/* About */}
        <div className="bg-white rounded border border-gray-300 overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF4500] to-[#ff6b35] h-12"></div>
          <div className="p-4">
            <h3 className="font-bold mb-2">About MedThread</h3>
            <p className="text-xs text-gray-600 mb-3">
              A trusted community where patients connect with verified healthcare professionals for medical guidance and support.
            </p>
            <Link
              href="/create"
              className="block w-full py-2 bg-[#FF4500] text-white rounded-full text-sm font-semibold hover:bg-[#ff5722] text-center"
            >
              Create Post
            </Link>
            <Link
              href="/communities/create"
              className="block w-full mt-2 py-2 border border-[#FF4500] text-[#FF4500] rounded-full text-sm font-semibold hover:bg-orange-50 text-center"
            >
              Create Community
            </Link>
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-white rounded border border-gray-300">
          <div className="px-4 py-3 border-b border-gray-300">
            <h3 className="font-bold text-sm">Top Doctors This Week</h3>
          </div>
          <div className="p-3">
            {loading ? (
              <p className="text-xs text-center text-gray-500 py-4">Loading top doctors...</p>
            ) : topDoctors.length === 0 ? (
              <p className="text-xs text-center text-gray-500 py-4">No doctors found</p>
            ) : (
              topDoctors.map((doctor, idx) => {
                const displayUsername = doctor.username || doctor.id;
                const displayName = doctor.full_name || doctor.name || `Dr. ${displayUsername}`;
                const reputation = doctor.reputation_score || doctor.reputation || 0;

                return (
                  <Link
                    key={doctor.id}
                    href={`/u/${displayUsername}`}
                    className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-gray-500 w-4">{idx + 1}</span>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">👨‍⚕️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{doctor.specialty || 'Verified Doctor'}</p>
                    </div>
                    <span className="text-xs text-[#FF4500] font-semibold">⭐ {reputation}</span>
                  </Link>
                )
              })
            )}
          </div>
          <Link
            href="/doctors"
            className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-gray-50 border-t border-gray-200 font-semibold"
          >
            View All Doctors
          </Link>
        </div>

        {/* Trending Topics */}
        <div className="bg-white rounded border border-gray-300">
          <div className="px-4 py-3 border-b border-gray-300">
            <h3 className="font-bold text-sm">Trending Topics</h3>
          </div>
          <div className="p-3">
            {trendingTopics.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/search?q=${item.slug}`}
                className="block py-2 hover:bg-gray-50 rounded px-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">#{idx + 1} Trending</span>
                  <span className="text-xs text-gray-500">{item.posts} posts</span>
                </div>
                <p className="text-sm font-semibold mt-1">{item.topic}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/trending"
            className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-gray-50 border-t border-gray-200 font-semibold"
          >
            View All Trending
          </Link>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-blue-50 rounded border border-blue-200 p-4">
          <div className="flex gap-2">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Medical Disclaimer</p>
              <p className="text-xs text-blue-700">
                Information on MedThread is for educational purposes only. Always consult a qualified healthcare provider.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-500 px-4">
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
          </div>
          <p>© 2024 MedThread, Inc.</p>
        </div>
      </div>
    </aside>
  )
}