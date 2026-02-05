'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 2024</p>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using MedThread, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Medical Disclaimer</h2>
              <p className="text-gray-700">
                MedThread is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. User Conduct</h2>
              <p className="text-gray-700">
                Users must not post false information, harass others, or violate any laws. Verified doctors must maintain professional standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Privacy</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/" className="text-[#FF4500] font-semibold hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}