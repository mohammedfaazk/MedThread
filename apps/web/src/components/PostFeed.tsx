'use client'

import { useStore } from '@/store/useStore'
import { PostCard } from './PostCard'
import { useEffect } from 'react'
import { Flame, Sparkles, ArrowUp, TrendingUp } from 'lucide-react'

interface PostFeedProps {
  community?: string
}

export function PostFeed({ community }: PostFeedProps = {}) {
  const { posts, setPosts, sortBy, setSortBy } = useStore()

  useEffect(() => {
    // Initialize with mock data
    setPosts([
      {
        id: '1',
        type: 'text',
        author: 'patient_anonymous',
        authorType: 'patient',
        community: 'general',
        timeAgo: '2 hours ago',
        title: 'Persistent headaches for 3 days - should I be concerned?',
        content: 'I\'ve been experiencing severe headaches for the past 3 days. They seem to get worse in the evening. I\'m 32F, no prior medical conditions. Taking ibuprofen helps temporarily but the pain returns. Should I see a doctor?',
        tags: ['Headache', 'Pain', 'General Health'],
        upvotes: 24,
        downvotes: 2,
        score: 22,
        comments: 12,
        doctorReplies: 3,
        userVote: null,
        isSaved: false,
        isHidden: false
      },
      {
        id: '2',
        type: 'text',
        author: 'Dr_Sarah_Johnson',
        authorType: 'doctor',
        verified: true,
        specialty: 'Cardiology',
        community: 'cardiology',
        timeAgo: '4 hours ago',
        title: 'Understanding Blood Pressure Readings - A Doctor\'s Guide',
        content: 'Many patients ask me about blood pressure numbers. Here\'s what you need to know: Normal BP is below 120/80. Elevated is 120-129/<80. Stage 1 hypertension is 130-139/80-89. Let me know if you have questions!',
        tags: ['Cardiology', 'Education', 'Blood Pressure'],
        upvotes: 156,
        downvotes: 8,
        score: 148,
        comments: 45,
        doctorReplies: 8,
        isPinned: true,
        userVote: null,
        isSaved: false,
        isHidden: false
      },
      {
        id: '3',
        type: 'text',
        author: 'concerned_parent',
        authorType: 'patient',
        community: 'pediatrics',
        timeAgo: '6 hours ago',
        title: 'My 5-year-old has a fever of 102°F - when should I go to ER?',
        content: 'My daughter has had a fever since this morning. It\'s currently 102°F. She\'s drinking fluids and somewhat active. No other symptoms. Is this ER-worthy or can I wait for pediatrician tomorrow?',
        tags: ['Pediatrics', 'Fever', 'Emergency'],
        upvotes: 67,
        downvotes: 3,
        score: 64,
        comments: 34,
        doctorReplies: 5,
        userVote: null,
        isSaved: false,
        isHidden: false
      },
      {
        id: '4',
        type: 'text',
        author: 'fitness_enthusiast',
        authorType: 'patient',
        community: 'orthopedics',
        timeAgo: '8 hours ago',
        title: 'Knee pain after running - is this normal?',
        content: 'Started running 3 weeks ago. Now experiencing pain on the outside of my right knee. It hurts when going down stairs. Should I stop running? Any exercises that might help?',
        tags: ['Orthopedics', 'Sports Medicine', 'Knee Pain'],
        upvotes: 42,
        downvotes: 1,
        score: 41,
        comments: 28,
        doctorReplies: 4,
        userVote: null,
        isSaved: false,
        isHidden: false
      },
      {
        id: '5',
        type: 'text',
        author: 'Dr_Michael_Chen',
        authorType: 'doctor',
        verified: true,
        specialty: 'Dermatology',
        community: 'dermatology',
        timeAgo: '10 hours ago',
        title: 'Skin Cancer Awareness: What to Look For',
        content: 'Remember the ABCDE rule for melanoma: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving. Check your skin monthly and see a dermatologist annually if you have risk factors.',
        tags: ['Dermatology', 'Prevention', 'Cancer Screening'],
        upvotes: 234,
        downvotes: 12,
        score: 222,
        comments: 56,
        doctorReplies: 12,
        userVote: null,
        isSaved: false,
        isHidden: false
      }
    ])
  }, [])

  // Filter posts by community if specified
  const filteredPosts = community 
    ? posts.filter(post => post.community === community && !post.isHidden)
    : posts.filter(post => !post.isHidden)

  // Sort posts based on sortBy state
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'hot':
        // Hot algorithm: score / (time_hours + 2)^1.5
        const aHours = parseTimeAgo(a.timeAgo)
        const bHours = parseTimeAgo(b.timeAgo)
        const aHot = a.score / Math.pow(aHours + 2, 1.5)
        const bHot = b.score / Math.pow(bHours + 2, 1.5)
        return bHot - aHot
      
      case 'new':
        // Sort by time (newest first)
        return parseTimeAgo(a.timeAgo) - parseTimeAgo(b.timeAgo)
      
      case 'top':
        // Sort by score (highest first)
        return b.score - a.score
      
      case 'rising':
        // Rising: recent posts with good engagement
        const aRising = a.score / (parseTimeAgo(a.timeAgo) + 1)
        const bRising = b.score / (parseTimeAgo(b.timeAgo) + 1)
        return bRising - aRising
      
      default:
        return 0
    }
  })

  return (
    <div className="space-y-3">
      {/* Sort Options */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-3 flex items-center gap-2 shadow-soft">
        <button
          onClick={() => setSortBy('hot')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'hot' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <Flame className="w-4 h-4" />
          Hot
        </button>
        <button
          onClick={() => setSortBy('new')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'new' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          New
        </button>
        <button
          onClick={() => setSortBy('top')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'top' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
          Top
        </button>
        <button
          onClick={() => setSortBy('rising')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'rising' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Rising
        </button>
      </div>

      {/* Posts */}
      {sortedPosts.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <p className="text-gray-500">No posts found in this community yet.</p>
        </div>
      ) : (
        sortedPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))
      )}
    </div>
  )
}

// Helper function to parse timeAgo string to hours
function parseTimeAgo(timeAgo: string): number {
  const match = timeAgo.match(/(\d+)\s*(hour|minute|day|week|month|year)/)
  if (!match) return 0
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  switch (unit) {
    case 'minute': return value / 60
    case 'hour': return value
    case 'day': return value * 24
    case 'week': return value * 24 * 7
    case 'month': return value * 24 * 30
    case 'year': return value * 24 * 365
    default: return 0
  }
}