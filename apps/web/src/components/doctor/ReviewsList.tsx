'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Review {
  id: string;
  overallRating: number;
  communicationRating?: number;
  knowledgeRating?: number;
  empathyRating?: number;
  reviewText?: string;
  createdAt: string;
  helpfulCount: number;
  patient: {
    username: string;
    avatar?: string;
  };
}

interface ReviewsListProps {
  doctorId: string;
}

export function ReviewsList({ doctorId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [doctorId]);

  const fetchReviews = async () => {
    try {
      console.log('[ReviewsList] Fetching reviews for doctor:', doctorId);
      console.log('[ReviewsList] API URL:', `${API_URL}/api/v1/reviews/doctor/${doctorId}`);
      
      const response = await fetch(`${API_URL}/api/v1/reviews/doctor/${doctorId}`);
      const result = await response.json();
      
      console.log('[ReviewsList] Response:', result);
      
      if (result.success) {
        console.log('[ReviewsList] Reviews:', result.data.reviews);
        console.log('[ReviewsList] Stats:', result.data.stats);
        setReviews(result.data.reviews);
        setStats(result.data.stats);
      } else {
        console.error('[ReviewsList] API returned success=false:', result);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchReviews(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const reportReview = async (reviewId: string) => {
    const reason = prompt('Please provide a reason for reporting this review:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Review reported. Thank you for helping maintain quality.');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarDisplay rating={Math.round(stats.averageRating)} />
            <p className="text-sm text-gray-600 mt-2">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No reviews yet</p>
            <p className="text-sm text-gray-500">Be the first to review this doctor</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {review.patient.avatar ? (
                      <img
                        src={review.patient.avatar}
                        alt={review.patient.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.patient.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={review.overallRating} />
              </div>

              {/* Detailed Ratings */}
              {(review.communicationRating || review.knowledgeRating || review.empathyRating) && (
                <div className="flex gap-4 mb-4 text-sm">
                  {review.communicationRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Communication:</span>
                      <StarDisplay rating={review.communicationRating} />
                    </div>
                  )}
                  {review.knowledgeRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Knowledge:</span>
                      <StarDisplay rating={review.knowledgeRating} />
                    </div>
                  )}
                  {review.empathyRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Empathy:</span>
                      <StarDisplay rating={review.empathyRating} />
                    </div>
                  )}
                </div>
              )}

              {/* Review Text */}
              {review.reviewText && (
                <p className="text-gray-700 mb-4">{review.reviewText}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulCount})
                </button>
                <button
                  onClick={() => reportReview(review.id)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
