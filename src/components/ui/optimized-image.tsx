'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading, error handling, and loading states
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  objectFit = 'cover',
  priority = false,
  fallback,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Show fallback if no src or error occurred
  if (!src || hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-100 dark:bg-slate-800',
          className
        )}
        aria-label={alt || 'Image placeholder'}
      >
        <ImageIcon className="h-12 w-12 text-slate-400 dark:text-slate-600" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        style={fill ? { objectFit } : undefined}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          !fill && className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}
