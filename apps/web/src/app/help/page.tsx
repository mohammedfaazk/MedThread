'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-4xl font-bold mb-6">Help Center</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">Getting Started</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• How to create an account</li>
                <li>• How to post a question</li>
                <li>• How to find doctors</li>
                <li>• How to join communities</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">For Patients</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• How to describe symptoms</li>
                <li>• How to upload medical files</li>
                <li>• How to follow up on posts</li>
                <li>• Privacy and anonymity</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">For Doctors</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• How to get verified</li>
                <li>• How to answer questions</li>
                <li>• Building your reputation</li>
                <li>• Professional guidelines</li>
              </ul>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-700">
                Can't find what you're looking for?{' '}
                <a href="mailto:support@medthread.com" className="text-[#FF4500] font-semibold hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}