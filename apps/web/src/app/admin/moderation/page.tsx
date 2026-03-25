'use client';

import { ModerationDashboard } from '@/components/features/ModerationDashboard';

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
        <ModerationDashboard />
      </div>
    </div>
  );
}
