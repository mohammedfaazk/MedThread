'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getComments, deleteComment } from '@/lib/adminApi';
import { Search, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    role: string;
  };
  post: {
    id: string;
    title: string;
  };
  upvotes: number;
  downvotes: number;
  isRemoved: boolean;
  createdAt: string;
  _count: {
    replies: number;
    reports: number;
  };
}

export default function AdminCommentsPage() {
  const router = useRouter();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

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

    loadComments();
  }, [page, statusFilter]);

  const loadComments = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    setLoading(true);
    try {
      const filters: any = { page, limit: 20 };
      if (search) filters.search = search;
      if (statusFilter === 'removed') filters.isRemoved = true;

      const response = await getComments(filters, token);
      setComments(response.data.comments);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load comments:', error);
      alert('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadComments();
  };

  const handleDelete = async () => {
    if (!selectedComment || !deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await deleteComment(selectedComment.id, deleteReason, token);
      alert('Comment deleted successfully');
      setShowConfirmDialog(false);
      setSelectedComment(null);
      setDeleteReason('');
      loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const openConfirmDialog = (comment: Comment) => {
    setSelectedComment(comment);
    setShowConfirmDialog(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Comment Moderation</h1>
          <p className="text-gray-600 mt-2">Manage and moderate all comments on the platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search comments by content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Comments</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No comments found
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                          <div>
                            <span className="font-semibold text-gray-900">{comment.author.username}</span>
                            <span className="text-gray-500 text-sm ml-2">
                              {comment.author.role}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              • {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {comment.isRemoved && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              Removed
                            </span>
                          )}
                          {comment._count.reports > 0 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                              {comment._count.reports} reports
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-700">{comment.content}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Post: {comment.post.title}</span>
                          <span>↑ {comment.upvotes} ↓ {comment.downvotes}</span>
                          {comment._count.replies > 0 && (
                            <span>{comment._count.replies} replies</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => openConfirmDialog(comment)}
                        className="ml-4 text-red-600 hover:bg-red-50 p-2 rounded transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Delete Comment</h3>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>

            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-700">{selectedComment.content}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter reason..."
                required
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedComment(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
