'use client'

import { useStore } from '@/store/useStore'
import { User, Stethoscope, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

interface PostDetailProps {
  postId: string
}

export function PostDetail({ postId }: PostDetailProps) {
  const { posts, votePost, savePost, setPosts } = useStore()
  
  // Initialize posts if empty (for direct navigation/refresh)
  useEffect(() => {
    if (posts.length === 0) {
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
    }
  }, [posts.length, setPosts])
  
  const post = posts.find(p => p.id === postId)

  if (!post) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-lg">
        <p className="text-gray-500">Loading post...</p>
      </div>
    )
  }

  const handleVote = (value: 1 | -1) => {
    votePost(postId, value)
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-lg hover:shadow-xl transition-all">
      <div className="flex">
        {/* Vote Section */}
        <div className="w-10 bg-neutral-300/10 backdrop-blur-sm flex flex-col items-center py-4 rounded-l-2xl border-r border-neutral-400/20">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 hover:bg-neutral-300/30 rounded-lg transition-all ${
              post.userVote === 1 ? 'text-[#FF4500]' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={post.userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-sm font-bold my-2 ${
            post.userVote === 1 ? 'text-[#FF4500]' : post.userVote === -1 ? 'text-[#7193ff]' : ''
          }`}>
            {post.score}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 hover:bg-neutral-300/30 rounded-lg transition-all ${
              post.userVote === -1 ? 'text-[#7193ff]' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill={post.userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="font-semibold hover:underline cursor-pointer flex items-center gap-1">
              {post.authorType === 'doctor' ? <Stethoscope className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {post.author}
            </span>
            {post.verified && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
            <span className="text-gray-500">• {post.timeAgo}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* Content */}
          <div className="prose max-w-none mb-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-neutral-400/20">
            <button className="flex items-center gap-2 hover:bg-neutral-300/20 px-3 py-2 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-semibold">{post.comments} Comments</span>
            </button>
            <button className="flex items-center gap-2 hover:bg-neutral-300/20 px-3 py-2 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
            <button
              onClick={() => savePost(postId)}
              className={`flex items-center gap-2 hover:bg-neutral-300/20 px-3 py-2 rounded-xl transition-all ${
                post.isSaved ? 'text-[#FF4500] font-semibold' : ''
              }`}
            >
              <svg className="w-5 h-5" fill={post.isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{post.isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}