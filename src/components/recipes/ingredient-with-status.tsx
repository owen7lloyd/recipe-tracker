'use client';

import { Check, AlertCircle, X } from 'lucide-react';
import type { IngredientWithPantryStatus } from '@/lib/pantry-status';

interface IngredientWithStatusProps {
  ingredient: IngredientWithPantryStatus;
}

export function IngredientWithStatus({
  ingredient,
}: IngredientWithStatusProps) {
  const statusConfig = {
    available: {
      icon: <Check className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      label: 'Available',
    },
    partial: {
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      label: ingredient.shortage
        ? `${ingredient.shortage.toFixed(2)} ${ingredient.unit || ''} short`.trim()
        : 'Partial',
    },
    missing: {
      icon: <X className="h-5 w-5 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      label: 'Not in pantry',
    },
  };

  const config = statusConfig[ingredient.status];

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex flex-1 items-center gap-3">
        {config.icon}
        <div className="flex-1">
          <p className="font-medium text-[#2c2415]">
            {ingredient.ingredientName}
            {ingredient.optional && (
              <span className="ml-2 text-sm italic text-[#6b6250]">
                (optional)
              </span>
            )}
          </p>
          <div className="flex gap-2 text-sm text-[#6b6250]">
            <span>
              {ingredient.quantity
                ? `${parseFloat(ingredient.quantity)} ${ingredient.unit || ''}`.trim()
                : 'as needed'}{' '}
              needed
            </span>
            {ingredient.available > 0 && (
              <span>
                | {ingredient.available.toFixed(2)} {ingredient.unit || ''}{' '}
                available
              </span>
            )}
          </div>
          {ingredient.notes && (
            <p className="text-sm italic text-[#6b6250]">{ingredient.notes}</p>
          )}
        </div>
      </div>
      <span
        className={`text-sm font-medium ${config.textColor} ml-2 whitespace-nowrap`}
      >
        {config.label}
      </span>
    </div>
  );
}

interface PantryStatusSummaryProps {
  availableCount: number;
  partialCount: number;
  missingCount: number;
  totalIngredients: number;
  canCook: boolean;
}

export function PantryStatusSummary({
  availableCount,
  partialCount,
  missingCount,
  totalIngredients,
  canCook,
}: PantryStatusSummaryProps) {
  if (totalIngredients === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf8f3] p-4">
      <h3 className="mb-3 font-semibold text-[#2c2415]">Pantry Status</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-[#6b6250]">
            <span className="font-semibold text-green-700">
              {availableCount}
            </span>{' '}
            available
          </span>
        </div>
        {partialCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-[#6b6250]">
              <span className="font-semibold text-yellow-700">
                {partialCount}
              </span>{' '}
              partial
            </span>
          </div>
        )}
        {missingCount > 0 && (
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-600" />
            <span className="text-sm text-[#6b6250]">
              <span className="font-semibold text-red-700">{missingCount}</span>{' '}
              missing
            </span>
          </div>
        )}
      </div>
      {canCook ? (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-2">
          <p className="text-sm font-medium text-green-700">
            ✓ You have all ingredients to cook this recipe!
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-2">
          <p className="text-sm text-yellow-700">
            You need {missingCount} missing and {partialCount} partial
            ingredients to cook this recipe.
          </p>
        </div>
      )}
    </div>
  );
}
