'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface SpamItem {
  id: string;
  type: 'post' | 'comment' | 'user';
  content: string;
  author: string;
  spamScore: number;
  reasons: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'removed';
}

export default function SpamDetectionPage() {
  const [spamItems, setSpamItems] = useState<SpamItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'high-risk'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpamItems();
  }, [filter]);

  const fetchSpamItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/spam-detection/items?filter=${filter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setSpamItems(data.items || []);
    } catch (error) {
      console.error('Error fetching spam items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (itemId: string, action: 'approve' | 'remove') => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/spam-detection/${itemId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSpamItems();
    } catch (error) {
      console.error('Error handling spam action:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Spam Detection</h1>
              </div>
              <p className="text-gray-600">Review and manage flagged content</p>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Review</option>
              <option value="high-risk">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {spamItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(item.spamScore)}`}>
                      {item.spamScore}% spam score
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{item.content}</p>
                  <p className="text-sm text-gray-500">By {item.author} • {new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Spam Indicators:</h4>
                <div className="flex flex-wrap gap-2">
                  {item.reasons.map((reason, index) => (
                    <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded text-sm">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {item.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(item.id, 'approve')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'remove')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="h-5 w-5" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {spamItems.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No spam items to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
