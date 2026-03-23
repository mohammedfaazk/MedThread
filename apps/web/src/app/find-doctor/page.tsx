'use client';

import { SmartDoctorFinder } from '@/components/unique/SmartDoctorFinder';

export default function FindDoctorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Doctor Finder</h1>
          <p className="mt-2 text-gray-600">
            AI-powered doctor matching based on your symptoms, location, and preferences
          </p>
        </div>

        <SmartDoctorFinder />
      </div>
    </div>
  );
}
