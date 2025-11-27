# Post-Cook Rating Prompt

**Phase:** 5 - Enhancements
**Priority:** P2
**Estimate:** 2 days

## Description

After a user marks a recipe as "cooked," prompt them to rate their experience with the recipe. This engagement feature helps build a rating database and provides valuable feedback on recipe quality. Ratings can inform future recipe recommendations and sorting.

## Tasks

### Backend Enhancement

- [ ] Extend `POST /api/recipes/[id]/cook` to return rating prompt flag
- [ ] Store rating timestamp with recipe history
- [ ] Create `POST /api/recipes/[id]/rate` endpoint
- [ ] Update recipe rating (average of all user ratings)
- [ ] Track individual user ratings

### Frontend Components

- [ ] Create `RatingPromptModal` component
- [ ] Add to recipe cook completion flow
- [ ] 5-star rating input with hover effects
- [ ] Optional comment field
- [ ] "Skip" and "Submit" buttons
- [ ] Success message after submission
- [ ] Modal dismissal handling

### Rating Display

- [ ] Show average rating on recipe cards
- [ ] Display rating count (e.g., "4.5 ⭐ (12 ratings)")
- [ ] Show user's own rating if they've rated
- [ ] Add rating distribution on recipe detail (optional)
- [ ] Sort recipes by rating (optional)

### User Experience

- [ ] Prompt appears after cook is confirmed
- [ ] Allow users to skip rating
- [ ] Users can re-rate recipes
- [ ] Show success message
- [ ] Toast notification for rating saved
- [ ] Smooth modal animations

## Acceptance Criteria

- [ ] Rating prompt appears after recipe marked as cooked
- [ ] Users can rate 1-5 stars
- [ ] Users can optionally add comments
- [ ] Ratings are persisted to database
- [ ] Average rating displayed on recipe cards
- [ ] Users can update their rating anytime
- [ ] Modal can be dismissed without rating
- [ ] Mobile responsive

## Technical Details

### Database Schema Update

```typescript
// Extend recipeHistory table or create new recipeRatings table
interface RecipeRating {
  id: uuid (PK)
  recipeId: uuid (FK -> recipes.id, CASCADE)
  userId: uuid (FK -> users.id, CASCADE)
  householdId: uuid (FK -> households.id)
  rating: integer (1-5)
  comment?: text
  ratedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}

// Add to recipes table:
interface Recipe {
  // ... existing fields
  avgRating?: decimal(2, 1)  // Average of all ratings
  ratingCount?: integer       // Number of ratings
}
```

### API Endpoint - Cook Recipe

```typescript
// POST /api/recipes/[id]/cook
// Response now includes rating prompt

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ... existing cook logic ...

  return NextResponse.json({
    success: true,
    message: 'Recipe marked as cooked',
    showRatingPrompt: true,
    recipe: {
      id: recipe.id,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
    },
  });
}
```

