import { io, Socket } from 'socket.io-client';

interface Post {
  id: string;
  title: string;
  content?: string;
  type: string;
  url?: string;
  mediaUrls: string[];
  authorId: string;
  communityId: string;
  isNSFW: boolean;
  isSpoiler: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    role: string;
    avatar?: string;
    doctorVerificationStatus?: string;
  };
  community: {
    id: string;
    name: string;
    displayName: string;
    icon?: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
}

interface PostCreatedEvent {
  post: Post;
  communityId: string;
  communityName: string;
}

export type PostCreatedHandler = (event: PostCreatedEvent) => void;

class PostSocketClient {
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
      console.log('[PostSocket] Already connected');
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
      console.log('[PostSocket] Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[PostSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[PostSocket] Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[PostSocket] Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[PostSocket] Reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Disconnect from socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('[PostSocket] Disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Listen for new post creation events
   */
  onPostCreated(handler: PostCreatedHandler): void {
    this.socket?.on('post:created', handler);
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
export const postSocket = new PostSocketClient();