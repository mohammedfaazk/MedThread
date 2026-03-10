'use client'

import { useState } from 'react'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { SymptomForm } from '@/components/SymptomForm'
import { AIAnalysisPanel } from '@/components/AIAnalysisPanel'
import IridescenceLayout from '@/components/IridescenceLayout'

export default function CreatePost() {
  const [formData, setFormData] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <NavbarEnhanced />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Share Your Medical Concern</h1>
            <p className="text-gray-600">
              Provide detailed information to help healthcare professionals assist you better
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SymptomForm 
                onDataChange={setFormData}
                onAnalysisReceived={setAiAnalysis}
              />
            </div>
            <div className="hidden lg:block">
              <AIAnalysisPanel analysis={aiAnalysis} />
            </div>
          </div>
        </main>
      </div>
    </IridescenceLayout>
  )
}
