'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Zap } from 'lucide-react';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface IngredientPickerProps {
  selectedIngredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  showPantryQuick?: boolean;
  pantryIngredients?: Ingredient[];
  excludeMode?: boolean;
}

export function IngredientPicker({
  selectedIngredients,
  onIngredientsChange,
  showPantryQuick = false,
  pantryIngredients = [],
  excludeMode = false,
}: IngredientPickerProps) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

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

  // Search ingredients with debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/ingredients/search?q=${encodeURIComponent(search)}&limit=20`
        );
        if (response.ok) {
          const data = await response.json();
          // Filter out already selected ingredients
          const selectedIds = new Set(selectedIngredients.map((i) => i.id));
          setSuggestions(data.filter((ing: Ingredient) => !selectedIds.has(ing.id)));
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
  }, [search, selectedIngredients]);

  const addIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.find((i) => i.id === ingredient.id)) {
      onIngredientsChange([...selectedIngredients, ingredient]);
      setSearch('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (ingredientId: string) => {
    onIngredientsChange(
      selectedIngredients.filter((i) => i.id !== ingredientId)
    );
  };

  const clearAll = () => {
    onIngredientsChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div ref={containerRef}>
        <label className="block text-sm font-medium mb-2 text-[#2c2415]">
          {excludeMode ? 'Exclude Ingredients' : 'Search Ingredients'}
        </label>
        <div className="relative">
          <Input
            placeholder="Type ingredient name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (search.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            className="border-[#e8dcc8] rounded-xl focus:border-[#d4a574] focus:ring-[#d4a574]"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 w-full border border-[#e8dcc8] rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => addIngredient(ingredient)}
                  className="w-full text-left px-4 py-3 hover:bg-[#faf8f3] border-b border-[#e8dcc8] last:border-0 transition-colors"
                >
                  <div className="font-medium text-[#2c2415]">
                    {ingredient.name}
                  </div>
                  <div className="text-xs text-[#6b6250] capitalize">
                    {ingredient.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pantry Quick Select */}
      {showPantryQuick && pantryIngredients.length > 0 && !excludeMode && (
        <div>
          <button
            type="button"
            className="text-sm font-medium text-[#2d5016] flex items-center gap-1.5 mb-2 hover:text-[#3d6b1f] transition-colors"
          >
            <Zap size={16} />
            Quick: My Pantry ({pantryIngredients.length})
          </button>
          <div className="flex flex-wrap gap-2">
            {pantryIngredients.slice(0, 12).map((ingredient) => (
              <Badge
                key={ingredient.id}
                variant="outline"
                className="cursor-pointer hover:bg-[#2d5016] hover:text-white hover:border-[#2d5016] transition-colors px-3 py-1 rounded-full border-[#e8dcc8]"
                onClick={() => addIngredient(ingredient)}
              >
                {ingredient.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#2c2415]">
              {excludeMode ? 'Excluded' : 'Selected'} ({selectedIngredients.length})
            </label>
            <button
              onClick={clearAll}
              className="text-sm text-[#6b6250] hover:text-[#2c2415] transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <Badge
                key={ingredient.id}
                className={`${
                  excludeMode
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-[#2d5016] text-white'
                } pl-3 pr-2 py-1.5 rounded-full flex items-center gap-2`}
              >
                <span>{ingredient.name}</span>
                <button
                  onClick={() => removeIngredient(ingredient.id)}
                  className={`${
                    excludeMode
                      ? 'hover:bg-red-200'
                      : 'hover:bg-[#1f3a0f]'
                  } rounded-full p-0.5 transition-colors`}
                  aria-label={`Remove ${ingredient.name}`}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
