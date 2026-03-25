'use client';

import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReviewFormProps {
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewForm({ doctorId, doctorName, appointmentId, onClose, onSuccess }: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [knowledgeRating, setKnowledgeRating] = useState(0);
  const [empathyRating, setEmpathyRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId,
          appointmentId,
          overallRating,
          communicationRating: communicationRating || undefined,
          knowledgeRating: knowledgeRating || undefined,
          empathyRating: empathyRating || undefined,
          reviewText: reviewText.trim() || undefined
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Review submitted successfully!');
        onSuccess();
        onClose();
      } else {
        alert('Failed to submit review: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1 items-center flex-wrap">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110 flex-shrink-0"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/5` : ''}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-600">Share your experience with Dr. {doctorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              label="Overall Rating *"
            />
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <StarRating
                value={communicationRating}
                onChange={setCommunicationRating}
                label="Communication"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <StarRating
                value={knowledgeRating}
                onChange={setKnowledgeRating}
                label="Knowledge"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <StarRating
                value={empathyRating}
                onChange={setEmpathyRating}
                label="Empathy"
              />
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share details about your experience..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">Review Guidelines:</p>
            <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
              <li>Be honest and constructive</li>
              <li>Focus on your personal experience</li>
              <li>Avoid sharing personal medical details</li>
              <li>Be respectful and professional</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || overallRating === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
