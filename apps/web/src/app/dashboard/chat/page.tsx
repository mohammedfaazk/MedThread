'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJWTAuth } from '@/context/JWTAuthContext';
import ChatList from '@/components/Chat/ChatList';
import ChatWindow from '@/components/Chat/ChatWindow';

export default function DashboardChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, loading } = useJWTAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Check for conversation ID in URL
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [loading, user, router, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${isMobile && selectedConversationId ? 'hidden' : 'w-full md:w-1/3 lg:w-1/4'} border-r border-gray-200`}>
        <ChatList
          currentUserId={user.id}
          token={localStorage.getItem('token') || ''}
          onSelectConversation={setSelectedConversationId}
          selectedConversationId={selectedConversationId || undefined}
        />
      </div>
      
      <div className={`${isMobile && !selectedConversationId ? 'hidden' : 'flex-1'}`}>
        {selectedConversationId ? (
          <div className="h-full flex flex-col">
            {isMobile && (
              <button
                onClick={() => setSelectedConversationId(null)}
                className="p-4 border-b flex items-center gap-2 text-gray-700 hover:bg-gray-50"
              >
                ← Back to conversations
              </button>
            )}
            <ChatWindow
              conversationId={selectedConversationId}
              currentUserId={user.id}
              token={localStorage.getItem('token') || ''}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-2">Select a conversation to start chatting</p>
              <p className="text-sm">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
