'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { getImageUrl } from '@/lib/imageUrl';
import { Filter, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    avatar: string | null;
    role: string;
  };
  metadata: {
    title?: string;
    body?: string;
    preview?: string;
    link?: string;
    communityName?: string;
    postTitle?: string;
  };
}

const NOTIFICATION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'REPLY', label: 'Replies' },
  { value: 'MENTION', label: 'Mentions' },
  { value: 'AWARD', label: 'Awards' },
  { value: 'FOLLOWER', label: 'Followers' },
  { value: 'APPOINTMENT_REQUEST', label: 'Appointment Requests' },
  { value: 'APPOINTMENT_UPDATE', label: 'Appointment Updates' },
  { value: 'VERIFICATION_STATUS', label: 'Verification' },
  { value: 'COMMUNITY_INVITE', label: 'Community Invites' },
  { value: 'DIRECT_MESSAGE', label: 'Messages' },
  { value: 'SYSTEM_ANNOUNCEMENT', label: 'Announcements' },
  { value: 'UPVOTE_MILESTONE', label: 'Milestones' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useJWTAuth();
  const router = useRouter();

  const limit = 20;

  // Fetch notifications
  const fetchNotifications = async (resetPage = false) => {
    if (!user) return;

    setLoading(true);
    const currentPage = resetPage ? 1 : page;

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (typeFilter) params.append('type', typeFilter);
      if (readFilter !== 'all') {
        params.append('isRead', (readFilter === 'read').toString());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
        setHasMore(data.data.hasMore || false);
        setTotal(data.data.total || 0);
        if (resetPage) setPage(1);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotal((prev) => prev - 1);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.metadata.link) {
      router.push(notification.metadata.link);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get notification message
  const getNotificationMessage = (notification: Notification) => {
    const { type, actor, metadata } = notification;
    const username = actor.username;

    switch (type) {
      case 'REPLY':
        return `${username} replied to your post`;
      case 'MENTION':
        return `${username} mentioned you`;
      case 'AWARD':
        return `${username} gave you an award`;
      case 'FOLLOWER':
        return `${username} started following you`;
      case 'APPOINTMENT_REQUEST':
        return `${username} requested an appointment`;
      case 'APPOINTMENT_UPDATE':
        return `Appointment status updated`;
      case 'VERIFICATION_STATUS':
        return metadata.title || 'Verification status updated';
      case 'COMMUNITY_INVITE':
        return `${username} invited you to moderate ${metadata.communityName}`;
      case 'DIRECT_MESSAGE':
        return `${username} sent you a message`;
      case 'SYSTEM_ANNOUNCEMENT':
        return metadata.title || 'System announcement';
      case 'UPVOTE_MILESTONE':
        return `Your post reached ${metadata.body}`;
      default:
        return metadata.body || 'New notification';
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications(true);
    }
  }, [user, typeFilter, readFilter]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!user) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            {total} total notification{total !== 1 ? 's' : ''}
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-300/20 hover:bg-neutral-300/30 border border-neutral-400/20 rounded-xl text-sm font-medium transition-all"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Read Filter Tabs */}
            <div className="flex items-center gap-2 bg-neutral-300/20 rounded-xl p-1">
              {['all', 'unread', 'read'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setReadFilter(filter as any)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    readFilter === filter
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-400/20">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 focus:ring-4 focus:ring-blue-100/50 transition-all"
              >
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-neutral-400/10 last:border-b-0 transition-all ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="p-4 flex gap-4 hover:bg-neutral-300/10">
                    {/* Avatar */}
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-200 flex-shrink-0">
                        {notification.actor.avatar ? (
                          <img
                            src={getImageUrl(notification.actor.avatar) || ''}
                            alt={notification.actor.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          notification.actor.username.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-sm text-gray-800 font-medium">
                        {getNotificationMessage(notification)}
                      </p>
                      {notification.metadata.preview && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.metadata.preview}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && notifications.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => p - 1);
                  fetchNotifications();
                }}
                disabled={page === 1}
                className="p-2 bg-white border border-neutral-400/20 rounded-xl hover:bg-neutral-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 bg-white border border-neutral-400/20 rounded-xl text-sm font-medium">
                Page {page}
              </span>
              <button
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchNotifications();
                }}
                disabled={!hasMore}
                className="p-2 bg-white border border-neutral-400/20 rounded-xl hover:bg-neutral-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
