'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ChatInbox from '@/components/Chat/ChatInbox';
import ChatWindow from '@/components/Chat/ChatWindow';
import IridescenceLayout from '@/components/IridescenceLayout';
import { 
  ArrowLeft, 
  AlertCircle, 
  Lock, 
  LayoutDashboard, 
  MessageSquare, 
  Calendar,
  User,
  Settings,
  LogOut,
  Stethoscope,
  Users
} from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add chat-page class to body
  useEffect(() => {
    document.body.classList.add('chat-page');
    return () => {
      document.body.classList.remove('chat-page');
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUserData = localStorage.getItem('user');
    
    if (!storedToken || !storedUserData) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(storedUserData);
      setCurrentUserId(userData.id);
      setToken(storedToken);
      setUserRole(userData.role);
      setUsername(userData.username || 'User');

      if (userData.role === 'DOCTOR' && !isVerified) {
        setShowPasswordModal(true);
      } else {
        setIsVerified(true);
      }

      const conversationId = searchParams.get('conversation');
      if (conversationId) {
        setSelectedConversationId(conversationId);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, isVerified]);

  const handlePasswordVerification = async () => {
    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('🔍 Attempting password verification...');
      console.log('API_URL:', API_URL);
      console.log('Token exists:', !!token);
      console.log('Password length:', password.length);
      
      const response = await fetch(`${API_URL}/api/auth/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        console.log('✅ Password verification successful');
        setIsVerified(true);
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError('');
      } else {
        const errorData = await response.text();
        console.log('❌ Password verification failed:', errorData);
        setPasswordError('Incorrect password');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError('Verification failed. Please try again.');
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setAccessDeniedReason(null);
    
    const url = new URL(window.location.href);
    url.searchParams.set('conversation', conversationId);
    window.history.pushState({}, '', url.toString());
  };

  const handleAccessDenied = (reason: string) => {
    setAccessDeniedReason(reason);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setAccessDeniedReason(null);
    
    const url = new URL(window.location.href);
    url.searchParams.delete('conversation');
    window.history.pushState({}, '', url.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!currentUserId || !token) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(135deg, #f6e3af 0%, #7dc2f1 100%)' }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8">
        <AlertCircle size={64} className="text-blue-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Please log in to access the chat system
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (showPasswordModal && userRole === 'DOCTOR') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" style={{ position: 'relative', zIndex: 10000 }}>
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center mb-2">Verify Your Identity</h2>
          <p className="text-gray-600 text-center mb-4">
            For security purposes, please enter your password to access patient chats
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>Hint:</strong> Use the same password you used to log in
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordVerification();
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                autoFocus
                style={{ position: 'relative', zIndex: 10001 }}
              />
              {passwordError && (
                <div className="mt-2">
                  <p className="text-red-600 text-sm">{passwordError}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Make sure you're using the exact password you used to log in to the app
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handlePasswordVerification}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              style={{ position: 'relative', zIndex: 10001 }}
            >
              Verify & Continue
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
              style={{ position: 'relative', zIndex: 10001 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <IridescenceLayout className="h-screen flex flex-col">
        <div className="px-4 py-3 flex items-center gap-3" style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          {selectedConversationId && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-semibold">
            {selectedConversationId ? 'Chat' : 'Messages'}
          </h1>
        </div>

        <div className="flex-1 overflow-hidden">
          {accessDeniedReason ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">{accessDeniedReason}</p>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Messages
              </button>
            </div>
          ) : selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              currentUserId={currentUserId}
              token={token}
              username={username}
              onAccessDenied={handleAccessDenied}
            />
          ) : (
            <ChatInbox
              currentUserId={currentUserId}
              token={token}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId || undefined}
            />
          )}
        </div>
      </IridescenceLayout>
    );
  }

  // Desktop view with sidebar
  const dashboardPath = userRole === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient';
  
  return (
    <IridescenceLayout className="chat-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{username}</div>
              <div className="text-xs text-gray-500">
                {userRole === 'DOCTOR' ? 'Doctor' : 'Patient'}
              </div>
            </div>
          </div>
        </div>

        <nav className="chat-sidebar-nav">
          <Link href={dashboardPath}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/chat" className="active">
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
          
          <Link href={userRole === 'DOCTOR' ? '/dashboard/doctor/appointments' : '/appointments'}>
            <Calendar size={20} />
            <span>Appointments</span>
          </Link>
          
          {userRole === 'DOCTOR' && (
            <Link href="/doctor-verification">
              <Stethoscope size={20} />
              <span>Verification</span>
            </Link>
          )}
          
          {userRole === 'PATIENT' && (
            <Link href="/doctors">
              <Users size={20} />
              <span>Find Doctors</span>
            </Link>
          )}
          
          <Link href="/profile">
            <User size={20} />
            <span>Profile</span>
          </Link>
          
          <Link href="/settings">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="chat-main-content">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="chat-conversations-list">
            <div className="p-4 border-b bg-white" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 className="text-xl font-semibold" style={{ color: 'rgba(45, 45, 45, 0.9)' }}>Conversations</h2>
            </div>
            <ChatInbox
              currentUserId={currentUserId}
              token={token}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId || undefined}
            />
          </div>

          {/* Chat Window */}
          <div className="chat-window-container">
            {accessDeniedReason ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertCircle size={64} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6 max-w-md">{accessDeniedReason}</p>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back to Messages
                </button>
              </div>
            ) : selectedConversationId ? (
              <ChatWindow
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
                token={token}
                onAccessDenied={handleAccessDenied}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-gray-700">Select a conversation</h3>
                  <p className="text-sm text-gray-500">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </IridescenceLayout>
  );
}
