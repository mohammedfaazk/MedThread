'use client';

import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { reportPost, reportComment, reportUser } from '@/lib/reportApi';

interface ReportButtonProps {
  type: 'post' | 'comment' | 'user';
  targetId: string;
  targetTitle?: string; // For display in dialog
  className?: string;
}

const REPORT_REASONS = {
  post: [
    'Spam or misleading',
    'Harassment or hate speech',
    'Violence or dangerous content',
    'Misinformation',
    'Inappropriate content',
    'Other',
  ],
  comment: [
    'Spam or misleading',
    'Harassment or hate speech',
    'Violence or dangerous content',
    'Misinformation',
    'Inappropriate content',
    'Other',
  ],
  user: [
    'Spam account',
    'Harassment or bullying',
    'Impersonation',
    'Inappropriate behavior',
    'Other',
  ],
};

export default function ReportButton({ type, targetId, targetTitle, className = '' }: ReportButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      alert('Please select a reason');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to report');
      return;
    }

    setLoading(true);
    try {
      if (type === 'post') {
        await reportPost(targetId, reason, details, token);
      } else if (type === 'comment') {
        await reportComment(targetId, reason, details, token);
      } else if (type === 'user') {
        await reportUser(targetId, reason, details, token);
      }

      alert('Report submitted successfully. Our team will review it.');
      setShowDialog(false);
      setReason('');
      setDetails('');
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      alert(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDialog(true);
        }}
        className={`flex items-center gap-1 text-gray-500 hover:text-red-600 transition ${className}`}
        title={`Report this ${type}`}
      >
        <Flag className="w-4 h-4" />
        <span className="text-sm">Report</span>
      </button>

      {showDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowDialog(false);
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Report {type}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDialog(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {targetTitle && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">{targetTitle}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS[type].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Provide more context about this report..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDialog(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
