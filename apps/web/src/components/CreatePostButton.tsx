'use client'

import { useState } from 'react'
import { CreatePostModal } from './CreatePostModal'
import { PatientCreatePostModal } from './PatientCreatePostModal'
import { useJWTAuth } from '@/context/JWTAuthContext'

interface CreatePostButtonProps {
  floating?: boolean
}

export function CreatePostButton({ floating }: CreatePostButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { role } = useJWTAuth()

  const isPatient = role === 'PATIENT'

  const Modal = isPatient ? PatientCreatePostModal : CreatePostModal

  if (floating) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-charcoal text-white rounded-full shadow-elevated hover:bg-charcoal-light transition-all flex items-center justify-center text-2xl hover:scale-110"
        >
          +
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-charcoal text-white rounded-full hover:bg-charcoal-light transition-all font-semibold shadow-lg hover:shadow-elevated"
      >
        {isPatient ? 'Ask a Question' : 'Create New Post'}
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
