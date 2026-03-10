'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';
import IridescenceLayout from '@/components/IridescenceLayout';
import SpotlightCard from '@/components/enhancements/SpotlightCard';
import { Users, Plus, TrendingUp, Search } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import CountUp from '@/components/enhancements/CountUp';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Community {
  id: string;
  name: string;
  displayName: string;
  memberCount: number;
  description?: string;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/communities?limit=100&sortBy=members`);
      setCommunities(response.data.communities || response.data);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Communities</h1>
              <p className="text-gray-600">Discover and join medical communities</p>
            </div>

            {/* Search and Create */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800"
                />
              </div>
              <Link
                href="/communities/create"
                className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Community</span>
              </Link>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <SpotlightCard className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'No communities found matching your search' : 'No communities yet'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/communities/create"
                    className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition shadow-lg"
                  >
                    Create the First Community
                  </Link>
                )}
              </SpotlightCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCommunities.map((community) => (
                  <SpotlightCard
                    key={community.id}
                    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => router.push(`/m/${community.name}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">m/{community.name}</h3>
                            {community.displayName && (
                              <p className="text-sm text-gray-600">{community.displayName}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {community.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="font-semibold">
                            <CountUp from={0} to={community.memberCount} duration={1.5} className="inline" />
                          </span>
                          <span>members</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/m/${community.name}`);
                          }}
                          className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 transition"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </IridescenceLayout>
  );
}
