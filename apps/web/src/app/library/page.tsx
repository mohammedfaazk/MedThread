'use client';

import { useRouter } from 'next/navigation';
import { Bookmark, EyeOff, Clock, Trophy, Coins } from 'lucide-react';
import IridescenceLayout from '@/components/IridescenceLayout';

export default function LibraryPage() {
  const router = useRouter();

  const libraryItems = [
    {
      icon: Bookmark,
      title: 'Saved Posts',
      description: 'View all your saved posts and discussions',
      href: '/saved',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: EyeOff,
      title: 'Hidden Posts',
      description: 'Posts you have hidden from your feed',
      href: '/hidden',
      color: 'from-gray-500 to-slate-500'
    },
    {
      icon: Clock,
      title: 'History',
      description: 'Your browsing and interaction history',
      href: '/history',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'See top contributors and earn badges',
      href: '/leaderboard',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Coins,
      title: 'Coin Shop',
      description: 'Spend your earned coins on awards and perks',
      href: '/shop',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <IridescenceLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Library</h1>
          <p className="text-gray-700">Access your saved content, history, and rewards</p>
        </div>

        {/* Library Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libraryItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="group bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/40 p-6 text-left transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </IridescenceLayout>
  );
}
