import React, { useState, useEffect } from 'react';
import { Star, X, MessageSquare, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import reviewService from '../../services/review.service';
import toast from 'react-hot-toast';

export const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen || !order) return null;

  const restaurantId = typeof order.restaurant === 'object' ? order.restaurant?._id : order.restaurant;
  const restaurantName = typeof order.restaurant === 'object' ? order.restaurant?.name : 'Restaurant';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        order: order._id,
        restaurant: restaurantId,
        rating,
        comment: comment.trim(),
      };

      const res = await reviewService.createReview(payload);
      toast.success(res.message || 'Thank you! Your review has been submitted.');
      if (onReviewSubmitted) onReviewSubmitted(res.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit review. You may have already reviewed this order.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent!';
      default:
        return 'Select rating';
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 z-10 shadow-2xl border border-slate-100 animate-fadeIn font-sans"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => !loading && onClose()}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-500">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">How was your order?</h2>
          <p className="text-xs text-slate-500 mt-1">
            Rate your experience with <span className="font-semibold text-slate-700">{restaurantName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Interactive Selector */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transform hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {getRatingLabel(activeRating)}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex justify-between">
              <span>Write a Review (Optional)</span>
              <span className="text-slate-400">{comment.length}/1000</span>
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked about the food, packaging, or delivery speed..."
              className="w-full text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={loading} type="submit">
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
