'use client'

import { useState } from 'react'
import { Calendar, Video } from 'lucide-react'
import ConsultationModal from './ConsultationModal'

interface BookConsultationButtonProps {
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  sourceThreadId?: string
  sourceReplyId?: string
  caseContext?: any
}

export default function BookConsultationButton({
  doctorId,
  doctorName,
  doctorSpecialty,
  sourceThreadId,
  sourceReplyId,
  caseContext
}: BookConsultationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
      >
        <Calendar className="w-4 h-4" />
        Book Consultation
      </button>

      {isModalOpen && (
        <ConsultationModal
          doctorId={doctorId}
          doctorName={doctorName}
          doctorSpecialty={doctorSpecialty}
          sourceThreadId={sourceThreadId}
          sourceReplyId={sourceReplyId}
          caseContext={caseContext}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
