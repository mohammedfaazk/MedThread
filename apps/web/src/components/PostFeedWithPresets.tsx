'use client'

import { useStore } from '@/store/useStore'
import { PostCard } from './PostCard'
import { useEffect, useState } from 'react'
import { Flame, Sparkles, ArrowUp, TrendingUp, Filter, X, Calendar, User, FileText, Save, Star, Trash2, Plus } from 'lucide-react'
import { useFilterPresets, FilterPreset } from '@/hooks/useFilterPresets'

interface PostFeedWithPresetsProps {
  community?: string
}

export function PostFeedWithPresets({ community }: PostFeedWithPresetsProps = {}) {
  const { posts, fetchPosts, sortBy, setSortBy, loading } = useStore()
  const { 
    presets, 
    savePreset, 
    deletePreset, 
    usePreset, 
    getDefaultPresets, 
    getCustomPresets,
    getMostUsed 
  } = useFilterPresets()
  
  const [showFilters, setShowFilters] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [presetName, setPresetName] = useState('')
  
  const [filters, setFilters] = useState({
    specialty: '',
    authorType: 'all' as 'all' | 'doctor' | 'patient',
    postType: '' as '' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL',
    dateRange: '' as '' | 'today' | 'week' | 'month' | 'year'
  })

  useEffect(() => {
    // Build filter options
    const options: any = { community, sort: sortBy }

    if (filters.specialty) options.specialty = filters.specialty
    if (filters.authorType !== 'all') options.authorType = filters.authorType
    if (filters.postType) options.postType = filters.postType

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

      if (dateFrom) options.dateFrom = dateFrom.toISOString()
    }

    fetchPosts(options)
  }, [community, sortBy, filters, fetchPosts])

  const applyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters as any)
    if (preset.sort) {
      setSortBy(preset.sort)
    }
    usePreset(preset.id)
    setShowPresets(false)
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    savePreset(presetName, filters, sortBy === 'controversial' ? 'hot' : sortBy)
    setPresetName('')
    setShowSavePreset(false)
    alert('Filter preset saved!')
  }

  const clearFilters = () => {
    setFilters({
      specialty: '',
      authorType: 'all',
      postType: '',
      dateRange: ''
    })
  }

  const hasActiveFilters = filters.specialty || filters.authorType !== 'all' || filters.postType || filters.dateRange
  const visiblePosts = posts.filter(post => !post.isHidden)
  const defaultPresets = getDefaultPresets()
  const customPresets = getCustomPresets()
  const mostUsed = getMostUsed(3)

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

          {/* Presets Button */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 hover:bg-purple-100 text-purple-700 border border-purple-200"
          >
            <Star className="w-4 h-4" />
            Presets
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

        {/* Presets Panel */}
        {showPresets && (
          <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Filter Presets</h3>
              <button
                onClick={() => setShowPresets(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Filters</p>
              <div className="grid grid-cols-2 gap-2">
                {defaultPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-left text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border border-blue-200/50 transition-all"
                  >
                    <div className="font-semibold text-gray-800">{preset.name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {preset.sort && `${preset.sort} • `}
                      {Object.keys(preset.filters).length} filters
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Presets */}
            {customPresets.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">My Presets</p>
                <div className="space-y-2">
                  {customPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between px-3 py-2 bg-white/50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <button
                        onClick={() => applyPreset(preset)}
                        className="flex-1 text-left"
                      >
                        <div className="font-semibold text-sm text-gray-800">{preset.name}</div>
                        <div className="text-xs text-gray-600">
                          Used {preset.usageCount} times
                        </div>
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Current Filters */}
            {hasActiveFilters && !showSavePreset && (
              <button
                onClick={() => setShowSavePreset(true)}
                className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-green-200"
              >
                <Plus className="w-4 h-4" />
                Save Current Filters as Preset
              </button>
            )}

            {/* Save Preset Form */}
            {showSavePreset && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Enter preset name..."
                  className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:border-green-500 mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePreset}
                    className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSavePreset(false)
                      setPresetName('')
                    }}
                    className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
            {hasActiveFilters ? 'Try adjusting your filters or use a preset' : 'Be the first to create a post!'}
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
