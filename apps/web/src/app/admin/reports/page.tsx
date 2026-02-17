'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReports, resolveReport } from '@/lib/adminApi';
import { Flag, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface Report {
  id: string;
  reason: string;
  details?: string;
  status: string;
  targetType: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  post?: {
    id: string;
    title: string;
    author: {
      username: string;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: {
      username: string;
    };
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveAction, setResolveAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [resolveNotes, setResolveNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        alert('Access denied. Admin only.');
        router.push('/');
        return;
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/login');
      return;
    }

    loadReports();
  }, [page, statusFilter]);

  const loadReports = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    setLoading(true);
    try {
      const filters: any = { page, limit: 20 };
      if (statusFilter) filters.status = statusFilter;

      const response = await getReports(filters, token);
      setReports(response.data.reports);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load reports:', error);
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport || !resolveNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await resolveReport(selectedReport.id, resolveAction, resolveNotes, token);
      alert(`Report ${resolveAction.toLowerCase()} successfully`);
      setShowResolveDialog(false);
      setSelectedReport(null);
      setResolveNotes('');
      loadReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
      alert('Failed to resolve report');
    }
  };

  const openResolveDialog = (report: Report, action: 'APPROVED' | 'REJECTED') => {
    setSelectedReport(report);
    setResolveAction(action);
    setShowResolveDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
          <p className="text-gray-600 mt-2">Review and resolve user reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No reports found
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Flag className="w-5 h-5 text-red-500" />
                          <div>
                            <span className="font-semibold text-gray-900">
                              Reported by {report.user.username}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              • {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Reason:</span> {report.reason}
                          </p>
                          {report.details && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Details:</span> {report.details}
                            </p>
                          )}
                        </div>

                        {/* Reported Content */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-3">
                          <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                            Reported {report.targetType}
                          </p>
                          {report.post && (
                            <div>
                              <p className="font-semibold text-gray-900">{report.post.title}</p>
                              <p className="text-sm text-gray-600">by {report.post.author.username}</p>
                            </div>
                          )}
                          {report.comment && (
                            <div>
                              <p className="text-gray-900">{report.comment.content}</p>
                              <p className="text-sm text-gray-600 mt-1">by {report.comment.author.username}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {report.status === 'PENDING' && (
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => openResolveDialog(report, 'APPROVED')}
                            className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                            title="Approve report"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openResolveDialog(report, 'REJECTED')}
                            className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                            title="Reject report"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resolve Dialog */}
      {showResolveDialog && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              {resolveAction === 'APPROVED' ? 'Approve Report' : 'Reject Report'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {resolveAction === 'APPROVED' 
                ? 'Approving this report will take action against the reported content.'
                : 'Rejecting this report will dismiss it without taking action.'}
            </p>

            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Report Reason:</p>
              <p className="text-sm text-gray-600">{selectedReport.reason}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes *
              </label>
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter resolution notes..."
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowResolveDialog(false);
                  setSelectedReport(null);
                  setResolveNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  resolveAction === 'APPROVED'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {resolveAction === 'APPROVED' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
