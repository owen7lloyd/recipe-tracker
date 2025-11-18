/**
 * Availability Badge Component
 *
 * Visual indicator showing if a recipe is cookable, cookable with substitutions,
 * or missing ingredients
 */

import { Check, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityBadgeProps {
  cookable: boolean;
  matchPercentage: number;
  substitutionsCount: number;
  missingCount: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function AvailabilityBadge({
  cookable,
  matchPercentage,
  substitutionsCount,
  missingCount,
  size = 'md',
  showText = true,
}: AvailabilityBadgeProps) {
  // Determine badge type
  let type: 'green' | 'yellow' | 'red';
  let icon: React.ReactNode;
  let text: string;

  if (cookable && substitutionsCount === 0) {
    type = 'green';
    icon = <Check className="h-4 w-4" />;
    text = 'Ready to cook';
  } else if (cookable && substitutionsCount > 0) {
    type = 'yellow';
    icon = <AlertCircle className="h-4 w-4" />;
    text = `${substitutionsCount} substitute${substitutionsCount > 1 ? 's' : ''}`;
  } else {
    type = 'red';
    icon = <XCircle className="h-4 w-4" />;
    text = `Missing ${missingCount} item${missingCount > 1 ? 's' : ''}`;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        colorClasses[type]
      )}
    >
      {icon}
      {showText && <span>{text}</span>}
      {!showText && <span className="sr-only">{text}</span>}
    </div>
  );
}

interface MatchPercentageBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchPercentageBadge({
  percentage,
  size = 'md',
}: MatchPercentageBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  let colorClass: string;
  if (percentage === 100) {
    colorClass =
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (percentage >= 75) {
    colorClass =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else if (percentage >= 50) {
    colorClass =
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  } else {
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        colorClass
      )}
    >
      {percentage}% match
    </div>
  );
}
