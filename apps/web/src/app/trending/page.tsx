'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'

export default function TrendingPage() {
  const trending = [
    { topic: 'COVID-19 Vaccines', posts: 234, slug: 'covid-vaccines', growth: '+45%' },
    { topic: 'Mental Health', posts: 189, slug: 'mental-health', growth: '+32%' },
    { topic: 'Diabetes Management', posts: 156, slug: 'diabetes', growth: '+28%' },
    { topic: 'Sleep Disorders', posts: 143, slug: 'sleep', growth: '+25%' },
    { topic: 'Weight Loss', posts: 128, slug: 'weight-loss', growth: '+22%' },
    { topic: 'Heart Health', posts: 115, slug: 'heart-health', growth: '+20%' },
    { topic: 'Skin Care', posts: 98, slug: 'skin-care', growth: '+18%' },
    { topic: 'Exercise Tips', posts: 87, slug: 'exercise', growth: '+15%' },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[900px]">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-4 shadow-soft">
            <h1 className="text-3xl font-bold mb-2 text-charcoal">Trending Topics</h1>
            <p className="text-gray-600">Most discussed health topics right now</p>
          </div>

          <div className="space-y-3">
            {trending.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/search?q=${item.slug}`}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:border-yellow-200/50 hover:shadow-elevated transition block shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                    <div>
                      <h3 className="font-bold text-lg text-charcoal">{item.topic}</h3>
                      <p className="text-sm text-gray-600">{item.posts} posts</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100/80 backdrop-blur-sm text-green-700 rounded-full text-sm font-semibold">
                    {item.growth}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}