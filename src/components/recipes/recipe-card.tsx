'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface RecipeCardProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  category: string;
  tags?: string[] | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number;
  rating?: number | null;
  avgRating?: string | null;
  ratingCount?: number | null;
}

export function RecipeCard({
  id,
  title,
  description,
  imageUrl,
  category,
  tags,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  rating,
  avgRating,
  ratingCount,
}: RecipeCardProps) {
  const totalTime =
    (prepTimeMinutes || 0) + (cookTimeMinutes || 0) || null;

  return (
    <Link
      href={`/dashboard/recipes/${id}`}
      className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View recipe: ${title}`}
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#d4a574] hover:shadow-xl rounded-3xl">
        {/* Recipe Image */}
        <div className="aspect-video w-full overflow-hidden bg-[#f0ebe0]">
          <OptimizedImage
            src={imageUrl}
            alt={`Photo of ${title}`}
            fill
            objectFit="cover"
            className="aspect-video transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-6">
          {/* Title and Rating */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-merriweather text-lg font-bold text-[#2d5016] transition-colors group-hover:text-[#3d6b1f]">
              {title}
            </h3>
            {(avgRating || rating) && (
              <div className="flex items-center gap-1 shrink-0" aria-label={`Rating: ${avgRating || rating} out of 5 stars${ratingCount ? ` (${ratingCount} rating${ratingCount !== 1 ? 's' : ''})` : ''}`}>
                <Star className="h-4 w-4 fill-[#d4a574] text-[#d4a574]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[#2c2415]" aria-hidden="true">
                  {avgRating ? parseFloat(avgRating).toFixed(1) : rating}
                </span>
                {ratingCount !== null && ratingCount !== undefined && (
                  <span className="text-xs text-[#6b6250]" aria-hidden="true">
                    ({ratingCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-[#6b6250]">
              {description}
            </p>
          )}

          {/* Category and Tags */}
          <div className="mb-4 flex flex-wrap gap-2" role="list" aria-label="Recipe categories and tags">
            <Badge className="rounded-full bg-[#6b8e23] text-white capitalize" role="listitem">
              {category}
            </Badge>
            {tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="rounded-full border-[#d4a574] text-[#2d5016]" role="listitem">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Time and Servings Info */}
          <div className="flex gap-4 text-sm text-[#6b6250]">
            {totalTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>
                  <span className="sr-only">Cooking time: </span>
                  {totalTime} min
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>
                <span className="sr-only">Serves: </span>
                {servings} {servings === 1 ? 'serving' : 'servings'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
