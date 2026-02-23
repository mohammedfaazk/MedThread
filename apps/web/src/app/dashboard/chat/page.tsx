'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';
import { useJWTAuth } from '@/context/JWTAuthContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';

export default function DashboardChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, loading } = useJWTAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

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

    // For doctors, show password verification modal
    if (user && role === 'DOCTOR' && !isVerified) {
      setShowPasswordModal(true);
    } else if (user) {
      setIsVerified(true);
    }

    // Check for conversation ID in URL
    const conversationId = searchParams.get('convers