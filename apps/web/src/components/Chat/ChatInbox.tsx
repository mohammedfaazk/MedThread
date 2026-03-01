'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Circle, Clock, Check, CheckCheck } from 'lucide-react'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'

interface ConversationPreview {
  id: string
  participants: Array<{
    id: string
    username: string
    avatar?: string
    role: string
  }>
  lastMessage?: {
    id: string
    content: string
    senderId: string
    createdAt: string
    isRead: boolean
  }
  unreadCount: number
  isOnline?: boolean
  isTyping?: boolean
  lastMessageAt?: string
}

interface ChatInboxProps {
  currentUserId: string
  token: string
  onSelectConversation: (conversationId: string) => void
  selectedConversationId?: string
}

export default function ChatInbox({
  currentUserId,
  token,
  onSelectConversation,
  selectedConversationId
}: ChatInboxProps) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [socket, setSocket] = useState<Socket | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Fetch conversations with optimized query (no full message history)
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      // Use the standard conversations endpoint
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
        params: { userId: currentUserId },
        headers: { Authorization: `Bearer ${token}` }
      })

      // Transform to preview format if needed
      const conversations = response.data
      const previews = Array.isArray(conversations) ? conversations.map((conv: any) => ({
        id: conv.id,
        participants: conv.participants || [],
        lastMessage: conv.messages?.[0] || conv.lastMessage || null,
        unreadCount: conv.unreadCount || 0,
        lastMessageAt: conv.lastMessageAt || conv.messages?.[0]?.createdAt
      })) : []

      setConversations(previews)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [currentUserId, token, API_URL])

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Socket connected for inbox')
      newSocket.emit('user_online', currentUserId)
    })

    // Listen for online status updates
    newSocket.on('user_status', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev)
        if (isOnline) {
          updated.add(userId)
        } else {
          updated.delete(userId)
        }
        return updated
      })
    })

    // Listen for typing indicators
    newSocket.on('user_typing', ({ conversationId, userId, isTyping }: any) => {
      if (userId !== currentUserId) {
        setTypingUsers(prev => {
          const updated = new Map(prev)
          if (isTyping) {
            updated.set(conversationId, userId)
          } else {
            updated.delete(conversationId)
          }
          return updated
        })
      }
    })

    // Listen for new messages
    newSocket.on('receive_message', (message: any) => {
      setConversations(prev => {
        const updated = [...prev]
        const convIndex = updated.findIndex(c => c.id === message.conversationId)
        
        if (convIndex !== -1) {
          const conv = updated[convIndex]
          
          // Update last message
          conv.lastMessage = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            isRead: message.isRead || false
          }
          
          // Increment unread count if not from current user
          if (message.senderId !== currentUserId) {
            conv.unreadCount = (conv.unreadCount || 0) + 1
          }
          
          conv.lastMessageAt = message.createdAt
          
          // Move to top
          updated.splice(convIndex, 1)
          updated.unshift(conv)
        }
        
        return updated
      })
    })

    // Listen for read receipts
    newSocket.on('messages_read', ({ conversationId }: { conversationId: string }) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    })

    // Listen for unread count updates
    newSocket.on('unread_count_update', ({ conversationId, count }: any) => {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: count }
            : conv
        )
      )
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('user_offline', currentUserId)
      newSocket.disconnect()
    }
  }, [currentUserId, token, API_URL])

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    
    const otherParticipant = conv.participants.find(p => p.id !== currentUserId)
    const username = otherParticipant?.username?.toLowerCase() || ''
    const lastMessageContent = conv.lastMessage?.content?.toLowerCase() || ''
    
    return username.includes(searchQuery.toLowerCase()) || 
           lastMessageContent.includes(searchQuery.toLowerCase())
  })

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get other participant
  const getOtherParticipant = (conv: ConversationPreview) => {
    return conv.participants.find(p => p.id !== currentUserId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <p className="text-center">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map(conv => {
            const otherParticipant = getOtherParticipant(conv)
            const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false
            const isTyping = typingUsers.has(conv.id)
            const isSelected = conv.id === selectedConversationId
            const isUnread = conv.unreadCount > 0

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full p-4 border-b transition-colors text-left ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {otherParticipant?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {otherParticipant?.role === 'DOCTOR' ? 'Dr. ' : ''}
                        {otherParticipant?.username || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTimestamp(conv.lastMessageAt || conv.lastMessage?.createdAt)}
                      </span>
                    </div>

                    {/* Last message or typing indicator */}
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {isTyping ? (
                          <span className="flex items-center gap-1 text-blue-600">
                            <span className="animate-pulse">typing</span>
                            <span className="flex gap-0.5">
                              <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                          </span>
                        ) : conv.lastMessage ? (
                          <>
                            {conv.lastMessage.senderId === currentUserId && (
                              <span className="mr-1">
                                {conv.lastMessage.isRead ? (
                                  <CheckCheck className="w-4 h-4 inline text-blue-600" />
                                ) : (
                                  <Check className="w-4 h-4 inline text-gray-400" />
                                )}
                              </span>
                            )}
                            {conv.lastMessage.content}
                          </>
                        ) : (
                          <span className="text-gray-400">No messages yet</span>
                        )}
                      </p>

                      {/* Unread badge */}
                      {isUnread && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
