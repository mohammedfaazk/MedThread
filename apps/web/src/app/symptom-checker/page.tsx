'use client'

import { Sidebar } from '@/components/Sidebar'
import { Activity, AlertCircle, Heart, Thermometer } from 'lucide-react'

export default function SymptomCheckerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-blue-50">
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-charcoal mb-2">Symptom Checker</h1>
              <p className="text-gray-600">
                Describe your symptoms and get preliminary health insights
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Medical Disclaimer</h3>
                  <p className="text-sm text-yellow-700">
                    This tool provides general information only and is not a substitute for professional medical advice. 
                    Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>

            {/* Symptom Input Card */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-charcoal mb-4">Describe Your Symptoms</h2>
              
              <textarea
                placeholder="Example: I have a headache, fever, and sore throat for 2 days..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 resize-none bg-white/50 backdrop-blur-sm transition-all"
                rows={6}
              />

              <div className="mt-4 flex gap-3">
                <button className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-lg hover:shadow-xl">
                  Analyze Symptoms
                </button>
                <button className="px-6 py-3 border-2 border-gray-200 text-charcoal rounded-full font-semibold hover:bg-cream-50/50 transition">
                  Clear
                </button>
              </div>
            </div>

            {/* Quick Symptom Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Thermometer className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal">Fever & Infection</h3>
                </div>
                <p className="text-sm text-gray-600">
                  High temperature, chills, sweating, body aches
                </p>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal">Heart & Circulation</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Chest pain, palpitations, shortness of breath
                </p>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal">Pain & Discomfort</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Headaches, muscle pain, joint pain, abdominal pain
                </p>
              </div>

              <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-green-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal">Digestive Issues</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Nausea, vomiting, diarrhea, constipation, bloating
                </p>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 text-center">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <Activity className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-2">Feature Coming Soon</h2>
              <p className="text-gray-600 mb-4">
                We're working on an advanced AI-powered symptom checker that will help you understand your symptoms better.
              </p>
              <p className="text-sm text-gray-500">
                In the meantime, you can ask questions in our community forums or consult with verified doctors.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
