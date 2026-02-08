'use client'

import { Navbar } from '@/components/Navbar'

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-3xl font-bold mb-6 text-charcoal">Settings</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-charcoal">Account Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-gray-700">Push notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-700">Show NSFW content</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200/50 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-charcoal">Privacy</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-gray-700">Make my profile public</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-gray-700">Allow direct messages</span>
                </label>
              </div>
            </div>

            <button className="px-6 py-2.5 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-soft hover:shadow-elevated">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}