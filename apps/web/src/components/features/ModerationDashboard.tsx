'use client';

import React, { useState, useEffect } from 'react';

interface ModerationItem {
  id: string;
  content: string;
  authorId: string;
  author: { username: string; role: string };
  contentType: string;
  action: string;
  toxicityScore: number;
  categories: any;
  moderatedAt: Date;
}

export const ModerationDashboard: React.FC = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchModerationQueue();
  }, [filter, page]);

  const fetchModerationQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter !== 'all' && { action: filter })
      });

      const response = await fetch(`/api/v1/content-moderation/queue?${params}`);
      const data = await response.json();
      
      setItems(data.items || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'REMOVE': return 'bg-red-100 text-red-800';
      case 'FLAG': return 'bg-orange-100 text-orange-800';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Content Moderation Dashboard</h1>
        <p className="text-gray-600">Review and manage flagged content</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'REMOVE', 'FLAG', 'REVIEW', 'APPROVE'].map((action) => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                filter === action
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {action === 'all' ? 'All' : action}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-red-600">{items.filter(i => i.action === 'REMOVE').length}</div>
          <div className="text-sm text-gray-600">To Remove</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-orange-600">{items.filter(i => i.action === 'FLAG').length}</div>
          <div className="text-sm text-gray-600">Flagged</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{items.filter(i => i.action === 'REVIEW').length}</div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{items.filter(i => i.action === 'APPROVE').length}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No items to moderate</div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.author.username}</span>
                    <span className="text-xs text-gray-500">({item.author.role})</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(item.action)}`}>
                      {item.action}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.moderatedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{item.content}</p>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-600">
                    Toxicity: <strong>{Math.round(item.toxicityScore * 100)}%</strong>
                  </span>
                  {item.categories.spam && <span className="text-orange-600">🚫 Spam</span>}
                  {item.categories.harassment && <span className="text-red-600">⚠️ Harassment</span>}
                  {item.categories.misinformation && <span className="text-yellow-600">❌ Misinformation</span>}
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                    Remove
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                    Review Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="p-4 border-t flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
