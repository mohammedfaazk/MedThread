'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Users, Stethoscope } from 'lucide-react';
import FollowButton from './FollowButton';

interface User {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: string;
  specialty?: string;
  totalKarma: number;
  verified: boolean;
}

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowList({ userId, type }: FollowListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const endpoint = `${API_URL}/api/follow/${userId}/${type}`;
      const url = new URL(endpoint);
      if (loadMore && cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      if (loadMore) {
        setUsers((prev) => [...prev, ...data.data]);
      } else {
        setUsers(data.data);
      }

      setCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          <Link href={`/u/${user.username}`} className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                {user.role === 'DOCTOR' && (
                  <Stethoscope size={16} className="text-blue-600" />
                )}
                {user.verified && (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {user.specialty && (
                <p className="text-sm text-gray-600">{user.specialty}</p>
              )}

              {user.bio && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>
              )}

              <p className="text-xs text-gray-400 mt-1">{user.totalKarma} karma</p>
            </div>
          </Link>

          {currentUserId && currentUserId !== user.id && (
            <FollowButton userId={user.id} size="sm" variant="secondary" />
          )}
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => fetchUsers(true)}
          disabled={isLoadingMore}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? (
            <Loader2 className="animate-spin inline" size={20} />
          ) : (
            'Load More'
          )}
        </button>
      )}
    </div>
  );
}
