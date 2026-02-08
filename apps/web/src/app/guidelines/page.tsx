'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-4xl font-bold mb-6 text-charcoal">Community Guidelines</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Be Respectful</h2>
              <p className="text-gray-700">
                Treat all community members with respect. No harassment, hate speech, or personal attacks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Share Accurate Information</h2>
              <p className="text-gray-700">
                Only share information you believe to be accurate. Cite sources when possible. Doctors should follow professional standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Protect Privacy</h2>
              <p className="text-gray-700">
                Never share personal information about yourself or others. Use anonymous usernames.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Report Issues</h2>
              <p className="text-gray-700">
                If you see content that violates our guidelines, please report it to our moderation team.
              </p>
            </section>
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