'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ServingScaler } from './serving-scaler';
import { Loader2, AlertTriangle, CheckCircle2, ChefHat } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { ScaledRecipe } from '@/lib/recipe-scaling';

interface Ingredient {
  id: string;
  ingredientId: string;
  ingredientName: string | null;
  ingredientCategory: string | null;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  optional: boolean | null;
  substitutionGroup?: string | null;
}

interface RecipeForCooking {
  id: string;
  title: string;
  servings: number;
  ingredients: Ingredient[];
}

interface PantryItem {
  id: string;
  quantity: string | null;
  unit: string | null;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
}

interface CookRecipeModalProps {
  recipe: RecipeForCooking;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CookRecipeModal({
  recipe,
  open,
  onClose,
  onSuccess,
}: CookRecipeModalProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [scaledRecipe, setScaledRecipe] = useState<ScaledRecipe | null>(null);
  const [isLoadingPantry, setIsLoadingPantry] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const { toast } = useToast();

  // Fetch pantry items when modal opens
  useEffect(() => {
    if (open) {
      fetchPantry();
      setServings(recipe.servings); // Reset servings when modal opens
    }
  }, [open, recipe.servings]);

  // Fetch scaled recipe when servings change
  useEffect(() => {
    if (open) {
      fetchScaledRecipe();
    }
  }, [servings, open, recipe.id]);

  const fetchPantry = async () => {
    try {
      setIsLoadingPantry(true);
      const response = await fetch('/api/pantry');
      if (!response.ok) throw new Error('Failed to fetch pantry');
      const data = await response.json();
      setPantry(data);
    } catch (error) {
      console.error('Error fetching pantry:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pantry items',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPantry(false);
    }
  };

  const fetchScaledRecipe = async () => {
    if (servings === recipe.servings) {
      // No scaling needed, use original recipe
      setScaledRecipe(null);
      return;
    }

    try {
      setIsScaling(true);
      const response = await fetch(
        `/api/recipes/${recipe.id}/scale?servings=${servings}`
      );
      if (!response.ok) throw new Error('Failed to scale recipe');
      const data = await response.json();
      setScaledRecipe(data);
    } catch (error) {
      console.error('Error scaling recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to scale recipe',
        variant: 'destructive',
      });
      // Reset to original servings on error
      setServings(recipe.servings);
      setScaledRecipe(null);
    } finally {
      setIsScaling(false);
    }
  };

  const handleCook = async () => {
    try {
      setIsCooking(true);

      const response = await fetch(`/api/recipes/${recipe.id}/cook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servings: servings !== recipe.servings ? servings : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cook recipe');
      }

      const result = await response.json();

      toast({
        title: 'Recipe Cooked!',
        description: `${recipe.title} has been cooked. Pantry updated with ${result.updates.length} ingredient${result.updates.length !== 1 ? 's' : ''}.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error cooking recipe:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to cook recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCooking(false);
    }
  };

  const getIngredientDeductions = () => {
    const activeRecipe = scaledRecipe || recipe;
    const scaleFactor = servings / recipe.servings;

    return activeRecipe.ingredients
      .filter((ing) => !ing.optional)
      .map((ing) => {
        // Get the quantity to deduct
        let quantityNeeded: number | null = null;
        let displayQty = ing.quantity;

        if (scaledRecipe && 'scaledQuantity' in ing) {
          quantityNeeded = ing.scaledQuantity;
          displayQty = ing.displayQuantity || ing.quantity;
        } else if (ing.quantity) {
          const parsed = parseFloat(ing.quantity);
          if (!isNaN(parsed)) {
            quantityNeeded = parsed * scaleFactor;
            displayQty = quantityNeeded.toFixed(2).replace(/\.?0+$/, '');
          }
        }

        // Find matching pantry item
        const pantryItem = pantry.find(
          (p) => p.ingredient.id === ing.ingredientId
        );

        const currentQty = pantryItem?.quantity
          ? parseFloat(pantryItem.quantity)
          : null;
        const remainingQty =
          currentQty !== null && quantityNeeded !== null
            ? Math.max(0, currentQty - quantityNeeded)
            : null;
        const insufficient =
          currentQty !== null &&
          quantityNeeded !== null &&
          currentQty < quantityNeeded;

        return {
          ...ing,
          displayQty,
          quantityNeeded,
          currentQty,
          remainingQty,
          insufficient,
          willBeRemoved: remainingQty === 0,
          notInPantry: !pantryItem,
          notTracked: pantryItem && !pantryItem.quantity,
        };
      });
  };

  const deductions = getIngredientDeductions();
  const hasInsufficient = deductions.some((d) => d.insufficient);
  const hasNotInPantry = deductions.some((d) => d.notInPantry);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Cook {recipe.title}
          </DialogTitle>
          <DialogDescription>
            This will deduct ingredients from your pantry based on the recipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Serving Scaler */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Adjust Servings
            </label>
            <ServingScaler
              originalServings={recipe.servings}
              currentServings={servings}
              onScaleChange={setServings}
              disabled={isLoadingPantry || isCooking}
            />
          </div>

          {/* Ingredient Deductions */}
          <div>
            <h4 className="text-sm font-medium mb-3">Pantry Deductions</h4>

            {isLoadingPantry || isScaling ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {deductions.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {ing.ingredientName || 'Unknown ingredient'}
                      </p>

                      {ing.notInPantry ? (
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                          Not in pantry - will be skipped
                        </p>
                      ) : ing.notTracked ? (
                        <p className="text-xs text-slate-500">
                          Quantity not tracked - will not be deducted
                        </p>
                      ) : ing.quantityNeeded === null ? (
                        <p className="text-xs text-slate-500">
                          Non-numeric quantity - will be skipped
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {ing.currentQty?.toFixed(2).replace(/\.?0+$/, '')}{' '}
                            {ing.unit} → {ing.remainingQty?.toFixed(2).replace(/\.?0+$/, '')}{' '}
                            {ing.unit}
                          </span>
                          {ing.willBeRemoved && (
                            <Badge variant="destructive" className="text-xs">
                              Will be removed
                            </Badge>
                          )}
                          {ing.insufficient && (
                            <Badge variant="outline" className="text-xs text-amber-600">
                              Insufficient
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {ing.displayQty} {ing.unit}
                      </p>
                      <p className="text-xs text-slate-500">needed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {(hasInsufficient || hasNotInPantry) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Warning
                  </h4>
                  <ul className="mt-2 text-sm text-amber-800 dark:text-amber-200 space-y-1">
                    {hasInsufficient && (
                      <li>
                        Some ingredients have insufficient quantities in your
                        pantry. They will still be deducted.
                      </li>
                    )}
                    {hasNotInPantry && (
                      <li>
                        Some ingredients are not in your pantry and will be
                        skipped.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCooking}
          >
            Cancel
          </Button>
          <Button onClick={handleCook} disabled={isCooking || isLoadingPantry}>
            {isCooking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cooking...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm & Cook
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
