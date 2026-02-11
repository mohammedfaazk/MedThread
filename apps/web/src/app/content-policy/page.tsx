'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-4xl font-bold mb-6 text-charcoal">Content Policy</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Prohibited Content</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Medical misinformation</li>
                <li>Harassment or bullying</li>
                <li>Spam or self-promotion</li>
                <li>Illegal content</li>
                <li>Personal information of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3 text-charcoal">Encouraged Content</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Respectful medical discussions</li>
                <li>Evidence-based information</li>
                <li>Personal health experiences</li>
                <li>Supportive community engagement</li>
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