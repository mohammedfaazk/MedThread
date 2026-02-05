'use client'

import { Navbar } from '@/components/Navbar'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span>Push notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Show NSFW content</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Privacy</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span>Make my profile public</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span>Allow direct messages</span>
                </label>
              </div>
            </div>

            <button className="px-6 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722]">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}