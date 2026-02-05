'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-4xl font-bold mb-6">About MedThread</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              MedThread is a trusted community where patients connect with verified healthcare professionals 
              for medical guidance and support.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              To democratize access to trusted medical insights by connecting patients with verified healthcare 
              professionals in a safe, structured, and community-driven environment.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Verified healthcare professionals</li>
              <li>Community-driven medical discussions</li>
              <li>Safe and moderated environment</li>
              <li>Medical specialty communities</li>
              <li>Anonymous patient support</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              Email: <a href="mailto:support@medthread.com" className="text-[#FF4500] hover:underline">support@medthread.com</a>
            </p>
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