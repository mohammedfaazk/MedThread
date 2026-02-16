'use client'

import { useStore } from '@/store/useStore'
import { PostCard } from './PostCard'
import { useEffect, useState } from 'react'
import { Flame, Sparkles, ArrowUp, TrendingUp, Filter, X, Calendar, User, FileText } from 'lucide-react'

interface PostFeedEnhancedProps {
  community?: string
}

export function PostFeedEnhanced({ community }: PostFeedEnhancedProps = {}) {
  const { posts, fetchPosts, sortBy, setSortBy, loading } = useStore()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    specialty: '',
    authorType: 'all' as 'all' | 'doctor' | 'patient',
    postType: '' as '' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL',
    dateRange: '' as '' | 'today' | 'week' | 'month' | 'year'
  })

  useEffect(() => {
    // Build filter options
    const options: any = { community, sort: sortBy }

    if (filters.specialty) {
      options.specialty = filters.specialty
    }

    if (filters.authorType !== 'all') {
      options.authorType = filters.authorType
    }

    if (filters.postType) {
      options.postType = filters.postType
    }

    if (filters.dateRange) {
      const now = new Date()
      let dateFrom: Date | undefined

      switch (filters.dateRange) {
        case 'today':
          dateFrom = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          dateFrom = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          dateFrom = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'year':
          dateFrom = new Date(now.setFullYear(now.getFullYear() - 1))
          break
      }

      if (dateFrom) {
        options.dateFrom = dateFrom.toISOString()
      }
    }

    fetchPosts(options)
  }, [community, sortBy, filters, fetchPosts])

  const clearFilters = () => {
    setFilters({
      specialty: '',
      authorType: 'all',
      postType: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = filters.specialty || filters.authorType !== 'all' || filters.postType || filters.dateRange

  // Filter hidden posts
  const visiblePosts = posts.filter(post => !post.isHidden)

  return (
    <div className="space-y-3">
      {/* Sort Options */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-soft">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSortBy('hot')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              sortBy === 'hot' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
            }`}
          >
            <Flame className="w-4 h-4" />
            Hot
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              sortBy === 'new' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            New
          </button>
          <button
            onClick={() => setSortBy('top')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              sortBy === 'top' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
            Top
          </button>
          <button
            onClick={() => setSortBy('rising')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              sortBy === 'rising' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Rising
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
              showFilters || hasActiveFilters ? 'bg-blue-100 text-blue-700' : 'hover:bg-cream-50/50 text-charcoal'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Author Type Filter */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                  <User className="w-3 h-3" />
                  Author Type
                </label>
                <select
                  value={filters.authorType}
                  onChange={(e) => setFilters({ ...filters, authorType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm transition"
                >
                  <option value="all">All Users</option>
                  <option value="doctor">Doctors Only</option>
                  <option value="patient">Patients Only</option>
                </select>
              </div>

              {/* Post Type Filter */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                  <FileText className="w-3 h-3" />
                  Post Type
                </label>
                <select
                  value={filters.postType}
                  onChange={(e) => setFilters({ ...filters, postType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm transition"
                >
                  <option value="">All Types</option>
                  <option value="TEXT">Text Posts</option>
                  <option value="IMAGE">Image Posts</option>
                  <option value="VIDEO">Video Posts</option>
                  <option value="LINK">Link Posts</option>
                  <option value="POLL">Polls</option>
                </select>
              </div>

              {/* Specialty Filter */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                  <User className="w-3 h-3" />
                  Medical Specialty
                </label>
                <input
                  type="text"
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  placeholder="e.g., Cardiology"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm transition"
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                  <Calendar className="w-3 h-3" />
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white/50 backdrop-blur-sm transition"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                {filters.authorType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {filters.authorType === 'doctor' ? 'Doctors' : 'Patients'}
                    <button
                      onClick={() => setFilters({ ...filters, authorType: 'all' })}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.postType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {filters.postType}
                    <button
                      onClick={() => setFilters({ ...filters, postType: '' })}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.specialty && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {filters.specialty}
                    <button
                      onClick={() => setFilters({ ...filters, specialty: '' })}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.dateRange && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {filters.dateRange === 'today' ? 'Today' : 
                     filters.dateRange === 'week' ? 'Past Week' :
                     filters.dateRange === 'month' ? 'Past Month' : 'Past Year'}
                    <button
                      onClick={() => setFilters({ ...filters, dateRange: '' })}
                      className="hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading posts...</p>
        </div>
      )}

      {/* Posts */}
      {!loading && visiblePosts.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <p className="text-gray-500">
            No posts found{community ? ' in this community' : ''}
            {hasActiveFilters ? ' with these filters' : ''}.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to create a post!'}
          </p>
        </div>
      ) : (
        !loading && visiblePosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))
      )}
    </div>
  )
}
