import { io, Socket } from 'socket.io-client';

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

export type NotificationEventHandler = (notification: Notification) => void;
export type UnreadCountHandler = (count: number) => void;
export type NotificationReadHandler = (notificationId: string) => void;
export type AllReadHandler = () => void;

class NotificationSocketClient {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize socket connection with authentication
   */
  connect(userId: string, token: string): void {
    if (this.socket?.connected && this.userId === userId) {
      console.log('[NotificationSocket] Already connected');
      return;
    }

    this.userId = userId;

    // Create socket connection
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('[NotificationSocket] Connected');
      this.reconnectAttempts = 0;
      
      // Join notification room
      this.socket?.emit('notification:join', { userId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[NotificationSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[NotificationSocket] Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[NotificationSocket] Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[NotificationSocket] Reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      
      // Re-join notification room after reconnection
      this.socket?.emit('notification:join', { userId });
    });
  }

  /**
   * Disconnect from socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.emit('notification:leave');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('[NotificationSocket] Disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Listen for new notifications
   */
  onNewNotification(handler: NotificationEventHandler): void {
    this.socket?.on('notification:new', handler);
  }

  /**
   * Listen for unread count updates
   */
  onUnreadCountUpdate(handler: UnreadCountHandler): void {
    this.socket?.on('notification:unread-count', handler);
  }

  /**
   * Listen for notification read events (cross-tab sync)
   */
  onNotificationRead(handler: NotificationReadHandler): void {
    this.socket?.on('notification:read', handler);
  }

  /**
   * Listen for all notifications marked as read
   */
  onAllRead(handler: AllReadHandler): void {
    this.socket?.on('notification:all-read', handler);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      this.socket?.off(event, handler);
    } else {
      this.socket?.off(event);
    }
  }

  /**
   * Emit notification read event (for cross-tab sync)
   */
  emitNotificationRead(notificationId: string): void {
    this.socket?.emit('notification:read', { notificationId });
  }

  /**
   * Emit all notifications read event (for cross-tab sync)
   */
  emitAllRead(): void {
    this.socket?.emit('notification:all-read');
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const notificationSocket = new NotificationSocketClient();
