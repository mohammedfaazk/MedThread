'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useJWTAuth } from './JWTAuthContext';
import { notificationSocket } from '@/lib/notificationSocket';

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  playSound: boolean;
  setPlaySound: (play: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [playSound, setPlaySound] = useState(false);
  const { user } = useJWTAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5;
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
      }
    } catch (error) {
      console.error('[NotificationContext] Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.count || 0);
      }
    } catch (error) {
      console.error('[NotificationContext] Error fetching unread count:', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
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

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Emit socket event for cross-tab sync
      notificationSocket.emitNotificationRead(notificationId);
    } catch (error) {
      console.error('[NotificationContext] Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
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

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);

      // Emit socket event for cross-tab sync
      notificationSocket.emitAllRead();
    } catch (error) {
      console.error('[NotificationContext] Error marking all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
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

      // Update local state
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NotificationContext] Error deleting notification:', error);
    }
  }, [notifications]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (playSound && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('[NotificationContext] Error playing sound:', error);
      });
    }
  }, [playSound]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        notificationSocket.connect(user.id, token);
        setConnected(true);

        // Fetch initial data
        fetchNotifications();
        fetchUnreadCount();
      }
    } else {
      notificationSocket.disconnect();
      setConnected(false);
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (!user) {
        notificationSocket.disconnect();
      }
    };
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Socket event listeners
  useEffect(() => {
    if (!connected) return;

    // Handle new notifications
    const handleNewNotification = (notification: Notification) => {
      console.log('[NotificationContext] New notification received:', notification);
      
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
      setUnreadCount((prev) => prev + 1);
      
      // Play sound
      playNotificationSound();
    };

    // Handle unread count updates
    const handleUnreadCountUpdate = (count: number) => {
      console.log('[NotificationContext] Unread count updated:', count);
      setUnreadCount(count);
    };

    // Handle notification read (cross-tab sync)
    const handleNotificationRead = (notificationId: string) => {
      console.log('[NotificationContext] Notification read:', notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    };

    // Handle all read (cross-tab sync)
    const handleAllRead = () => {
      console.log('[NotificationContext] All notifications marked as read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    };

    // Register event listeners
    notificationSocket.onNewNotification(handleNewNotification);
    notificationSocket.onUnreadCountUpdate(handleUnreadCountUpdate);
    notificationSocket.onNotificationRead(handleNotificationRead);
    notificationSocket.onAllRead(handleAllRead);

    // Cleanup
    return () => {
      notificationSocket.off('notification:new', handleNewNotification);
      notificationSocket.off('notification:unread-count', handleUnreadCountUpdate);
      notificationSocket.off('notification:read', handleNotificationRead);
      notificationSocket.off('notification:all-read', handleAllRead);
    };
  }, [connected, playNotificationSound]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    playSound,
    setPlaySound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
