'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface SecondOpinionRequest {
  id: string;
  condition: string;
  diagnosis: string;
  status: string;
  urgency: string;
  responses: any[];
  createdAt: string;
}

export default function SecondOpinionPage() {
  const [requests, setRequests] = useState<SecondOpinionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/api/v1/second-opinion?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'text-red-600';
      case 'NORMAL': return 'text-blue-600';
      case 'LOW': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Second Opinion Marketplace</h1>
              <p className="mt-2 text-gray-600">
                Get expert second opinions from multiple verified doctors
              </p>
            </div>
            <Link
              href="/second-opinion/request"
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Request Second Opinion
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'OPEN', 'IN_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-6">
              Request a second opinion to get started
            </p>
            <Link
              href="/second-opinion/request"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Request Second Opinion
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/second-opinion/${request.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.condition}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Original Diagnosis: {request.diagnosis}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className={`font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                      <span>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        {request.responses?.length || 0} responses
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'COMPLETED' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : request.status === 'CANCELLED' ? (
                      <XCircle className="h-6 w-6 text-gray-400" />
                    ) : (
                      <Clock className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                </div>

                {request.responses && request.responses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Latest response from {request.responses[0].doctorName || 'Doctor'}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
