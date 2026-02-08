'use client'

import Link from 'next/link'
import { Stethoscope, TrendingUp, Activity, Users } from 'lucide-react'

export function RightSidebar() {
  const topDoctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', reputation: 2450, username: 'dr_sarah_j' },
    { name: 'Dr. Michael Chen', specialty: 'Dermatology', reputation: 1890, username: 'dr_chen_derm' },
    { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', reputation: 1654, username: 'dr_emily_peds' },
    { name: 'Dr. James Wilson', specialty: 'Neurology', reputation: 1432, username: 'dr_wilson_neuro' },
    { name: 'Dr. Lisa Anderson', specialty: 'Orthopedics', reputation: 1289, username: 'dr_lisa_ortho' },
  ]

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
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-charcoal to-charcoal-light h-12"></div>
          <div className="p-4">
            <h3 className="font-bold mb-2 text-charcoal">About MedThread</h3>
            <p className="text-xs text-gray-600 mb-3">
              A trusted community where patients connect with verified healthcare professionals for medical guidance and support.
            </p>
            <Link
              href="/create"
              className="block w-full py-2.5 bg-cyan-500 text-white rounded-full text-sm font-semibold hover:bg-cyan-600 text-center transition-all shadow-soft hover:shadow-elevated"
            >
              Create Post
            </Link>
            <Link
              href="/communities/create"
              className="block w-full mt-2 py-2.5 border-2 border-cyan-500/30 text-cyan-600 rounded-full text-sm font-semibold hover:bg-cyan-50 text-center transition-all"
            >
              Create Community
            </Link>
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200/50">
            <h3 className="font-bold text-sm text-charcoal">Top Doctors This Week</h3>
          </div>
          <div className="p-3">
            {topDoctors.map((doctor, idx) => (
              <Link
                key={doctor.username}
                href={`/u/${doctor.username}`}
                className="flex items-center gap-3 py-2 hover:bg-cream-50/50 rounded-xl px-2 cursor-pointer transition"
              >
                <span className="text-sm font-bold text-gray-500 w-4">{idx + 1}</span>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-charcoal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-charcoal">{doctor.name}</p>
                  <p className="text-xs text-gray-500">{doctor.specialty}</p>
                </div>
                <span className="text-xs text-yellow-200 font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {doctor.reputation}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/doctors"
            className="block px-4 py-2 text-sm text-center text-charcoal hover:bg-cream-50/50 border-t border-gray-200/50 font-semibold transition"
          >
            View All Doctors
          </Link>
        </div>

        {/* Trending Topics */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200/50">
            <h3 className="font-bold text-sm text-charcoal">Trending Topics</h3>
          </div>
          <div className="p-3">
            {trendingTopics.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/search?q=${item.slug}`}
                className="block py-2 hover:bg-cream-50/50 rounded-xl px-2 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">#{idx + 1} Trending</span>
                  <span className="text-xs text-gray-500">{item.posts} posts</span>
                </div>
                <p className="text-sm font-semibold mt-1 text-charcoal">{item.topic}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/trending"
            className="block px-4 py-2 text-sm text-center text-charcoal hover:bg-cream-50/50 border-t border-gray-200/50 font-semibold transition"
          >
            View All Trending
          </Link>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50/80 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-4 shadow-soft">
          <div className="flex gap-2">
            <Activity className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-charcoal mb-1">Medical Disclaimer</p>
              <p className="text-xs text-gray-700">
                Information on MedThread is for educational purposes only. Always consult a qualified healthcare provider.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-600 px-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <Link href="/about" className="hover:text-charcoal transition">About</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-charcoal transition">Help</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-charcoal transition">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-charcoal transition">Privacy</Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Link href="/content-policy" className="hover:text-charcoal transition">Content Policy</Link>
            <span>•</span>
            <Link href="/mod-policy" className="hover:text-charcoal transition">Mod Policy</Link>
          </div>
          <p>© 2026 MedThread, Inc.</p>
        </div>
      </div>
    </aside>
  )
}