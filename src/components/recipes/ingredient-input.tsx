'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { COOKING_UNITS } from '@/lib/constants/units';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  commonUnits: string[] | null;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName?: string;
  quantity?: number | null;
  unit?: string | null;
  notes?: string | null;
  optional?: boolean;
}

interface IngredientInputProps {
  value: RecipeIngredient;
  onChange: (value: RecipeIngredient) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function IngredientInput({
  value,
  onChange,
  onRemove,
  disabled,
}: IngredientInputProps) {
  const [searchQuery, setSearchQuery] = useState(value.ingredientName || '');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search ingredients
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/ingredients/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Error searching ingredients:', error);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchQuery(ingredient.name);
    setShowSuggestions(false);
    onChange({
      ...value,
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      unit: value.unit || (ingredient.commonUnits?.[0] ?? null),
    });
  };

  // Use ingredient's common units if available, otherwise use all cooking units
  const unitOptions =
    (selectedIngredient?.commonUnits ?? []).length > 0
      ? (selectedIngredient?.commonUnits ?? []).map((unit) => ({
          value: unit,
          label: COOKING_UNITS.find((u) => u.value === unit)?.label || unit,
        }))
      : COOKING_UNITS;

  // Check if ingredient is valid (has an ID)
  const isValid = value.ingredientId && value.ingredientId !== '';

  return (
    <div
      className={`grid grid-cols-12 gap-2 rounded-lg border p-3 ${
        isValid
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
          : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      }`}
    >
      <div
        className="col-span-12 flex items-center gap-2 md:col-span-4"
        ref={containerRef}
      >
        <GripVertical className="h-5 w-5 text-slate-400" />
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search ingredient..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            disabled={disabled}
            className={`w-full ${!isValid ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
              {suggestions.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => handleSelectIngredient(ingredient)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-xs text-slate-500">
                    {ingredient.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-6 md:col-span-2">
        <Input
          type="number"
          placeholder="Qty"
          value={value.quantity || ''}
          onChange={(e) =>
            onChange({
              ...value,
              quantity: e.target.value ? parseFloat(e.target.value) : null,
            })
          }
          disabled={disabled}
          step="0.01"
        />
      </div>

      <div className="col-span-6 md:col-span-2">
        <select
          value={value.unit || ''}
          onChange={(e) => onChange({ ...value, unit: e.target.value || null })}
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
        >
          <option value="">Unit</option>
          {unitOptions.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-10 md:col-span-3">
        <Input
          type="text"
          placeholder="Notes (optional)"
          value={value.notes || ''}
          onChange={(e) =>
            onChange({ ...value, notes: e.target.value || null })
          }
          disabled={disabled}
        />
      </div>

      <div className="col-span-2 flex items-center justify-end md:col-span-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
