'use client';

import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import { Trophy, CheckCircle, AlertCircle, Target } from 'lucide-react';
import axios from 'axios';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';
import IridescenceLayout from '@/components/IridescenceLayout';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  riskLevel: string;
  requiresDoctorApproval: boolean;
  isDoctorApproved: boolean;
  approvedByDoctors: Array<{
    doctorId: string;
    doctorName: string;
    approvedAt: string;
  }>;
  participantCount: number;
  goal: number;
  unit: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function DoctorChallengeApprovalsPage() {
  const { user, role } = useJWTAuth();
  const router = useRouter();
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'DOCTOR') {
      router.push('/');
      return;
    }
    loadPendingChallenges();
  }, [role, router]);

  const loadPendingChallenges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_URL}/api/v1/health-challenges/pending-approval`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingChallenges(response.data.data || []);
    } catch (error) {
      console.error('Failed to load pending challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (challengeId: string) => {
    setApproving(challengeId);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(
        `${API_URL}/api/v1/health-challenges/${challengeId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Challenge approved successfully! Patients can now join this challenge.');
      loadPendingChallenges();
    } catch (error: any) {
      console.error('Failed to approve challenge:', error);
      alert(`Failed to approve: ${error.response?.data?.error || error.message}`);
    } finally {
      setApproving(null);
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    return riskLevel === 'HIGH' 
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-green-100 text-green-700 border-green-300';
  };

  if (!user || role !== 'DOCTOR') {
    return null;
  }

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="max-w-[1440px] mx-auto flex">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-10 w-10 text-blue-600" />
              <h1 className="text-3xl font-bold">Challenge Approvals</h1>
            </div>
            <p className="text-gray-600">
              Review and approve HIGH-RISK health challenges before patients can join
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading challenges...</p>
              </div>
            ) : pendingChallenges.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No challenges pending approval</p>
                <p className="text-gray-500 text-sm mt-2">All HIGH-RISK challenges have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingChallenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{challenge.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskBadge(challenge.riskLevel)}`}>
                            {challenge.riskLevel} RISK
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{challenge.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Difficulty</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.difficulty}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Goal</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.goal} {challenge.unit}</p>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <strong>Doctor Approval Required:</strong> This HIGH-RISK challenge will only be visible to patients after you approve it. Please review the challenge details carefully before approving.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Created {new Date(challenge.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleApprove(challenge.id)}
                        disabled={approving === challenge.id}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-semibold"
                      >
                        {approving === challenge.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Approve Challenge
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </IridescenceLayout>
  );
}
