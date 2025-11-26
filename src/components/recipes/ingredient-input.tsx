'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Plus } from 'lucide-react';
import { SmartUnitSelector } from '@/components/ui/smart-unit-selector';
import { useToast } from '@/components/ui/use-toast';
import { CreateCustomIngredientModal } from '@/components/ingredients/create-custom-ingredient-modal';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  commonUnits: string[] | null;
  isCustom?: boolean;
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

const VALID_CATEGORIES = [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'pantry',
  'frozen',
  'bakery',
  'other',
];

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = (ingredient: Ingredient) => {
    handleSelectIngredient(ingredient);
  };

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
          {showSuggestions && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
              {suggestions.length > 0 && (
                <div className="py-1">
                  {suggestions.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      onClick={() => handleSelectIngredient(ingredient)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{ingredient.name}</div>
                        {ingredient.isCustom && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ingredient.category}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.length > 0 && suggestions.length === 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <Button
                    type="button"
                    onClick={handleOpenCreateModal}
                    variant="ghost"
                    className="w-full justify-start rounded-none px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create: "{searchQuery}"
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-4 md:col-span-2">
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

      <div className="col-span-8 md:col-span-3">
        <SmartUnitSelector
          value={value.unit || ''}
          onChange={(newUnit) => onChange({ ...value, unit: newUnit || null })}
          ingredientCategory={selectedIngredient?.category}
          disabled={disabled}
        />
      </div>

      <div className="col-span-10 md:col-span-2">
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

      <CreateCustomIngredientModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
