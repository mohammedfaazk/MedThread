'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { PriorityFeedFilter } from '@/components/feed/PriorityFeedFilter';
import { PostPriorityBadge } from '@/components/feed/PostPriorityBadge';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import Link from 'next/link';
import { MessageSquare, ThumbsUp, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  priority?: {
    priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    urgencyScore: number;
    detectedSymptoms: any[];
  };
  priorityBadge?: {
    emoji: string;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
  };
  urgencyScore: number;
  detectedSymptoms: Array<{
    symptom: string;
    weight: number;
    category: string;
  }>;
}

export default function DoctorFeedPage() {
  const { user, role, loading: authLoading } = useJWTAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [priorityStats, setPriorityStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    // Check if user is a doctor (role is 'DOCTOR' or 'VERIFIED_DOCTOR')
    const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR';
    
    if (!user || !isDoctor) {
      console.log('[DoctorFeed] Access denied. User:', user, 'Role:', role);
      router.push('/');
      return;
    }
    
    console.log('[DoctorFeed] Access granted. Loading feed...');
    fetchPrioritizedFeed();
  }, [priorityFilter, role, user, authLoading, router]);

  const fetchPrioritizedFeed = async (pageNum = 1) => {
    if (!user) return;
    
    setLoading(pageNum === 1);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/post-priority/doctor-feed?page=${pageNum}&limit=20&priority=${priorityFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        if (pageNum === 1) {
          console.log('🔍 Doctor Feed Debug - Posts received:', result.data.posts.length);
          console.log('🔍 First post data:', result.data.posts[0]);
          setPosts(result.data.posts);
          setPriorityStats(result.data.priorityStats);
        } else {
          setPosts(prev => [...prev, ...result.data.posts]);
        }
        setHasMore(result.data.pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching prioritized feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPrioritizedFeed(page + 1);
    }
  };

  if (authLoading) {
    return <PageLoader message="Loading doctor feed..." />;
  }

  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR';
  
  if (!user || !isDoctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-2">This page is only available to verified doctors.</p>
            <p className="text-sm text-gray-500">Current role: {role || 'Not logged in'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Medical Disclaimer */}
        <MedicalDisclaimer className="mb-6" />
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Priority Feed</h1>
          <p className="text-gray-600">
            Patient posts automatically sorted by medical urgency to help you prioritize care.
          </p>
        </div>

        {/* Priority Filter */}
        <PriorityFeedFilter
          currentFilter={priorityFilter}
          onFilterChange={setPriorityFilter}
          priorityStats={priorityStats}
        />

        {/* Posts Feed */}
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Priority Badge */}
                {post.priority && (
                  <div className="mb-4">
                    <PostPriorityBadge
                      priority={post.priority.priorityLevel}
                      urgencyScore={post.urgencyScore}
                      detectedSymptoms={post.detectedSymptoms || []}
                      showDetails={post.urgencyScore > 5}
                    />
                  </div>
                )}

                {/* Post Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      post.author.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link 
                        href={`/u/${post.author.username}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {post.author.username}
                      </Link>
                      {post.author.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                      <span className="text-sm text-gray-500">
                        {post.author.role === 'PATIENT' ? 'Patient' : post.author.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 flex-wrap">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      {post.community && (
                        <>
                          <span>•</span>
                          <Link 
                            href={`/m/${post.community.name}`}
                            className="text-blue-600 hover:underline"
                          >
                            m/{post.community.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <Link href={`/post/${post.id}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                </Link>

                {/* Post Actions */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post._count.votes} votes</span>
                  </div>
                  <Link 
                    href={`/post/${post.id}`}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post._count.comments} comments</span>
                  </Link>
                  <Link 
                    href={`/u/${post.author.username}`}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600">
              No posts match the current priority filter. Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}