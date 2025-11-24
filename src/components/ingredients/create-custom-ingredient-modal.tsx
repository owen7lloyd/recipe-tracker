'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface CreateCustomIngredientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (ingredient: {
    id: string;
    name: string;
    category: string;
    commonUnits: string[] | null;
    isCustom: boolean;
  }) => void;
  defaultCategory?: string;
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
] as const;

type IngredientCategory = (typeof VALID_CATEGORIES)[number];

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  meat: 'Meat',
  seafood: 'Seafood',
  pantry: 'Pantry',
  frozen: 'Frozen',
  bakery: 'Bakery',
  other: 'Other',
};

export function CreateCustomIngredientModal({
  isOpen,
  onOpenChange,
  onSuccess,
  defaultCategory = 'other',
}: CreateCustomIngredientModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>(
    (defaultCategory as IngredientCategory) || 'other'
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setName('');
    setCategory((defaultCategory as IngredientCategory) || 'other');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an ingredient name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ingredients/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: VALID_CATEGORIES.includes(category) ? category : 'other',
        }),
      });

      if (response.ok) {
        const newIngredient = await response.json();
        toast({
          title: 'Success',
          description: `Created custom ingredient: ${newIngredient.name}`,
        });
        handleReset();
        onOpenChange(false);
        onSuccess?.({
          ...newIngredient,
          isCustom: true,
          commonUnits: newIngredient.commonUnits || [],
        });
      } else if (response.status === 409) {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'This ingredient already exists',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create custom ingredient',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating custom ingredient:', error);
      toast({
        title: 'Error',
        description: 'Failed to create custom ingredient',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Ingredient</DialogTitle>
          <DialogDescription>
            Add a new ingredient to your household's ingredient database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingredient-name">Ingredient Name</Label>
            <Input
              id="ingredient-name"
              placeholder="e.g., Truffle Oil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredient-category">Category</Label>
            <select
              id="ingredient-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as IngredientCategory)
              }
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
            >
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Ingredient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
