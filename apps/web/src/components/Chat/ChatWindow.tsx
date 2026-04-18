'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Paperclip, Edit2, Trash2, Check, CheckCheck, Loader2, Mic, Edit3, MessageSquare } from 'lucide-react';
import VoiceRecorder from '@/components/features/VoiceRecorder';
import VoiceMessagePlayer from '@/components/features/VoiceMessagePlayer';
import ImageAnnotation from '@/components/features/ImageAnnotation';
import MessageTranslator from '@/components/features/MessageTranslator';
import UrgentMessageFlag, { UrgentBadge } from '@/components/features/UrgentMessageFlag';
import { EnhancedMessageInput } from '@/components/Chat/EnhancedMessageInput';
import { VoiceInput } from '@/components/VoiceInput';

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
  isUrgent?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
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
  username: string;
  onAccessDenied?: (reason: string) => void;
}

export default function ChatWindow({
  conversationId,
  currentUserId,
  token,
  username,
  onAccessDenied
}: ChatWindowProps) {
  console.log('🔍 ChatWindow initialized with:', {
    conversationId,
    currentUserId,
    tokenExists: !!token
  });

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
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For full-screen image view
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null); // Object URL for preview
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showImageAnnotation, setShowImageAnnotation] = useState(false);
  const [imageToAnnotate, setImageToAnnotate] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

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
      const url = new URL(`${API_URL}/api/v2/chat/conversations/${conversationId}/messages`);
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
      
      if (cursor) {
        setMessages(prev => [...data.data, ...prev]);
      } else {
        setMessages(data.data);
      }
      
      setHasMore(data.pagination.hasMore);
      setNextCursor(data.pagination.nextCursor);
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
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
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
      console.log('[Chat] Received message:', message.id, 'from:', message.senderId);
      
      setMessages(prev => {
        // Check if this message already exists (by ID)
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('[Chat] Message already exists, skipping:', message.id);
          return prev; // Don't add duplicates
        }
        
        // Check if this is replacing a temp message
        const tempIndex = prev.findIndex(m => 
          m.id.startsWith('temp-') && 
          m.senderId === message.senderId &&
          m.content === message.content
        );
        
        if (tempIndex !== -1) {
          console.log('[Chat] Replacing temp message with real one:', message.id);
          // Replace temp message with real one
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
        
        console.log('[Chat] Adding new message:', message.id);
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
      await fetch(`${API_URL}/api/v2/chat/conversations/${conversationId}/read`, {
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

  // Helper function to convert base64 to object URL for safe display
  const getImageObjectUrl = (base64Data: string | undefined): string => {
    if (!base64Data) {
      console.warn('getImageObjectUrl: No data provided');
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    try {
      // If it's already an object URL or regular URL, return as-is
      if (base64Data.startsWith('blob:') || base64Data.startsWith('http')) {
        return base64Data;
      }

      // If it's a plain base64 string without data URL prefix, assume it's an image
      if (!base64Data.startsWith('data:')) {
        console.log('Adding data URL prefix to plain base64 string');
        base64Data = `data:image/jpeg;base64,${base64Data}`;
      }

      // Check if it's a valid base64 data URL
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid base64 data URL format:', base64Data.substring(0, 50));
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }

      const mimeType = matches[1];
      const base64Content = matches[2];

      // Only process image types
      if (!mimeType.startsWith('image/')) {
        console.warn('getImageObjectUrl called with non-image type:', mimeType);
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }

      // Validate base64 content
      if (!base64Content || base64Content.length < 10) {
        console.error('Base64 content too short or empty');
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }

      // Decode base64
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and object URL
      const blob = new Blob([bytes], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      
      return objectUrl;
    } catch (error) {
      console.error('Failed to create object URL:', error, 'Data preview:', base64Data?.substring(0, 100));
      // Return a 1x1 transparent pixel as fallback
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  };

  // Helper function to download file from base64
  const downloadFile = (base64Data: string, filename: string) => {
    try {
      console.log('📥 Attempting to download:', filename, 'Data length:', base64Data?.length);
      
      if (!base64Data) {
        console.error('No data provided for download');
        alert('No file data available. Please try again.');
        return;
      }

      // If it's a plain base64 string without data URL prefix, we need to determine the type
      if (!base64Data.startsWith('data:')) {
        console.error('Missing data URL prefix. Cannot determine file type.');
        alert('Invalid file format. Please try uploading the file again.');
        return;
      }

      // Extract the base64 content and mime type
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        console.error('Invalid base64 data format. Expected: data:mime/type;base64,content');
        alert('Invalid file format. Please try uploading the file again.');
        return;
      }

      const mimeType = matches[1];
      const base64Content = matches[2];

      console.log('📄 File details:', { mimeType, contentLength: base64Content.length });

      // Validate base64 content
      if (!base64Content || base64Content.length === 0) {
        console.error('Empty base64 content');
        alert('File is empty. Please try again.');
        return;
      }

      // Convert base64 to binary
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob from binary data
      const blob = new Blob([bytes], { type: mimeType });

      // Verify blob was created successfully
      if (blob.size === 0) {
        console.error('Created blob is empty');
        alert('Failed to process file. Please try again.');
        return;
      }

      console.log('✅ Blob created:', { size: blob.size, type: blob.type });

      // Create object URL (trusted by browser)
      const url = URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();

      // Cleanup after a short delay to ensure download started
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ File downloaded successfully:', filename, `(${blob.size} bytes)`);
    } catch (error) {
      console.error('❌ Download failed:', error);
      if (error instanceof DOMException) {
        alert('Download blocked by browser. Please check your browser settings.');
      } else if (error instanceof Error && error.message.includes('atob')) {
        alert('Invalid file data. The file may be corrupted.');
      } else {
        alert('Failed to download file. Please try again.');
      }
    }
  };

  // Send message with optimistic UI
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() && !attachment) return;
    if (isSending) return;
    
    // Validate required data
    if (!conversationId) {
      console.error('❌ No conversationId provided');
      alert('Error: No conversation selected');
      return;
    }

    let messageContent = newMessage.trim();
    
    // If sending image without text, add default message
    if (!messageContent && attachment && attachment.startsWith('data:image')) {
      messageContent = '📷 Image';
    }
    
    // Either content or attachment must be provided
    if (!messageContent && !attachment) {
      console.error('❌ No message content or attachment');
      return;
    }

    const messageAttachment = attachment;
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Clear input immediately
    setNewMessage('');
    setAttachment(null);
    setIsUrgent(false);
    setUrgencyLevel('medium');

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
      type: messageAttachment ? (messageAttachment.startsWith('data:image') ? 'IMAGE' : 'FILE') : 'TEXT',
      attachment: messageAttachment || undefined,
      isUrgent,
      urgencyLevel: isUrgent ? urgencyLevel : undefined,
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
      console.log('🔍 Sending message with:', {
        conversationId,
        content: messageContent,
        type: messageAttachment ? 'IMAGE' : 'TEXT',
        attachment: messageAttachment
      });

      const response = await fetch(`${API_URL}/api/v2/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          content: messageContent || '', // Allow empty content for attachment-only messages
          type: messageAttachment ? (messageAttachment.startsWith('data:image') ? 'IMAGE' : 'FILE') : 'TEXT',
          attachment: messageAttachment,
          isUrgent,
          urgencyLevel: isUrgent ? urgencyLevel : undefined
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send message';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const textError = await response.text();
            errorMessage = textError || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempId));
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[Chat] Message sent successfully:', data.data.id);
      
      // Check if socket already added this message (via receive_message event)
      setMessages(prev => {
        const socketAlreadyAdded = prev.some(m => m.id === data.data.id);
        if (socketAlreadyAdded) {
          console.log('[Chat] Socket already added message, removing temp:', tempId);
          // Socket already added the real message, just remove temp
          return prev.filter(m => m.id !== tempId);
        }
        
        console.log('[Chat] Replacing temp message with real one:', tempId, '->', data.data.id);
        // Replace optimistic message with real one
        return prev.map(m => (m.id === tempId ? data.data : m));
      });
      
      // Scroll again after replacement
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 0);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Log detailed error information for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data type:', typeof error.response.data);
        console.error('Response data:', error.response.data);
      }
      
      alert(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [newMessage, attachment, conversationId, currentUserId, token, API_URL, socket, isTyping, isSending]);

  // Edit message
  const editMessage = useCallback(async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/v2/chat/messages/${messageId}`, {
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
      const response = await fetch(`${API_URL}/api/v2/chat/messages/${messageId}`, {
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

        const response = await fetch(`${API_URL}/api/v2/chat/upload`, {
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
          {/* Urgent Badge - Show above message bubble */}
          {message.isUrgent && message.urgencyLevel && (
            <div className="mb-1">
              <UrgentBadge level={message.urgencyLevel} />
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
                {/* Only show attachment UI if NOT a voice message */}
                {message.attachment && !message.content.includes('🎤 Voice message') && (
                  <>
                    {/* Determine if it's an image based on type field OR mime type in data URL */}
                    {(message.type === 'IMAGE' || (message.attachment.startsWith('data:image') && message.type !== 'FILE')) && (
                      <div 
                        className="mb-2 cursor-pointer group relative max-w-sm"
                        onClick={() => {
                          setImagePreview(message.attachment!);
                          const objUrl = getImageObjectUrl(message.attachment!);
                          setImageObjectUrl(objUrl);
                        }}
                      >
                        <img
                          src={getImageObjectUrl(message.attachment)}
                          alt="Attachment"
                          className="max-w-full rounded-lg hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            console.warn('Failed to load image attachment');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Show as file if type is FILE OR if it's not an image mime type */}
                    {(message.type === 'FILE' || (!message.attachment.startsWith('data:image') && message.type !== 'IMAGE')) && (
                      <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {message.attachment.startsWith('data:application/pdf') ? (
                              <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            ) : message.attachment.startsWith('data:application/vnd') || message.attachment.startsWith('data:application/msword') ? (
                              <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {message.attachment.startsWith('data:application/pdf') ? 'Document.pdf' : 
                               message.attachment.startsWith('data:application/vnd') ? 'Document.docx' : 
                               message.attachment.startsWith('data:application/msword') ? 'Document.doc' : 
                               'Document'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round((message.attachment.length * 0.75) / 1024)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const extension = message.attachment!.startsWith('data:application/pdf') ? 'pdf' : 
                                              message.attachment!.startsWith('data:application/vnd') ? 'docx' : 
                                              message.attachment!.startsWith('data:application/msword') ? 'doc' : 'file';
                              downloadFile(message.attachment!, `document-${Date.now()}.${extension}`);
                            }}
                            className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-full transition-colors"
                            title="Download"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Voice Message Player */}
                {message.content.includes('🎤 Voice message') && message.attachment ? (
                  <VoiceMessagePlayer
                    audioUrl={message.attachment}
                    duration={parseInt(message.content.match(/\((\d+)s\)/)?.[1] || '0')}
                    senderName={message.sender.username}
                    timestamp={new Date(message.createdAt)}
                  />
                ) : (
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
                
                {message.isEdited && (
                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                )}
              </>
            )}
          </div>

          {/* Timestamp, Read Receipts, and Translate - Outside bubble on white background */}
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
            
            {/* Translate button - inline at the end */}
            {!message.isDeleted && !message.content.includes('🎤 Voice message') && message.content.trim() && (
              <div className="ml-auto">
                <MessageTranslator text={message.content} token={token} />
              </div>
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
      {/* Chat Header with other user's name */}
      {messages.length > 0 && (
        <div className="border-b px-6 py-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xl">
              {messages[0].sender.id === currentUserId 
                ? messages.find(m => m.sender.id !== currentUserId)?.sender.username.charAt(0).toUpperCase() || '?'
                : messages[0].sender.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                {messages[0].sender.id === currentUserId 
                  ? messages.find(m => m.sender.id !== currentUserId)?.sender.username || 'User'
                  : messages[0].sender.username}
              </h2>
              <p className="text-sm text-gray-500">
                {messages[0].sender.id === currentUserId 
                  ? messages.find(m => m.sender.id !== currentUserId)?.sender.role === 'DOCTOR' ? 'Doctor' : 'Patient'
                  : messages[0].sender.role === 'DOCTOR' ? 'Doctor' : 'Patient'}
              </p>
            </div>
          </div>
        </div>
      )}
      
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
        
        {messages.map(renderMessage)}
        
        {otherUserTyping && (
          <div className="text-sm text-gray-500 italic">
            Typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        {/* Urgent Flag - Above attachment preview */}
        <div className="mb-2">
          <UrgentMessageFlag
            onToggle={(urgent, level) => {
              setIsUrgent(urgent);
              setUrgencyLevel(level);
            }}
            initialUrgent={isUrgent}
            initialLevel={urgencyLevel}
          />
        </div>
        
        {attachment && (
          <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              {attachment.startsWith('data:image') ? (
                <img 
                  src={getImageObjectUrl(attachment)} 
                  alt="Preview" 
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {attachment.startsWith('data:image') ? 'Image' : 
                   attachment.startsWith('data:application/pdf') ? 'PDF Document' : 
                   'Document'} ready to send
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((attachment.length * 0.75) / 1024)} KB
                </p>
              </div>
              
              {/* Annotate button for images */}
              {attachment.startsWith('data:image') && (
                <button
                  onClick={() => {
                    setImageToAnnotate(attachment);
                    setShowImageAnnotation(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                  title="Annotate image"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setAttachment(null)}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900"
                title="Remove attachment"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
            title="Attach file"
          >
            {uploadingFile ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Paperclip size={20} />
            )}
          </button>

          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Record voice message"
          >
            <Mic size={20} />
          </button>

          <button
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            className={`p-2 transition ${
              showVoiceInput
                ? 'bg-blue-600 text-white rounded-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Voice to text"
          >
            <MessageSquare size={20} />
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

        {/* Voice to Text Input */}
        {showVoiceInput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <VoiceInput
              onTranscript={(text) => {
                setNewMessage(prev => prev + (prev ? ' ' : '') + text);
                setShowVoiceInput(false);
              }}
              language="en"
            />
          </div>
        )}
      </div>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <VoiceRecorder
            onSend={async (audioBlob, duration) => {
              try {
                const formData = new FormData();
                formData.append('audio', audioBlob, 'voice-message.webm');
                formData.append('chatId', conversationId);
                formData.append('duration', duration.toString());

                const response = await fetch(`${API_URL}/api/v1/voice-messages/upload`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  },
                  body: formData
                });

                if (response.ok) {
                  const data = await response.json();
                  // Send voice message URL as a regular message
                  setAttachment(`${API_URL}${data.url}`);
                  setNewMessage(`🎤 Voice message (${duration}s)`);
                  setShowVoiceRecorder(false);
                  // Auto-send after setting attachment
                  setTimeout(() => sendMessage(), 100);
                } else {
                  alert('Failed to upload voice message');
                }
              } catch (error) {
                console.error('Error uploading voice message:', error);
                alert('Failed to upload voice message');
              }
            }}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </div>
      )}

      {/* Voice to Text Modal */}
      {showVoiceInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Voice to Text</h3>
            <VoiceInput
              onTranscript={(text) => {
                setNewMessage(prev => prev + (prev ? ' ' : '') + text);
                setShowVoiceInput(false);
              }}
              language="en"
            />
            <button
              onClick={() => setShowVoiceInput(false)}
              className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Image Preview Modal */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setImagePreview(null);
            if (imageObjectUrl) {
              URL.revokeObjectURL(imageObjectUrl);
              setImageObjectUrl(null);
            }
          }}
        >
          <button
            onClick={() => {
              setImagePreview(null);
              if (imageObjectUrl) {
                URL.revokeObjectURL(imageObjectUrl);
                setImageObjectUrl(null);
              }
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              const extension = imagePreview.startsWith('data:image/png') ? 'png' :
                              imagePreview.startsWith('data:image/gif') ? 'gif' :
                              imagePreview.startsWith('data:image/webp') ? 'webp' : 'jpg';
              downloadFile(imagePreview, `image-${Date.now()}.${extension}`);
            }}
            className="absolute top-4 left-4 text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50 flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Download</span>
          </button>

          <img
            src={imageObjectUrl || imagePreview}
            alt="Full size preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Image Annotation Modal */}
      {showImageAnnotation && imageToAnnotate && (
        <ImageAnnotation
          imageUrl={imageToAnnotate}
          onSave={(annotatedBlob) => {
            // Convert blob to data URL
            const reader = new FileReader();
            reader.onloadend = () => {
              setAttachment(reader.result as string);
              setShowImageAnnotation(false);
              setImageToAnnotate(null);
            };
            reader.readAsDataURL(annotatedBlob);
          }}
          onCancel={() => {
            setShowImageAnnotation(false);
            setImageToAnnotate(null);
          }}
        />
      )}
    </div>
  );
}
