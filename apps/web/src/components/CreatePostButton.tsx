'use client'

import { useState } from 'react'
import { CreatePostModal } from './CreatePostModal'

interface CreatePostButtonProps {
  floating?: boolean
}

export function CreatePostButton({ floating }: CreatePostButtonProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  if (floating) {
    return (
      <>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-14 h-14 bg-charcoal text-white rounded-full shadow-elevated hover:bg-charcoal-light transition-all flex items-center justify-center text-2xl hover:scale-110"
        >
          +
        </button>
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-full px-6 py-3 bg-charcoal text-white rounded-full hover:bg-charcoal-light transition-all font-semibold shadow-lg hover:shadow-elevated"
      >
        Create New Post
      </button>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}
