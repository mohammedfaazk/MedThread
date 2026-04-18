'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, AlertCircle, Heart, Pill, Shield } from 'lucide-react';

interface MedicalArticle {
  id: string;
  title: string;
  category: 'condition' | 'first-aid' | 'emergency' | 'medication' | 'prevention';
  content: string;
  symptoms?: string[];
  treatments?: string[];
  whenToSeekHelp?: string[];
  verified: boolean;
  lastUpdated: string;
}

const categoryIcons = {
  condition: Heart,
  'first-aid': Shield,
  emergency: AlertCircle,
  medication: Pill,
  prevention: BookOpen,
};

const categoryColors = {
  condition: 'bg-blue-100 text-blue-700',
  'first-aid': 'bg-green-100 text-green-700',
  emergency: 'bg-red-100 text-red-700',
  medication: 'bg-purple-100 text-purple-700',
  prevention: 'bg-yellow-100 text-yellow-700',
};

export default function MedicalLibraryPage() {
  const [articles, setArticles] = useState<MedicalArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<MedicalArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<MedicalArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, selectedCategory, searchQuery]);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/medical-library/articles`);
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
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
        article.content.toLowerCase().includes(query)
      );
    }

    setFilteredArticles(filtered);
  };

  const categories = [
    { id: 'all', label: 'All Articles', icon: BookOpen },
    { id: 'condition', label: 'Conditions', icon: Heart },
    { id: 'first-aid', label: 'First Aid', icon: Shield },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'medication', label: 'Medications', icon: Pill },
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Medical Library</h1>
          </div>
          <p className="text-gray-600">
            Verified health information, first aid guides, and emergency procedures
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, conditions, symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedArticle ? (
              /* Article Detail View */
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-blue-600 hover:text-blue-700 mb-4"
                >
                  ← Back to articles
                </button>

                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const Icon = categoryIcons[selectedArticle.category];
                    return <Icon className="h-6 w-6 text-gray-600" />;
                  })()}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedArticle.category]}`}>
                    {selectedArticle.category}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedArticle.title}
                </h1>

                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {selectedArticle.content}
                  </div>
                </div>

                {selectedArticle.symptoms && selectedArticle.symptoms.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptoms</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedArticle.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedArticle.treatments && selectedArticle.treatments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Treatments</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedArticle.treatments.map((treatment, index) => (
                        <li key={index}>{treatment}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedArticle.whenToSeekHelp && selectedArticle.whenToSeekHelp.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      When to Seek Medical Help
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-red-800">
                      {selectedArticle.whenToSeekHelp.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                  Last updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                  {selectedArticle.verified && (
                    <span className="ml-4 text-green-600">✓ Medically verified</span>
                  )}
                </div>
              </div>
            ) : (
              /* Articles List View */
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
                </div>

                <div className="grid gap-4">
                  {filteredArticles.map((article) => {
                    const Icon = categoryIcons[article.category];
                    return (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${categoryColors[article.category]}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-2 mb-3">
                              {article.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded ${categoryColors[article.category]}`}>
                                {article.category}
                              </span>
                              {article.verified && (
                                <span className="text-green-600">✓ Verified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No articles found matching your criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
