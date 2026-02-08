'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function ModPolicyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-4xl font-bold mb-6 text-charcoal">Moderator Policy</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Moderator Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Enforce community rules fairly</li>
                <li>Remove inappropriate content promptly</li>
                <li>Respond to user reports</li>
                <li>Maintain professional conduct</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Moderator Powers</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Remove posts and comments</li>
                <li>Ban users temporarily or permanently</li>
                <li>Pin important posts</li>
                <li>Lock threads when necessary</li>
              </ul>
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