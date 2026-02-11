'use client'

interface CreatePostButtonProps {
  floating?: boolean
}

export function CreatePostButton({ floating }: CreatePostButtonProps) {
  if (floating) {
    return (
      <button
        onClick={() => window.location.href = '/create'}
        className="w-14 h-14 bg-charcoal text-white rounded-full shadow-elevated hover:bg-charcoal-light transition-all flex items-center justify-center text-2xl hover:scale-110"
      >
        +
      </button>
    )
  }

  return (
    <button
      onClick={() => window.location.href = '/create'}
      className="w-full px-6 py-3 bg-charcoal text-white rounded-full hover:bg-charcoal-light transition-all font-semibold shadow-lg hover:shadow-elevated"
    >
      Create New Post
    </button>
  )
}
