'use client'

interface CreatePostButtonProps {
  floating?: boolean
}

export function CreatePostButton({ floating }: CreatePostButtonProps) {
  if (floating) {
    return (
      <button
        onClick={() => window.location.href = '/create'}
        className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition flex items-center justify-center text-2xl"
      >
        +
      </button>
    )
  }

  return (
    <button
      onClick={() => window.location.href = '/create'}
      className="w-full px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold"
    >
      Create New Post
    </button>
  )
}
