'use client';

import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import RiskDashboard from '@/components/health/RiskDashboard';

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
      const response = await fetch(`/api/v1/health-risk/assessment/${user?.id}`);
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
    <div className="min-h-screen bg-gray-50 py-8">
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
          <HealthAssessmentModal
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

function HealthAssessmentModal({ userId, onClose, onComplete }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    smoking: false,
    alcohol: false,
    exercise: '',
    familyHistory: [] as string[],
    medications: [] as string[],
    conditions: [] as string[]
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/v1/health-risk/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData })
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Health Risk Assessment</h2>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Lifestyle Factors</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.smoking}
                    onChange={(e) => setFormData({ ...formData, smoking: e.target.checked })}
                    className="mr-2"
                  />
                  <span>I smoke or use tobacco products</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.alcohol}
                    onChange={(e) => setFormData({ ...formData, alcohol: e.target.checked })}
                    className="mr-2"
                  />
                  <span>I consume alcohol regularly</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exercise Frequency</label>
                <select
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select frequency</option>
                  <option value="none">None</option>
                  <option value="1-2">1-2 times per week</option>
                  <option value="3-4">3-4 times per week</option>
                  <option value="5+">5+ times per week</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Complete Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
