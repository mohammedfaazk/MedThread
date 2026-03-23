'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, User, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        searchAutocomplete();
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const searchAutocomplete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/search/autocomplete?q=${encodeURIComponent(query)}&type=all&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search doctors, posts, symptoms..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : results ? (
            <div className="py-2">
              {/* Doctors */}
              {results.doctors && results.doctors.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Doctors
                  </div>
                  {results.doctors.map((doctor: any) => (
                    <Link
                      key={doctor.id}
                      href={`/u/${doctor.username}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{doctor.username}</div>
                        {doctor.specialty && (
                          <div className="text-sm text-gray-500">{doctor.specialty}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Posts */}
              {results.posts && results.posts.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Posts
                  </div>
                  {results.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Symptoms */}
              {results.symptoms && results.symptoms.suggestions && results.symptoms.suggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Symptoms
                  </div>
                  {results.symptoms.suggestions.slice(0, 5).map((symptom: string, idx: number) => (
                    <Link
                      key={idx}
                      href={`/search?q=${encodeURIComponent(symptom)}&type=posts`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Activity className="h-5 w-5 text-orange-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 capitalize">{symptom}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {(!results.doctors || results.doctors.length === 0) &&
               (!results.posts || results.posts.length === 0) &&
               (!results.symptoms?.suggestions || results.symptoms.suggestions.length === 0) && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}

              {/* View All Results */}
              <div className="border-t border-gray-200 mt-2">
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-3 text-center text-blue-600 hover:bg-gray-50 font-medium transition-colors"
                >
                  View all results for "{query}"
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
