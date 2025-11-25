'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';

interface RatingPromptModalProps {
  recipeId: string;
  recipeName: string;
  imageUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRatingComplete?: () => void;
}

export function RatingPromptModal({
  recipeId,
  recipeName,
  imageUrl,
  open,
  onOpenChange,
  onRatingComplete,
}: RatingPromptModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to save rating');

      toast({
        title: 'Thanks for rating!',
        description: 'Your feedback helps us improve recipes.',
      });

      // Reset state
      setRating(0);
      setComment('');
      setHoveredRating(0);

      // Close modal
      onOpenChange(false);

      // Notify parent of completion
      if (onRatingComplete) {
        onRatingComplete();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Reset state
    setRating(0);
    setComment('');
    setHoveredRating(0);
    onOpenChange(false);
  };

  const ratingEmojis = ['😞', '😕', '😐', '🙂', '😍'];
  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#faf8f3] border-[#e8dcc8]">
        <DialogHeader>
          <DialogTitle className="font-merriweather text-2xl text-[#2c2415]">
            How was {recipeName}?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipe Image Preview */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={recipeName}
              className="w-full h-40 object-cover rounded-xl border border-[#e8dcc8]"
            />
          )}

          {/* Star Rating */}
          <div className="space-y-2">
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  type="button"
                  disabled={isSubmitting}
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#d4a574] text-[#d4a574]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating Display - fixed height to prevent jumping */}
            <div className="h-6 flex items-center justify-center">
              <p className="text-center text-sm text-[#6b6250]">
                {(rating > 0 || hoveredRating > 0) ? (
                  <>
                    {ratingEmojis[(hoveredRating || rating) - 1]}{' '}
                    {ratingLabels[(hoveredRating || rating) - 1]}
                  </>
                ) : (
                  <span className="text-gray-400">Select a rating</span>
                )}
              </p>
            </div>
          </div>

          {/* Comment Field */}
          <div>
            <label
              htmlFor="rating-comment"
              className="block text-sm font-medium mb-2 text-[#2c2415]"
            >
              What did you think? (optional)
            </label>
            <textarea
              id="rating-comment"
              placeholder="Share your thoughts about this recipe..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none rounded-xl border border-[#e8dcc8] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a574] focus:border-transparent transition-all"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="border-[#e8dcc8] text-[#2c2415] hover:bg-[#e8dcc8]/20 hover:border-[#d4a574] transition-all"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white hover:shadow-lg transition-all rounded-full"
          >
            {isSubmitting ? 'Saving...' : 'Submit Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
