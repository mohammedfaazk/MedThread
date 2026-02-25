'use client'

import { useState, useEffect } from 'react';
import { Calendar, User, Eye, Share2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  author_name: string | null;
  featured_image: string | null;
  view_count: number;
  share_count: number;
  published_at: string;
  created_at: string;
}

export default function SEOBlogPost({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seo/content/${slug}`);
      if (response.data.success) {
        setPost(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.subtitle || '',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Post not found</h2>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto p-6">
      {/* Featured Image */}
      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-96 object-cover rounded-2xl mb-8"
        />
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        {post.subtitle && (
          <p className="text-xl text-gray-600 mb-6">{post.subtitle}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {post.author_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>By {post.author_name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{post.view_count.toLocaleString()} views</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-blue-600 pl-4 italic my-4 text-gray-600" {...props} />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* CTA */}
      <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Find Your Perfect Doctor</h3>
        <p className="mb-6 opacity-90">Browse verified reviews and book consultations with top-rated healthcare professionals</p>
        <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition">
          Explore Doctors
        </button>
      </div>
    </article>
  );
}
