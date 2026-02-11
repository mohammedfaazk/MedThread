'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Activity, Brain, Stethoscope, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'

export default function SymptomCheckerPage() {
  const { user, loading } = useJWTAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Symptom Checker</h1>
                <p className="text-sm text-gray-500">Powered by advanced medical AI</p>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50/80 backdrop-blur-xl border border-amber-200/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Important Medical Disclaimer</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This AI symptom checker is for informational purposes only and does not constitute medical advice. 
                  Always consult with a qualified healthcare professional for proper diagnosis and treatment. 
                  In case of emergency, call your local emergency services immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quick Assessment</h3>
              <p className="text-sm text-gray-600">
                Describe your symptoms and get instant AI-powered insights based on medical knowledge.
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Doctor Recommendations</h3>
              <p className="text-sm text-gray-600">
                Get suggestions for which type of specialist you should consult based on your symptoms.
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Emergency Guidance</h3>
              <p className="text-sm text-gray-600">
                Identify urgent symptoms that require immediate medical attention or emergency care.
              </p>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 hover:shadow-xl transition-all text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Coming Soon
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We're building an advanced AI-powered symptom checker that will help you understand your health better. 
                This feature will analyze your symptoms, provide detailed insights, and recommend the right healthcare professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/doctors')}
                  className="px-8 py-4 bg-[#00BCD4] text-white rounded-xl font-semibold hover:bg-[#00ACC1] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-5 h-5" />
                  Browse Doctors
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => router.push('/appointments')}
                  className="px-8 py-4 bg-white/60 backdrop-blur-sm text-gray-900 rounded-xl font-semibold hover:bg-white/80 transition-all shadow-lg hover:shadow-xl border border-white/40 flex items-center justify-center gap-2"
                >
                  Book Appointment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                In the meantime, you can consult with our verified doctors directly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
