'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Search, User, FileText, Activity, Filter } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'doctors' | 'posts' | 'symptoms'>(type as any || 'all');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all' 
        ? `/api/v1/search?q=${encodeURIComponent(query)}`
        : `/api/v1/search/${activeTab}?q=${encodeURIComponent(query)}`;

      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            Showing results for: <span className="font-semibold">"{query}"</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['all', 'doctors', 'posts', 'symptoms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
              {results && activeTab === 'all' && results.totals && (
                <span className="ml-2 text-sm text-gray-500">
                  ({results.totals[tab] || 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : results ? (
          <div className="space-y-6">
            {/* Doctors Results */}
            {(activeTab === 'all' || activeTab === 'doctors') && results.doctors && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Doctors
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.doctors.map((doctor: any) => (
                    <Link
                      key={doctor.id}
                      href={`/u/${doctor.username}`}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Dr. {doctor.username}
                          </h3>
                          {doctor.specialty && (
                            <p className="text-sm text-blue-600 mb-2">{doctor.specialty}</p>
                          )}
                          {doctor.bio && (
                            <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            {doctor.yearsOfExperience && (
                              <span>{doctor.yearsOfExperience} years exp.</span>
                            )}
                            {doctor._count && (
                              <span>{doctor._count.posts + doctor._count.comments} contributions</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Posts
                </h2>
                <div className="space-y-4">
                  {results.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                      {post.content && (
                        <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>by {post.author.username}</span>
                        <span>•</span>
                        <span>{post._count.comments} comments</span>
                        <span>•</span>
                        <span>{post._count.votes} votes</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {activeTab !== 'all' && 
             ((activeTab === 'doctors' && (!results.doctors || results.doctors.length === 0)) ||
              (activeTab === 'posts' && (!results.posts || results.posts.length === 0))) && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