### API Endpoint - Rate Recipe

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recipeRatings, recipes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = ratingSchema.parse(body);

    // Check if user has already rated
    const [existingRating] = await db
      .select()
      .from(recipeRatings)
      .where(
        and(
          eq(recipeRatings.recipeId, params.id),
          eq(recipeRatings.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingRating) {
      // Update existing rating
      await db
        .update(recipeRatings)
        .set({
          rating,
          comment: comment || null,
          updatedAt: new Date(),
        })
        .where(eq(recipeRatings.id, existingRating.id));
    } else {
      // Create new rating
      await db.insert(recipeRatings).values({
        recipeId: params.id,
        userId: session.user.id,
        householdId: session.user.householdId,
        rating,
        comment: comment || null,
        ratedAt: new Date(),
      });
    }

    // Calculate average rating
    const ratings = await db
      .select({
        avgRating: sql`AVG(rating)`,
        count: sql`COUNT(*)`,
      })
      .from(recipeRatings)
      .where(eq(recipeRatings.recipeId, params.id));

    const avgRating = parseFloat(ratings[0]?.avgRating ?? 0);
    const ratingCount = parseInt(ratings[0]?.count ?? 0);

    // Update recipe rating
    await db
      .update(recipes)
      .set({
        avgRating,
        ratingCount,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, params.id));

    return NextResponse.json({
      success: true,
      message: 'Rating saved',
      avgRating,
      ratingCount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}
```

### Modal Component

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';

interface RatingPromptProps {
  recipeId: string;
  recipeName: string;
  imageUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RatingPromptModal({
  recipeId,
  recipeName,
  imageUrl,
  open,
  onOpenChange,
}: RatingPromptProps) {
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

      onOpenChange(false);
      setRating(0);
      setComment('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-merriweather text-2xl">
            How was {recipeName}?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipe Image Preview */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={recipeName}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}

          {/* Star Rating */}
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#d4a574] text-[#d4a574]'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Display */}
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600">
              {['😞', '😕', '😐', '🙂', '😍'][rating - 1]} {rating} out of 5 stars
            </p>
          )}

          {/* Comment Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              What did you think? (optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about this recipe..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 bg-gradient-to-r from-[#2d5016] to-[#3d6b1f]"
          >
            {isSubmitting ? 'Saving...' : 'Submit Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Cook Recipe Page Integration

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RatingPromptModal } from '@/components/recipes/rating-prompt-modal';
import { Button } from '@/components/ui/button';

export function CookRecipePage({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);

  const handleCookComplete = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipe.id}/cook`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark recipe as cooked');

      const data = await response.json();

      // Show rating prompt if returned
      if (data.showRatingPrompt) {
        setShowRatingPrompt(true);
      } else {
        router.push('/dashboard/recipes');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRatingComplete = () => {
    setShowRatingPrompt(false);
    router.push('/dashboard/recipes');
  };

  return (
    <div>
      {/* Cook recipe UI */}
      <Button onClick={handleCookComplete}>
        Mark as Cooked
      </Button>

      <RatingPromptModal
        open={showRatingPrompt}
        onOpenChange={handleRatingComplete}
        recipeId={recipe.id}
        recipeName={recipe.title}
        imageUrl={recipe.imageUrl}
      />
    </div>
  );
}
```

### Recipe Card with Rating

```typescript
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="border rounded-2xl overflow-hidden border-[#e8dcc8]">
      {/* Recipe image and content */}

      {/* Rating Display */}
      {recipe.avgRating && (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-yellow-500">⭐</span>
          <span className="font-medium">{recipe.avgRating.toFixed(1)}</span>
          <span className="text-gray-600">({recipe.ratingCount})</span>
        </div>
      )}
    </div>
  );
}
```

## User Workflows

### Workflow 1: First Cook & Rate

1. User completes cook mode
2. Clicks "Mark as Cooked"
3. Modal appears asking to rate
4. User rates 5 stars and adds comment
5. Rating saved, user redirected to recipes

### Workflow 2: Skip Rating

1. User completes cook mode
2. Modal appears
3. Clicks "Skip"
4. Modal closes, user redirected

### Workflow 3: Update Rating

1. User opens recipe detail
2. Sees their previous rating
3. Can click to update rating
4. Modal opens with current rating selected
5. User updates and confirms

## Dependencies

- Phase 1-2 features fully implemented
- Recipe cook feature complete (`.github-issues/11-cook-recipe-feature.md`)
- Dialog component available

## Testing

- [ ] Modal appears after recipe marked as cooked
- [ ] All 5 star ratings can be selected
- [ ] Comments save correctly
- [ ] Average rating calculates correctly
- [ ] Users can update their rating
- [ ] Skip button dismisses modal
- [ ] Modal closes after successful submission
- [ ] Toast shows success message
- [ ] Rating displays on recipe cards
- [ ] Mobile modal is responsive

## References

- Cook Recipe Feature: `.github-issues/11-cook-recipe-feature.md`
- Recipe Detail: `.github-issues/05-recipe-crud.md`
