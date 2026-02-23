'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCheck } from 'lucide-react';

interface Conversation {
  id: string;
  appointment: {
    id: string;
    status: string;
    startTime: string;
    patient: {
      id: string;
      username: string;
      avatar?: string;
    };
    doctor: {
      id: string;
      username: string;
      avatar?: string;
      specialty?: string;
    };
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
    };
  }>;
  unreadCount?: number;
  lastMessageAt?: string;
}

interface ChatListProps {
  currentUserId: string;
  token: string;
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export default function ChatList({
  currentUserId,
  token,
  onSelectConversation,
  selectedConversationId
}: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v2/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    const isPatient = conversation.appointment.patient.id === currentUserId;
    return isPatient ? conversation.appointment.doctor : conversation.appointment.patient;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
        <MessageCircle size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm mt-2">
          Book an appointment with a verified doctor to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>

      <div className="divide-y">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const lastMessage = conversation.messages[0];
          const isSelected = conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {otherUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherUser.username}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  {('specialty' in otherUser && otherUser.specialty) ? (
                    <p className="text-xs text-gray-500 mb-1">
                      {String(otherUser.specialty)}
                    </p>
                  ) : null}

                  {lastMessage && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {lastMessage.sender.id === currentUserId && (
                          <CheckCheck size={14} className="inline mr-1" />
                        )}
                        {lastMessage.content}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Appointment info */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>
                      Appointment: {new Date(conversation.appointment.startTime).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        conversation.appointment.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {conversation.appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
