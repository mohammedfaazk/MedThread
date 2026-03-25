'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';

interface MedicalArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  symptoms?: string[];
  treatments?: string[];
  whenToSeekHelp?: string[];
  verified: boolean;
  lastUpdated: Date;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<MedicalArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/medical-library/articles/${id}`);
      const data = await response.json();
      if (data.success) {
        setArticle(data.article);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
          <button
            onClick={() => router.push('/articles')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/articles')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to articles
        </button>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full capitalize">
                {article.category.replace('-', ' ')}
              </span>
              {article.verified && (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Verified Content
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-8">
            {article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 mb-4 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Symptoms */}
          {article.symptoms && article.symptoms.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Common Symptoms
              </h3>
              <ul className="space-y-2">
                {article.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatments */}
          {article.treatments && article.treatments.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Treatment Options
              </h3>
              <ul className="space-y-2">
                {article.treatments.map((treatment, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    {treatment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to Seek Help */}
          {article.whenToSeekHelp && article.whenToSeekHelp.length > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                When to Seek Medical Help
              </h3>
              <ul className="space-y-2">
                {article.whenToSeekHelp.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-red-600 mt-1">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 italic">
              <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
