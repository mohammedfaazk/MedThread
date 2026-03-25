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
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [socket, setSocket] = useState<Socket | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  // Fetch conversations with optimized query (no full message history)
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔍 ChatInbox: Fetching conversations for user:', currentUserId)
      
      const response = await axios.get(`${API_URL}/api/v2/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('✅ ChatInbox: Received conversations:', response.data.data.length)
      
      // Transform v2 API response to preview format
      const previews = response.data.data.map((conv: any) => ({
        id: conv.id,
        participants: [
          {
            id: conv.appointment.patient.id,
            username: conv.appointment.patient.username,
            avatar: conv.appointment.patient.avatar,
            role: conv.appointment.patient.role
          },
          {
            id: conv.appointment.doctor.id,
            username: conv.appointment.doctor.username,
            avatar: conv.appointment.doctor.avatar,
            role: conv.appointment.doctor.role
          }
        ],
        lastMessage: conv.messages?.[0] || null,
        unreadCount: conv.unreadCount || 0,
        lastMessageAt: conv.messages?.[0]?.createdAt || conv.updatedAt
      }))

      setConversations(previews)
    } catch (error) {
      console.error('❌ ChatInbox: Error fetching conversations:', error)
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

  // Search through messages
  const searchMessages = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      // Search through all conversations and their messages
      const results: any[] = []
      
      for (const conv of conversations) {
        const otherParticipant = conv.participants.find(p => p.id !== currentUserId)
        const username = otherParticipant?.username?.toLowerCase() || ''
        const queryLower = query.toLowerCase()
        
        // Check if username matches
        if (username.includes(queryLower)) {
          results.push({
            type: 'participant',
            conversationId: conv.id,
            participant: otherParticipant,
            matchText: `Conversation with ${otherParticipant?.username}`,
            conversation: conv
          })
        }
        
        // Search through messages in this conversation
        try {
          const response = await axios.get(
            `${API_URL}/api/v2/chat/conversations/${conv.id}/messages?limit=100`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          const messages = response.data.data || []
          const matchingMessages = messages.filter((msg: any) => 
            msg.content.toLowerCase().includes(queryLower)
          )
          
          matchingMessages.forEach((msg: any) => {
            results.push({
              type: 'message',
              conversationId: conv.id,
              participant: otherParticipant,
              message: msg,
              matchText: msg.content,
              conversation: conv
            })
          })
        } catch (error) {
          console.error('Error searching messages in conversation:', conv.id, error)
        }
      }
      
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching messages:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [conversations, currentUserId, token, API_URL])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchMessages(searchQuery)
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery, searchMessages])

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

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 font-semibold">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    )
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
            placeholder="Search conversations or messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        {/* Search results count */}
        {searchQuery && !isSearching && searchResults.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Search Results or Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery && searchResults.length > 0 ? (
          /* Search Results */
          <div>
            {searchResults.map((result, index) => {
              const isSelected = result.conversationId === selectedConversationId
              
              return (
                <button
                  key={`${result.conversationId}-${result.type}-${index}`}
                  onClick={() => onSelectConversation(result.conversationId)}
                  className={`w-full p-4 border-b transition-colors text-left hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {result.participant?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {result.participant?.role === 'DOCTOR' ? 'Dr. ' : ''}
                          {result.participant?.username || 'Unknown User'}
                        </h3>
                        {result.type === 'participant' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Participant
                          </span>
                        )}
                        {result.type === 'message' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Message
                          </span>
                        )}
                      </div>

                      {/* Match preview */}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {result.type === 'message' && result.message && (
                          <span className="text-xs text-gray-400 mr-2">
                            {new Date(result.message.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {highlightMatch(result.matchText, searchQuery)}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : searchQuery && !isSearching && searchResults.length === 0 ? (
          /* No results */
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <Search className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-center font-medium">No results found</p>
            <p className="text-center text-sm mt-1">Try searching for a different keyword</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          /* No conversations */
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <p className="text-center">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          /* Regular conversations list */
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
