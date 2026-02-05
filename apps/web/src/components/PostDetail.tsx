'use client'

import { useStore } from '@/store/useStore'

interface PostDetailProps {
  postId: string
}

export function PostDetail({ postId }: PostDetailProps) {
  const { posts, votePost, savePost } = useStore()
  const post = posts.find(p => p.id === postId)

  if (!post) {
    return <div className="bg-white rounded border border-gray-300 p-8 text-center">Post not found</div>
  }

  const handleVote = (value: 1 | -1) => {
    votePost(postId, value)
  }

  return (
    <div className="bg-white rounded border border-gray-300 mb-4">
      <div className="flex">
        {/* Vote Section */}
        <div className="w-10 bg-gray-50 flex flex-col items-center py-4 rounded-l">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 hover:bg-gray-200 rounded ${
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
            className={`p-1 hover:bg-gray-200 rounded ${
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
            <span className="font-semibold hover:underline cursor-pointer">
              {post.authorType === 'doctor' ? '👨‍⚕️' : '👤'} {post.author}
            </span>
            {post.verified && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                ✓ Verified
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
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-200">
            <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-semibold">{post.comments} Comments</span>
            </button>
            <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
            <button
              onClick={() => savePost(postId)}
              className={`flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded ${
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