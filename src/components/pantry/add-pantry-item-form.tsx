'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SmartUnitSelector } from '@/components/ui/smart-unit-selector';
import { IngredientAutocomplete } from './ingredient-autocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  commonUnits: string[] | null;
}

interface AddPantryItemFormProps {
  onItemAdded?: () => void;
}

export function AddPantryItemForm({ onItemAdded }: AddPantryItemFormProps) {
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    // Clear unit on new ingredient selection
    setUnit('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIngredient) {
      toast({
        title: 'Error',
        description: 'Please select an ingredient',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pantry/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: selectedIngredient.id,
          quantity: quantity ? parseFloat(quantity) : undefined,
          unit: unit || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add pantry item');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: result.message || 'Pantry item added successfully',
      });

      // Reset form
      setSelectedIngredient(null);
      setQuantity('');
      setUnit('');

      // Notify parent component
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add pantry item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add to Pantry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ingredient Autocomplete */}
          <IngredientAutocomplete
            onSelect={handleIngredientSelect}
            placeholder="Search for ingredients..."
          />

          {/* Selected Ingredient */}
          {selectedIngredient && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Selected: {selectedIngredient.name}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Category: {selectedIngredient.category}
              </p>
            </div>
          )}

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (optional)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 2.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit (optional)</Label>
              <SmartUnitSelector
                id="unit"
                value={unit}
                onChange={setUnit}
                ingredientCategory={selectedIngredient?.category}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!selectedIngredient || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Pantry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
