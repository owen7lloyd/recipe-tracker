'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface AddManualItemProps {
  onAdd: (data: {
    ingredientId: string;
    quantity: number;
    unit: string;
  }) => void;
  onCancel: () => void;
}

export function AddManualItem({ onAdd, onCancel }: AddManualItemProps) {
  const [search, setSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/ingredients/search?q=${encodeURIComponent(search)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Error searching ingredients:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.name);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredient || quantity <= 0) {
      return;
    }

    onAdd({
      ingredientId: selectedIngredient.id,
      quantity,
      unit,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ingredient">Ingredient</Label>
        <div className="relative">
          <Input
            id="ingredient"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIngredient(null);
            }}
            placeholder="Search for an ingredient..."
            required
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-slate-400" />
          )}
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
              {suggestions.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => handleSelectIngredient(ingredient)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {ingredient.category}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., cups, lbs"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedIngredient || quantity <= 0}>
          Add Item
        </Button>
      </div>
    </form>
  );
}
