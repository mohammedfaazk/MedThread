'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, AlertCircle, Heart, Pill, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MedicalArticle {
  id: string;
  title: string;
  category: 'condition' | 'first-aid' | 'emergency' | 'medication' | 'prevention';
  content: string;
  symptoms?: string[];
  treatments?: string[];
  whenToSeekHelp?: string[];
  verified: boolean;
  lastUpdated: Date;
}

const categoryIcons = {
  condition: Heart,
  'first-aid': Activity,
  emergency: AlertCircle,
  medication: Pill,
  prevention: BookOpen
};

const categoryColors = {
  condition: 'bg-blue-100 text-blue-700',
  'first-aid': 'bg-green-100 text-green-700',
  emergency: 'bg-red-100 text-red-700',
  medication: 'bg-purple-100 text-purple-700',
  prevention: 'bg-yellow-100 text-yellow-700'
};

export default function MedicalLibraryPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<MedicalArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<MedicalArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchQuery, selectedCategory, articles]);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/medical-library/articles`);
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
        setFilteredArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.symptoms?.some(s => s.toLowerCase().includes(query)) ||
        article.treatments?.some(t => t.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  };

  const categories = [
    { value: 'all', label: 'All Articles' },
    { value: 'condition', label: 'Conditions' },
    { value: 'first-aid', label: 'First Aid' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'medication', label: 'Medications' },
    { value: 'prevention', label: 'Prevention' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Knowledge Center</h1>
          <p className="text-gray-600">Verified health information, first aid guides, and emergency procedures</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles, symptoms, treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredArticles.length} of {articles.length} articles
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => {
            const Icon = categoryIcons[article.category];
            return (
              <div
                key={article.id}
                onClick={() => router.push(`/articles/${article.id}`)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[article.category]}`}>
                      <Icon className="w-3 h-3" />
                      {article.category.replace('-', ' ')}
                    </span>
                    {article.verified && (
                      <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {article.content.substring(0, 150)}...
                  </p>

                  {/* Symptoms/Treatments Preview */}
                  {article.symptoms && article.symptoms.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Key Symptoms:</p>
                      <div className="flex flex-wrap gap-1">
                        {article.symptoms.slice(0, 3).map((symptom, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {symptom}
                          </span>
                        ))}
                        {article.symptoms.length > 3 && (
                          <span className="text-xs text-gray-500">+{article.symptoms.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Read More */}
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Read full article →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
