'use client';

import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import RiskDashboard from '@/components/health/RiskDashboard';

import ComprehensiveHealthAssessment from '@/components/health/ComprehensiveHealthAssessment';

export default function HealthRiskPage() {
  const { user } = useJWTAuth();
  const router = useRouter();
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRiskData();
    }
  }, [user]);

  const fetchRiskData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/api/v1/health-risk/assessment/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRiskData(data);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to access Health Risk Assessment</h2>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your health risk assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Health Risk Assessment</h1>
          <p className="text-gray-600">
            Understand your health risks and get personalized recommendations
          </p>
        </div>

        {riskData ? (
          <RiskDashboard userId={user.id} />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">No Assessment Yet</h2>
              <p className="text-gray-600 mb-6">
                Take a comprehensive health risk assessment to understand your health better
                and receive personalized recommendations.
              </p>
              <button
                onClick={() => setShowAssessment(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Assessment
              </button>
            </div>
          </div>
        )}

        {showAssessment && (
          <ComprehensiveHealthAssessment
            userId={user.id}
            onClose={() => setShowAssessment(false)}
            onComplete={() => {
              setShowAssessment(false);
              fetchRiskData();
            }}
          />
        )}
      </div>
    </div>
  );
}
