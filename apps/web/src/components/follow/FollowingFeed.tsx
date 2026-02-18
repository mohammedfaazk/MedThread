'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Heart, MessageCircle, Share2, Stethoscope } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    role: string;
    specialty?: string;
    verified: boolean;
  };
  community?: {
    id: string;
    name: string;
    displayName: string;
    icon?: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
}

export default function FollowingFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async (loadMore = false) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const url = new URL(`${API_URL}/api/follow/feed`);
      if (loadMore && cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data = await response.json();

      if (loadMore) {
        setPosts((prev) => [...prev, ...data.data]);
      } else {
        setPosts(data.data);
      }

      setCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching feed:', error);
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

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Stethoscope size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
        <p className="text-gray-600 mb-4">
          Follow verified doctors to see their posts here
        </p>
        <Link
          href="/doctors"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Discover Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Post Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Link href={`/u/${post.author.username}`}>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    post.author.username.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/u/${post.author.username}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {post.author.username}
                  </Link>
                  {post.author.role === 'DOCTOR' && (
                    <Stethoscope size={14} className="text-blue-600" />
                  )}
                  {post.author.verified && (
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

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {post.author.specialty && <span>{post.author.specialty}</span>}
                  {post.community && (
                    <>
                      <span>•</span>
                      <Link
                        href={`/m/${post.community.name}`}
                        className="hover:underline"
                      >
                        m/{post.community.name}
                      </Link>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <Link href={`/post/${post.id}`} className="block p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
              {post.title}
            </h2>
            <p className="text-gray-700 line-clamp-3">{post.content}</p>
          </Link>

          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-600">
            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              <Heart size={18} />
              <span>{post._count.votes}</span>
            </button>

            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <MessageCircle size={18} />
              <span>{post._count.comments}</span>
            </Link>

            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => fetchFeed(true)}
          disabled={isLoadingMore}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-semibold"
        >
          {isLoadingMore ? (
            <Loader2 className="animate-spin inline" size={20} />
          ) : (
            'Load More Posts'
          )}
        </button>
      )}
    </div>
  );
}
