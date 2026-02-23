'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { getUsers, suspendUser, unsuspendUser, deleteUser } from '@/lib/adminApi';
import { Search, Ban, CheckCircle, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  verified: boolean;
  isSuspended: boolean;
  createdAt: string;
  totalKarma: number;
  avatar?: string;
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'unsuspend' | 'delete' | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    // Check if user is admin
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

    loadUsers();
  }, [page, roleFilter, statusFilter]);

  const loadUsers = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    setLoading(true);
    try {
      const filters: any = { page, limit: 20 };
      if (search) filters.search = search;
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter === 'suspended') filters.suspended = true;
      if (statusFilter === 'active') filters.suspended = false;

      const response = await getUsers(filters, token);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleSuspend = async () => {
    const token = localStorage.getItem('auth_token');
    if (!selectedUser || !token || !suspendReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    try {
      await suspendUser(selectedUser.id, suspendReason, token);
      alert('User suspended successfully');
      setShowConfirmDialog(false);
      setSelectedUser(null);
      setSuspendReason('');
      loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleUnsuspend = async () => {
    const token = localStorage.getItem('auth_token');
    if (!selectedUser || !token) return;

    try {
      await unsuspendUser(selectedUser.id, token);
      alert('User unsuspended successfully');
      setShowConfirmDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
      alert('Failed to unsuspend user');
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('auth_token');
    if (!selectedUser || !token) return;

    try {
      await deleteUser(selectedUser.id, token);
      alert('User deleted successfully');
      setShowConfirmDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const openConfirmDialog = (user: User, action: 'suspend' | 'unsuspend' | 'delete') => {
    setSelectedUser(user);
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'PATIENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users on the platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by username or email..."
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

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Karma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {u.avatar ? (
                                <img className="h-10 w-10 rounded-full" src={u.avatar} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.username}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.isSuspended ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.totalKarma}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {u.role !== 'ADMIN' && (
                              <>
                                {u.isSuspended ? (
                                  <button
                                    onClick={() => openConfirmDialog(u, 'unsuspend')}
                                    className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition"
                                    title="Unsuspend user"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openConfirmDialog(u, 'suspend')}
                                    className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded transition"
                                    title="Suspend user"
                                  >
                                    <Ban className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => openConfirmDialog(u, 'delete')}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
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
      {showConfirmDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction === 'suspend' && 'Suspend User'}
              {confirmAction === 'unsuspend' && 'Unsuspend User'}
              {confirmAction === 'delete' && 'Delete User'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {confirmAction === 'suspend' && `Are you sure you want to suspend ${selectedUser.username}?`}
              {confirmAction === 'unsuspend' && `Are you sure you want to unsuspend ${selectedUser.username}?`}
              {confirmAction === 'delete' && `Are you sure you want to permanently delete ${selectedUser.username}? This action cannot be undone.`}
            </p>

            {confirmAction === 'suspend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for suspension *
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter reason..."
                  required
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedUser(null);
                  setSuspendReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction === 'suspend') handleSuspend();
                  else if (confirmAction === 'unsuspend') handleUnsuspend();
                  else if (confirmAction === 'delete') handleDelete();
                }}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  confirmAction === 'delete' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : confirmAction === 'suspend'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmAction === 'suspend' && 'Suspend'}
                {confirmAction === 'unsuspend' && 'Unsuspend'}
                {confirmAction === 'delete' && 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
