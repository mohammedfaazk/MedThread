'use client';

import React, { useState, useEffect } from 'react';

interface SearchFilters {
  specialty?: string;
  location?: string;
  minExperience?: number;
  minRating?: number;
  languages?: string[];
}

export const EnhancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'doctors' | 'posts' | 'symptoms'>('doctors');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/v1/search/${searchType}?${params}`);
      const data = await response.json();
      setResults(data.posts || data.doctors || data.suggestions || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="space-y-4">
        {/* Search Type Tabs */}
        <div className="flex gap-2 border-b">
          {(['doctors', 'posts', 'symptoms'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 capitalize ${
                searchType === type
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search ${searchType}...`}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        {searchType === 'doctors' && (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Specialty"
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Location"
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Min Experience (years)"
              onChange={(e) => setFilters({ ...filters, minExperience: parseInt(e.target.value) })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Min Rating"
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        )}

        {/* Results */}
        <div className="space-y-2">
          {results.length > 0 ? (
            results.map((result: any, idx) => (
              <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="font-medium">{result.username || result.title || result.symptom}</div>
                <div className="text-sm text-gray-600">
                  {result.specialty || result.content?.substring(0, 100) || result.description}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {query ? 'No results found' : 'Enter a search query'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
