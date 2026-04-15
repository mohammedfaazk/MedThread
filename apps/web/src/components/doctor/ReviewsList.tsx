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
    id: string;
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
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editFormData, setEditFormData] = useState({
    overallRating: 5,
    communicationRating: 5,
    knowledgeRating: 5,
    empathyRating: 5,
    reviewText: ''
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    // Get current user ID from token
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }
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

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setEditFormData({
      overallRating: review.overallRating,
      communicationRating: review.communicationRating || 5,
      knowledgeRating: review.knowledgeRating || 5,
      empathyRating: review.empathyRating || 5,
      reviewText: review.reviewText || ''
    });
  };

  const handleEditSubmit = async () => {
    if (!editingReview) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        alert('Review updated successfully!');
        setEditingReview(null);
        fetchReviews();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const handleDeleteClick = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Review deleted successfully!');
        fetchReviews();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.overallRating - a.overallRating;
      case 'lowest':
        return a.overallRating - b.overallRating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

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
      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Review</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEditFormData({ ...editFormData, overallRating: rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= editFormData.overallRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Communication</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEditFormData({ ...editFormData, communicationRating: rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= editFormData.communicationRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Knowledge</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEditFormData({ ...editFormData, knowledgeRating: rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= editFormData.knowledgeRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Empathy</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setEditFormData({ ...editFormData, empathyRating: rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          rating <= editFormData.empathyRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Review Text</label>
                <textarea
                  value={editFormData.reviewText}
                  onChange={(e) => setEditFormData({ ...editFormData, reviewText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingReview(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No reviews yet</p>
            <p className="text-sm text-gray-500">Be the first to review this doctor</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
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
                
                {/* Edit/Delete buttons for own reviews */}
                {currentUserId === review.patient.id && (
                  <>
                    <button
                      onClick={() => handleEditClick(review)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(review.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition font-semibold"
                    >
                      Delete
                    </button>
                  </>
                )}
                
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
