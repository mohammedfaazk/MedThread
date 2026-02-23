'use client';

import { useState } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  variant = 'primary',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleFollow = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to follow users');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isFollowing
        ? `${API_URL}/api/follow/${userId}`
        : `${API_URL}/api/follow/${userId}`;

      const response = await fetch(endpoint, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update follow status');
      }

      const newFollowStatus = !isFollowing;
      setIsFollowing(newFollowStatus);
      onFollowChange?.(newFollowStatus);
    } catch (error: any) {
      console.error('Follow error:', error);
      alert(error.message || 'Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: isFollowing
      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      : 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: isFollowing
      ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`
        flex items-center gap-2 rounded-lg font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isFollowing ? (
        <UserMinus size={16} />
      ) : (
        <UserPlus size={16} />
      )}
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
    </button>
  );
}
