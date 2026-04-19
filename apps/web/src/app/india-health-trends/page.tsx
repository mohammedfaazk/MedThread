'use client';

import { Navbar } from '@/components/Navbar';
import { IndiaDiseaseHeatmap } from '@/components/analytics/IndiaDiseaseHeatmap';
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
              India Disease Heatmap
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Comprehensive state-wise disease prevalence data across India. 
              Track regional health patterns, identify high-risk areas, 
              and monitor disease distribution by state.
            </p>
          </div>

          {/* India Disease Heatmap */}
          <IndiaDiseaseHeatmap className="mb-8" />

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔍 Data Sources
              </h3>
              <p className="text-sm text-gray-600">
                Disease data sourced from National Centre for Disease Control (NCDC), 
                WHO India reports, and state health department bulletins. Updated regularly.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🏥 For Healthcare Professionals
              </h3>
              <p className="text-sm text-gray-600">
                Identify endemic diseases by state, prepare for regional health challenges, 
                and understand disease burden across different geographic areas.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📊 Risk Assessment
              </h3>
              <p className="text-sm text-gray-600">
                Color-coded risk levels help identify critical, high, medium, and low-risk states 
                for various diseases, enabling better resource allocation.
              </p>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-2xl">🦟</span>
                  <div>
                    <p className="font-medium text-gray-900">Vector-Borne Diseases</p>
                    <p className="text-sm text-gray-600">Dengue, Malaria, and Chikungunya hotspots across India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-2xl">🫁</span>
                  <div>
                    <p className="font-medium text-gray-900">Tuberculosis Burden</p>
                    <p className="text-sm text-gray-600">High TB prevalence in urban and tribal areas</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">💧</span>
                  <div>
                    <p className="font-medium text-gray-900">Waterborne Diseases</p>
                    <p className="text-sm text-gray-600">Typhoid, Cholera, and Hepatitis in flood-prone regions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <span className="text-2xl">🧬</span>
                  <div>
                    <p className="font-medium text-gray-900">Endemic Diseases</p>
                    <p className="text-sm text-gray-600">Kala-azar, Japanese Encephalitis in specific states</p>
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