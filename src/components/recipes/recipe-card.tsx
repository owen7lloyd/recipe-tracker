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
}: RecipeCardProps) {
  const totalTime =
    (prepTimeMinutes || 0) + (cookTimeMinutes || 0) || null;

  return (
    <Link
      href={`/dashboard/recipes/${id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      aria-label={`View recipe: ${title}`}
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700">
        {/* Recipe Image */}
        <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <OptimizedImage
            src={imageUrl}
            alt={`Photo of ${title}`}
            fill
            objectFit="cover"
            className="aspect-video transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <CardContent className="p-4">
          {/* Title and Rating */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-50 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              {title}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 text-yellow-500" aria-label={`Rating: ${rating} out of 5 stars`}>
                <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                <span className="text-sm font-medium" aria-hidden="true">{rating}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}

          {/* Category and Tags */}
          <div className="mb-3 flex flex-wrap gap-2" role="list" aria-label="Recipe categories and tags">
            <Badge variant="secondary" className="capitalize" role="listitem">
              {category}
            </Badge>
            {tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" role="listitem">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Time and Servings Info */}
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
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
