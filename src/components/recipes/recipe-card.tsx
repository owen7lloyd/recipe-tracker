'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, ImageIcon } from 'lucide-react';

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
    <Link href={`/dashboard/recipes/${id}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{rating}</span>
              </div>
            )}
          </div>

          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {category}
            </Badge>
            {tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            {totalTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{servings} servings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
