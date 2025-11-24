'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreateCustomIngredientModal } from '@/components/ingredients/create-custom-ingredient-modal';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  commonUnits: string[] | null;
  isCustom?: boolean;
}

interface IngredientAutocompleteProps {
  onSelect: (ingredient: Ingredient) => void;
  label?: string;
  placeholder?: string;
  category?: string;
  allowCreate?: boolean;
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

export function IngredientAutocomplete({
  onSelect,
  label = 'Ingredient',
  placeholder = 'Search for ingredients...',
  category,
  allowCreate = true,
}: IngredientAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ingredient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search ingredients
  useEffect(() => {
    const searchIngredients = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (category) {
          params.append('category', category);
        }

        const response = await fetch(`/api/ingredients/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error searching ingredients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchIngredients, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, category]);

  const handleSelect = (ingredient: Ingredient) => {
    onSelect(ingredient);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = (ingredient: Ingredient) => {
    handleSelect(ingredient);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <Label htmlFor="ingredient-search">{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          id="ingredient-search"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <ul className="max-h-60 overflow-auto py-1">
            {results.map((ingredient) => (
              <li key={ingredient.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(ingredient)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ingredient.name}</span>
                      {ingredient.isCustom && (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                      {ingredient.category}
                    </span>
                  </div>
                  {ingredient.commonUnits &&
                    ingredient.commonUnits.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Common units: {ingredient.commonUnits.join(', ')}
                      </div>
                    )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading state */}
      {isLoading && query.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          Searching...
        </div>
      )}

      {/* No results with create option */}
      {isOpen &&
        !isLoading &&
        results.length === 0 &&
        query.length >= 2 &&
        allowCreate && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-4 text-center text-sm text-gray-500">
              No ingredients found for "{query}"
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={handleOpenCreateModal}
                variant="ghost"
                className="w-full justify-start rounded-none px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create custom ingredient: "{query}"
              </Button>
            </div>
          </div>
        )}

      {/* No results without create option */}
      {isOpen &&
        !isLoading &&
        results.length === 0 &&
        query.length >= 2 &&
        !allowCreate && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            No ingredients found
          </div>
        )}

      <CreateCustomIngredientModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
        defaultCategory={category}
      />
    </div>
  );
}
