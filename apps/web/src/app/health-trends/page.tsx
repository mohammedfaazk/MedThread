'use client';

import { Navbar } from '@/components/Navbar';
import { RegionalSymptomHeatmap } from '@/components/analytics/RegionalSymptomHeatmap';
import IridescenceLayout from '@/components/IridescenceLayout';

export default function HealthTrendsPage() {
  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Regional Health Trends
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Real-time symptom analytics and health trends across India. 
              Track regional health patterns, identify emerging health concerns, 
              and monitor symptom distribution by geography.
            </p>
          </div>

          {/* Regional Symptom Heatmap */}
          <RegionalSymptomHeatmap className="mb-8" />

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔍 How It Works
              </h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes patient posts to detect symptoms and map them to geographic locations. 
                This creates real-time health intelligence for public health monitoring.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🏥 For Healthcare Professionals
              </h3>
              <p className="text-sm text-gray-600">
                Identify regional health patterns, prepare for seasonal outbreaks, 
                and understand patient needs in different geographic areas.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔒 Privacy Protected
              </h3>
              <p className="text-sm text-gray-600">
                All data is anonymized and aggregated. Individual patient information 
                is never exposed, ensuring complete privacy protection.
              </p>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Example Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">🌡️</span>
                  <div>
                    <p className="font-medium text-gray-900">Seasonal Flu Tracking</p>
                    <p className="text-sm text-gray-600">Monitor flu symptoms across cities during winter months</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">🤧</span>
                  <div>
                    <p className="font-medium text-gray-900">Allergy Patterns</p>
                    <p className="text-sm text-gray-600">Track seasonal allergies by region and pollen levels</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">🏭</span>
                  <div>
                    <p className="font-medium text-gray-900">Air Quality Impact</p>
                    <p className="text-sm text-gray-600">Correlate respiratory symptoms with pollution levels</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-medium text-gray-900">Health Alerts</p>
                    <p className="text-sm text-gray-600">Early warning system for potential health outbreaks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IridescenceLayout>
  );
}