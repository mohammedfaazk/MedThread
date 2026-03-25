'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket if not already done
    if (!socket) {
      const token = localStorage.getItem('auth_token');
      
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return socket;
}

export function useTypingIndicator(conversationId: string, userId: string, username: string) {
  const socket = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout: NodeJS.Timeout;

  const startTyping = () => {
    if (!socket || isTyping) return;

    setIsTyping(true);
    socket.emit('typing:start', { conversationId, userId, username });

    // Auto-stop after 3 seconds
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!socket || !isTyping) return;

    setIsTyping(false);
    socket.emit('typing:stop', { conversationId, userId });
    clearTimeout(typingTimeout);
  };

  return { startTyping, stopTyping, isTyping };
}
