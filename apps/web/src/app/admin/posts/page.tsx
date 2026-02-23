'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPosts, deletePost, togglePinPost, toggleLockPost } from '@/lib/adminApi';
import { Search, Trash2, Pin, Lock, Unlock, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content?: string;
  type: string;
  author: {
    id: string;
    username: string;
    role: string;
  };
  community: {
    id: string;
    name: string;
  };
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isRemoved: boolean;
  createdAt: string;
  _count: {
    comments: number;
    reports: number;
  };
}

export default function AdminPostsPage() {
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [communityFilter, setCommunityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'pin' | 'lock' | null>(null);
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

    loadPosts();
  }, [page, statusFilter]);

  const loadPosts = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    setLoading(true);
    try {
      const filters: any = { page, limit: 20 };
      if (search) filters.search = search;
      if (communityFilter) filters.communityId = communityFilter;
      if (statusFilter === 'pinned') filters.isPinned = true;
      if (statusFilter === 'locked') filters.isLocked = true;
      if (statusFilter === 'removed') filters.isRemoved = true;

      const response = await getPosts(filters, token);
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load posts:', error);
      alert('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadPosts();
  };

  const handleDelete = async () => {
    if (!selectedPost || !deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await deletePost(selectedPost.id, deleteReason, token);
      alert('Post deleted successfully');
      setShowConfirmDialog(false);
      setSelectedPost(null);
      setDeleteReason('');
      loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleTogglePin = async (post: Post) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await togglePinPost(post.id, token);
      alert(`Post ${post.isPinned ? 'unpinned' : 'pinned'} successfully`);
      loadPosts();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      alert('Failed to toggle pin');
    }
  };

  const handleToggleLock = async (post: Post) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      await toggleLockPost(post.id, token);
      alert(`Post ${post.isLocked ? 'unlocked' : 'locked'} successfully`);
      loadPosts();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to toggle lock');
    }
  };

  const openConfirmDialog = (post: Post, action: 'delete' | 'pin' | 'lock') => {
    setSelectedPost(post);
    setConfirmAction(action);
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
          <h1 className="text-3xl font-bold text-gray-900">Post Moderation</h1>
          <p className="text-gray-600 mt-2">Manage and moderate all posts on the platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search posts by title or content..."
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
              <option value="">All Posts</option>
              <option value="pinned">Pinned</option>
              <option value="locked">Locked</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No posts found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Community
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="text-sm font-medium text-gray-900 truncate">{post.title}</div>
                            {post.content && (
                              <div className="text-sm text-gray-500 truncate">{post.content.substring(0, 100)}...</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{post.author.username}</div>
                          <div className="text-xs text-gray-500">{post.author.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{post.community.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">↑ {post.upvotes} ↓ {post.downvotes}</div>
                          <div className="text-xs text-gray-500">{post._count.comments} comments</div>
                          {post._count.reports > 0 && (
                            <div className="text-xs text-red-600">{post._count.reports} reports</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {post.isPinned && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                Pinned
                              </span>
                            )}
                            {post.isLocked && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Locked
                              </span>
                            )}
                            {post.isRemoved && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Removed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleTogglePin(post)}
                              className={`p-2 rounded transition ${
                                post.isPinned
                                  ? 'text-purple-600 hover:bg-purple-50'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              title={post.isPinned ? 'Unpin post' : 'Pin post'}
                            >
                              <Pin className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleToggleLock(post)}
                              className={`p-2 rounded transition ${
                                post.isLocked
                                  ? 'text-yellow-600 hover:bg-yellow-50'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              title={post.isLocked ? 'Unlock post' : 'Lock post'}
                            >
                              {post.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => openConfirmDialog(post, 'delete')}
                              className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                              title="Delete post"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      {showConfirmDialog && selectedPost && confirmAction === 'delete' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Delete Post</h3>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedPost.title}"? This action cannot be undone.
            </p>

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
                  setSelectedPost(null);
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
