'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-4xl font-bold mb-6 text-charcoal">About MedThread</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              MedThread is a trusted community where patients connect with verified healthcare professionals 
              for medical guidance and support.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-charcoal">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              To democratize access to trusted medical insights by connecting patients with verified healthcare 
              professionals in a safe, structured, and community-driven environment.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-charcoal">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Verified healthcare professionals</li>
              <li>Community-driven medical discussions</li>
              <li>Safe and moderated environment</li>
              <li>Medical specialty communities</li>
              <li>Anonymous patient support</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-charcoal">Contact Us</h2>
            <p className="text-gray-700">
              Email: <a href="mailto:support@medthread.com" className="text-yellow-200 hover:underline font-semibold">support@medthread.com</a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200/50">
            <Link href="/" className="text-yellow-200 font-semibold hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}