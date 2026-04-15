'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, X, Check } from 'lucide-react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useSocket } from '@/context/SocketContext';
import { getImageUrl } from '@/lib/imageUrl';

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

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  type: string;
  createdAt: string;
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useJWTAuth();
  const { socket } = useSocket();

  // Fetch recent notifications
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch emergency alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/emergency-broadcast/active`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlerts(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Safely access nested properties
        const count = data?.data?.count ?? 0;
        setUnreadCount(count);
      } else if (response.status === 500) {
        // Server error - silently fail and set count to 0
        console.warn('Notifications service unavailable');
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
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

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Join notification room
    socket.emit('notification:join', { userId: user.id });

    // Listen for new notifications
    socket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
      setUnreadCount((prev) => prev + 1);
    });

    // Listen for unread count updates
    socket.on('notification:unread-count', (count: number) => {
      setUnreadCount(count);
    });

    // Listen for read notifications (cross-tab sync)
    socket.on('notification:read', (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    });

    // Listen for all read
    socket.on('notification:all-read', () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:unread-count');
      socket.off('notification:read');
      socket.off('notification:all-read');
    };
  }, [socket, user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
      fetchAlerts();
    }
  }, [isOpen, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl relative transition-all shadow-lg hover:shadow-xl hover:scale-105"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {(unreadCount + alerts.length) > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#FF4500] text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
            {unreadCount + alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-96 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-neutral-400/20 bg-neutral-300/10 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Alerts</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-300/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Emergency Alerts Section */}
            {alerts.length > 0 && (
              <div className="border-b border-neutral-400/20">
                <div className="p-3 bg-red-50/80 border-b border-red-200/50">
                  <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide">
                    Emergency Alerts ({alerts.length})
                  </h4>
                </div>
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href="/alerts-history"
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 hover:bg-red-50/50 border-b border-neutral-400/10 transition-all ${
                      alert.priority === 'CRITICAL' ? 'bg-red-100/30' : 
                      alert.priority === 'HIGH' ? 'bg-orange-50/30' : 'bg-blue-50/30'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        alert.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                        alert.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {alert.title}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            alert.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            alert.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Regular Notifications */}
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No alerts yet
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.metadata.link || '/alerts-history'}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block p-4 hover:bg-neutral-300/20 border-b border-neutral-400/10 transition-all ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-200 flex-shrink-0">
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        {getNotificationMessage(notification)}
                      </p>
                      {notification.metadata.preview && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.metadata.preview}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-neutral-400/20 bg-neutral-300/10">
            <Link
              href="/alerts-history"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all alerts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
