'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, User, Star } from 'lucide-react';

interface Response {
  id: string;
  doctorId: string;
  opinion: string;
  agreement: string;
  confidence: number;
  reasoning: string;
  createdAt: string;
  doctor: {
    username: string;
    specialty: string;
    yearsOfExperience: number;
  };
}

interface Request {
  id: string;
  condition: string;
  diagnosis: string;
  treatmentPlan: any;
  symptoms: string[];
  urgency: string;
  status: string;
  responses: Response[];
  createdAt: string;
}

export default function SecondOpinionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/api/v1/second-opinion/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.data);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (doctorId?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      await fetch(`${API_URL}/api/v1/second-opinion/${params.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedDoctorId: doctorId })
      });

      fetchRequest();
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Request not found</p>
        </div>
      </div>
    );
  }

  const getAgreementColor = (agreement: string) => {
    switch (agreement) {
      case 'AGREE': return 'text-green-600 bg-green-100';
      case 'PARTIALLY_AGREE': return 'text-yellow-600 bg-yellow-100';
      case 'DISAGREE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to requests
        </button>

        {/* Request Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.condition}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  request.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {request.status.replace('_', ' ')}
                </span>
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                <span className="text-orange-600 font-medium">{request.urgency}</span>
              </div>
            </div>
            {request.status !== 'COMPLETED' && request.responses.length > 0 && (
              <button
                onClick={() => markComplete()}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="h-5 w-5" />
                Mark Complete
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Original Diagnosis</h3>
              <p className="text-gray-700">{request.diagnosis}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {request.symptoms.map((symptom, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {request.treatmentPlan && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Treatment Plan</h3>
                <p className="text-gray-700">{JSON.stringify(request.treatmentPlan)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Responses */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            Doctor Responses ({request.responses.length})
          </h2>

          {request.responses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for responses</h3>
              <p className="text-gray-600">
                Doctors will review your case and provide their opinions soon
              </p>
            </div>
          ) : (
            request.responses.map((response) => (
              <div key={response.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Dr. {response.doctor.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {response.doctor.specialty} • {response.doctor.yearsOfExperience} years exp.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAgreementColor(response.agreement)}`}>
                      {response.agreement.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{(response.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Opinion</h4>
                    <p className="text-gray-700">{response.opinion}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reasoning</h4>
                    <p className="text-gray-700">{response.reasoning}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleDateString()}
                    </span>
                    {request.status !== 'COMPLETED' && (
                      <button
                        onClick={() => markComplete(response.doctorId)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Select this doctor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Consensus */}
        {request.responses.length >= 2 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Consensus View</h3>
            <p className="text-blue-800">
              {request.responses.filter(r => r.agreement === 'AGREE').length} out of {request.responses.length} doctors agree with the original diagnosis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
