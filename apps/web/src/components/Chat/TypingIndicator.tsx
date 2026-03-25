'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface TypingUser {
  userId: string;
  username: string;
}

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

export function TypingIndicator({ conversationId, currentUserId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for typing events
    socket.on('user:typing', (data: { conversationId: string; userId: string; username: string; isTyping: boolean }) => {
      if (data.conversationId !== conversationId) return;
      if (data.userId === currentUserId) return; // Don't show own typing

      setTypingUsers(prev => {
        if (data.isTyping) {
          // Add user if not already in list
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, { userId: data.userId, username: data.username }];
          }
          return prev;
        } else {
          // Remove user
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    return () => {
      socket.off('user:typing');
    };
  }, [socket, conversationId, currentUserId]);

  if (typingUsers.length === 0) return null;

  const displayText = typingUsers.length === 1
    ? `${typingUsers[0].username} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
    : `${typingUsers.length} people are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{displayText}</span>
    </div>
  );
}
