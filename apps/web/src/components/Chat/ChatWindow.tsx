'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Paperclip, Edit2, Trash2, Check, CheckCheck, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  readAt?: string;
  attachment?: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  sender: {
    id: string;
    username: string;
    avatar?: string;
    role?: string;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  token: string;
  onAccessDenied?: (reason: string) => void;
}

export default function ChatWindow({
  conversationId,
  currentUserId,
  token,
  onAccessDenied
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Scroll to bottom (instant for new messages)
  const scrollToBottom = useCallback((smooth = false) => {
    if (smooth) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (cursor?: string) => {
    try {
      // Use v1 API to match ChatInbox
      const url = new URL(`${API_URL}/api/chat/conversations/${conversationId}/messages`);
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          onAccessDenied?.(error.error || 'Access denied');
        }
        throw new Error(error.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      
      // Handle both v1 and v2 response formats
      let messagesData = data.data || data.messages || data;
      const paginationData = data.pagination || {};
      
      // Ensure messagesData is an array and filter out invalid messages
      if (!Array.isArray(messagesData)) {
        messagesData = [];
      }
      messagesData = messagesData.filter(msg => msg && msg.id && msg.senderId);
      
      if (cursor) {
        setMessages(prev => [...messagesData, ...prev]);
      } else {
        setMessages(messagesData);
      }
      
      setHasMore(paginationData.hasMore || false);
      setNextCursor(paginationData.nextCursor || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [conversationId, token, API_URL, onAccessDenied]);

  // Load more messages
  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchMessages(nextCursor);
    }
  }, [hasMore, nextCursor, isLoadingMore, fetchMessages]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('[Chat] Connected to socket');
      setIsConnected(true);
      
      // Authenticate
      newSocket.emit('authenticate', { userId: currentUserId, token });
    });

    newSocket.on('authenticated', () => {
      console.log('[Chat] Authenticated');
      // Join conversation
      newSocket.emit('join_conversation', { conversationId });
    });

    newSocket.on('conversation_joined', () => {
      console.log('[Chat] Joined conversation');
    });

    newSocket.on('access_denied', (data: { reason: string; code: string }) => {
      console.error('[Chat] Access denied:', data);
      onAccessDenied?.(data.reason);
    });

    newSocket.on('disconnect', () => {
      console.log('[Chat] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => {
        // Check if this message already exists (by ID)
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          return prev; // Don't add duplicates
        }
        
        // Check if this is replacing a temp message
        const tempIndex = prev.findIndex(m => 
          m.id.startsWith('temp-') && 
          m.senderId === message.senderId &&
          m.content === message.content
        );
        
        if (tempIndex !== -1) {
          // Replace temp message with real one
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
        
        // Add new message
        return [...prev, message];
      });
      
      // Instant scroll for received messages
      setTimeout(() => scrollToBottom(), 0);
      
      // Mark as read if not from current user
      if (message.senderId !== currentUserId) {
        markAsRead();
      }
    });

    newSocket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUserId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    newSocket.on('message_edited', (message: Message) => {
      setMessages(prev =>
        prev.map(m => (m.id === message.id ? message : m))
      );
    });

    newSocket.on('message_deleted', (data: { messageId: string }) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === data.messageId
            ? { ...m, isDeleted: true, content: '', attachment: undefined }
            : m
        )
      );
    });

    newSocket.on('messages_read', (data: { userId: string; readAt: string }) => {
      if (data.userId !== currentUserId) {
        setMessages(prev =>
          prev.map(m =>
            m.senderId === currentUserId && !m.readAt
              ? { ...m, readAt: data.readAt }
              : m
          )
        );
      }
    });

    newSocket.on('conversation_deactivated', (data: { reason: string }) => {
      alert(`Chat deactivated: ${data.reason}`);
      onAccessDenied?.(data.reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_conversation', { conversationId });
      newSocket.disconnect();
    };
  }, [conversationId, currentUserId, token, API_URL, onAccessDenied, scrollToBottom]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [messages.length]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/chat/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationId, token, API_URL]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { conversationId, isTyping: false });
    }, 2000);
  }, [socket, isConnected, conversationId, isTyping]);

  // Send message with optimistic UI
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() && !attachment) return;
    if (isSending) return;

    const messageContent = newMessage.trim();
    const messageAttachment = attachment;
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Clear input immediately
    setNewMessage('');
    setAttachment(null);

    // Stop typing indicator immediately
    if (socket && isTyping) {
      socket.emit('typing', { conversationId, isTyping: false });
      setIsTyping(false);
    }

    // Optimistic UI: Add message immediately
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      type: messageAttachment ? 'IMAGE' : 'TEXT',
      attachment: messageAttachment || undefined,
      sender: {
        id: currentUserId,
        username: 'You',
        role: 'USER'
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    // Force scroll to bottom immediately after state update
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 0);
    
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
          type: messageAttachment ? 'IMAGE' : 'TEXT',
          attachment: messageAttachment
        })
      });

      if (!response.ok) {
        const error = await response.json();
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempId));
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Replace optimistic message with real one
      const realMessage = data.data || data;
      if (realMessage && realMessage.id) {
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? realMessage : m))
        );
      }
      
      // Scroll again after replacement
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 0);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [newMessage, attachment, conversationId, currentUserId, token, API_URL, socket, isTyping, isSending]);

  // Edit message
  const editMessage = useCallback(async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit message');
      }

      setEditingMessageId(null);
      setEditContent('');
    } catch (error: any) {
      console.error('Error editing message:', error);
      alert(error.message || 'Failed to edit message');
    }
  }, [editContent, token, API_URL]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      const response = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete message');
      }
    } catch (error: any) {
      console.error('Error deleting message:', error);
      alert(error.message || 'Failed to delete message');
    }
  }, [token, API_URL]);

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];

        const response = await fetch(`${API_URL}/api/chat/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            base64Data,
            filename: file.name,
            mimeType: file.type
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        setAttachment(data.data.url);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  }, [token, API_URL]);

  // Render message
  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === currentUserId;
    const isEditing = editingMessageId === message.id;
    const canEdit = isOwn && !message.isDeleted;
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const canEditTime = messageAge < 5 * 60 * 1000; // 5 minutes
    const isPending = message.id.startsWith('temp-'); // Optimistic message

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 ${
          isPending ? 'opacity-70' : ''
        }`}
      >
        <div className={`max-w-[70%]`}>
          {!isOwn && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender.username}
            </div>
          )}
          
          {/* Message Bubble */}
          <div
            className={`rounded-lg px-4 py-2 ${
              message.isDeleted
                ? 'message-deleted'
                : isOwn
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
            style={{
              borderRadius: '16px',
            }}
          >
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 px-2 py-1 rounded text-black"
                  autoFocus
                />
                <button
                  onClick={() => editMessage(message.id)}
                  className="text-green-500"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setEditContent('');
                  }}
                  className="text-red-500"
                >
                  ×
                </button>
              </div>
            ) : message.isDeleted ? (
              <p className="italic text-gray-500">
                <Trash2 size={14} className="inline mr-1" />
                This message was deleted
              </p>
            ) : (
              <>
                {message.attachment && message.type === 'IMAGE' && (
                  <img
                    src={message.attachment}
                    alt="Attachment"
                    className="max-w-full rounded mb-2"
                  />
                )}
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {message.isEdited && (
                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                )}
              </>
            )}
          </div>

          {/* Timestamp and Read Receipts - Outside bubble on white background */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            
            {isOwn && !message.isDeleted && (
              <>
                {isPending ? (
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                ) : message.readAt ? (
                  <CheckCheck size={14} className="text-blue-500" />
                ) : (
                  <Check size={14} className="text-gray-400" />
                )}
              </>
            )}
          </div>
          
          {/* Edit/Delete buttons - Completely outside bubble on white background */}
          {canEdit && canEditTime && !isPending && !message.isDeleted && (
            <div className="flex items-center gap-3 mt-2 bg-white px-2 py-1 rounded">
              <button
                onClick={() => {
                  setEditingMessageId(message.id);
                  setEditContent(message.content);
                }}
                className="text-gray-600 text-xs flex items-center gap-1"
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => deleteMessage(message.id)}
                className="text-gray-600 text-xs flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          if (target.scrollTop === 0 && hasMore && !isLoadingMore) {
            loadMore();
          }
        }}
      >
        {isLoadingMore && (
          <div className="text-center py-2">
            <Loader2 className="animate-spin inline" size={20} />
          </div>
        )}
        
        {messages.filter(msg => msg && msg.id).map(renderMessage)}
        
        {otherUserTyping && (
          <div className="text-sm text-gray-500 italic">
            Typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        {attachment && (
          <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
            <span className="text-sm">Attachment ready</span>
            <button
              onClick={() => setAttachment(null)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            {uploadingFile ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Paperclip size={20} />
            )}
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          
          <button
            onClick={sendMessage}
            disabled={isSending || (!newMessage.trim() && !attachment)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
