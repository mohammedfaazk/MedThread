'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 2024</p>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">Information We Collect</h2>
              <p className="text-gray-700">
                We collect information you provide directly to us, including account information, posts, comments, and messages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">How We Use Your Information</h2>
              <p className="text-gray-700">
                We use your information to provide, maintain, and improve our services, to communicate with you, and to protect our users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">Your Rights</h2>
              <p className="text-gray-700">
                You have the right to access, update, or delete your personal information at any time through your account settings.
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