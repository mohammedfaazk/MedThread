'use client'

import { useEffect } from 'react';
import { usePagination } from '../hooks/usePagination';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import OptimizedImage from './OptimizedImage';
import LazyLoad from './LazyLoad';
import { transformCloudinaryUrl } from '../lib/cdn';

interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  author: {
    id: string;
    username: string;
    avatar?: string;
    role: string;
    verified: boolean;
  };
  community?: {
    id: string;
    name: string;
    icon?: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
  createdAt: string;
}

export default function PostsFeed() {
  const {
    data: posts,
    isLoading,
    error,
    hasNext,
    loadMore,
    refresh,
  } = usePagination<Post>({
    endpoint: 'http://localhost:3001/api/posts',
    limit: 10,
  });

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hasNext,
    isLoading,
  });

  useEffect(() => {
    refresh();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {posts.map((post, index) => (
        <LazyLoad
          key={post.id}
          threshold={0.1}
          rootMargin="100px"
          placeholder={
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          }
        >
          <article className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            {/* Author Info */}
            <div className="p-4 flex items-center gap-3 border-b">
              {post.author.avatar ? (
                <OptimizedImage
                  src={transformCloudinaryUrl(post.author.avatar, {
                    width: 40,
                    height: 40,
                    crop: 'thumb',
                    gravity: 'face',
                  })}
                  alt={post.author.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {post.author.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{post.author.username}</span>
                  {post.author.verified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {post.community && (
                  <span className="text-sm text-gray-500">in {post.community.name}</span>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-700 line-clamp-3">{post.content}</p>

              {/* Media */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {post.mediaUrls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative aspect-video">
                      <OptimizedImage
                        src={url}
                        alt={`Post media ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="rounded-lg object-cover"
                        quality={75}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Stats */}
            <div className="px-4 py-3 border-t flex items-center gap-6 text-gray-600">
              <button className="flex items-center gap-2 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{post._count.comments} comments</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span>{post._count.votes} votes</span>
              </button>
            </div>
          </article>
        </LazyLoad>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading more posts...</p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-10" />

      {/* End of feed */}
      {!hasNext && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end!
        </div>
      )}
    </div>
  );
}
