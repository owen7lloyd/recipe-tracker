'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServingScaler } from './serving-scaler';
import { RatingPromptModal } from './rating-prompt-modal';
import {
  ChefHat,
  Check,
  X,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ScaledRecipe, ScaledIngredient } from '@/lib/recipe-scaling';

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

type IngredientOrScaled = Ingredient | ScaledIngredient;

interface CookRecipeViewProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  servings: number;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  instructions: string[];
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

interface IngredientAdjustment {
  ingredientId: string;
  quantity: number;
}

export function CookRecipeView(recipe: CookRecipeViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Recipe state
  const [servings, setServings] = useState(recipe.servings);
  const [scaledRecipe, setScaledRecipe] = useState<ScaledRecipe | null>(null);
  const [isScaling, setIsScaling] = useState(false);

  // Cooking progress state
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [ingredientAdjustments, setIngredientAdjustments] = useState<
    Map<string, number>
  >(new Map());

  // Pantry state
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [isLoadingPantry, setIsLoadingPantry] = useState(true);

  // Modal state
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);

  // Fetch pantry items
  useEffect(() => {
    fetchPantry();
  }, []);

  // Fetch scaled recipe when servings change
  useEffect(() => {
    if (servings !== recipe.servings) {
      fetchScaledRecipe();
    } else {
      setScaledRecipe(null);
    }
  }, [servings, recipe.servings, recipe.id]);

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
      setServings(recipe.servings);
      setScaledRecipe(null);
    } finally {
      setIsScaling(false);
    }
  };

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const adjustIngredientQuantity = (ingredientId: string, quantity: number) => {
    const newAdjustments = new Map(ingredientAdjustments);
    if (quantity <= 0) {
      newAdjustments.delete(ingredientId);
    } else {
      newAdjustments.set(ingredientId, quantity);
    }
    setIngredientAdjustments(newAdjustments);
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
          const scaledIng = ing as ScaledIngredient;
          quantityNeeded = scaledIng.scaledQuantity;
          displayQty = scaledIng.displayQuantity || ing.quantity;
        } else if (ing.quantity) {
          const parsed = parseFloat(ing.quantity);
          if (!isNaN(parsed)) {
            quantityNeeded = parsed * scaleFactor;
            displayQty = quantityNeeded.toFixed(2).replace(/\.?0+$/, '');
          }
        }

        // Check for manual adjustment
        const adjustment = ingredientAdjustments.get(ing.ingredientId);
        if (adjustment !== undefined) {
          quantityNeeded = adjustment;
          displayQty = adjustment.toFixed(2).replace(/\.?0+$/, '');
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

  const handleFinishCooking = async () => {
    try {
      setIsCooking(true);

      const adjustments: IngredientAdjustment[] = Array.from(
        ingredientAdjustments.entries()
      ).map(([ingredientId, quantity]) => ({
        ingredientId,
        quantity,
      }));

      const response = await fetch(`/api/recipes/${recipe.id}/cook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servings: servings !== recipe.servings ? servings : undefined,
          adjustments: adjustments.length > 0 ? adjustments : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cook recipe');
      }

      const result = await response.json();

      toast({
        title: 'Recipe Completed!',
        description: `${recipe.title} has been cooked. Pantry updated with ${result.updates.length} ingredient${result.updates.length !== 1 ? 's' : ''}.`,
      });

      // Close the finish dialog
      setShowFinishDialog(false);

      // Show rating prompt if returned by API
      if (result.showRatingPrompt) {
        setShowRatingPrompt(true);
      } else {
        // Redirect back to recipe detail
        router.push(`/dashboard/recipes/${recipe.id}`);
      }
    } catch (error) {
      console.error('Error cooking recipe:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to complete recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCooking(false);
    }
  };

  const handleRatingComplete = () => {
    setShowRatingPrompt(false);
    router.push(`/dashboard/recipes/${recipe.id}`);
  };

  const progress = (completedSteps.size / recipe.instructions.length) * 100;
  const deductions = getIngredientDeductions();
  const hasInsufficient = deductions.some((d) => d.insufficient);
  const hasNotInPantry = deductions.some((d) => d.notInPantry);
  const activeRecipe = scaledRecipe || recipe;
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/recipes/${recipe.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipe
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-slate-700 dark:text-slate-300" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                Cooking: {recipe.title}
              </h1>
            </div>
            {recipe.description && (
              <p className="mb-3 text-slate-600 dark:text-slate-400">
                {recipe.description}
              </p>
            )}
            {totalTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Total time: {totalTime} minutes</span>
              </div>
            )}
          </div>

          <Button
            onClick={() => setShowFinishDialog(true)}
            size="lg"
            disabled={isCooking}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Finish Cooking
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {completedSteps.size} of {recipe.instructions.length} steps
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main cooking area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Serving scaler */}
          <Card>
            <CardHeader>
              <CardTitle>Servings</CardTitle>
            </CardHeader>
            <CardContent>
              <ServingScaler
                originalServings={recipe.servings}
                currentServings={servings}
                onScaleChange={setServings}
                disabled={isScaling}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => {
                  const isCompleted = completedSteps.has(index);
                  return (
                    <li
                      key={index}
                      className={`flex cursor-pointer gap-4 rounded-lg border-2 p-4 transition-all ${
                        isCompleted
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                      onClick={() => toggleStep(index)}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold transition-all ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p
                        className={`flex-1 pt-2 text-sm leading-relaxed ${
                          isCompleted
                            ? 'text-slate-500 line-through dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {instruction}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Ingredients */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPantry || isScaling ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {activeRecipe.ingredients.map((ing) => {
                    const displayQty =
                      'displayQuantity' in ing &&
                      (ing as ScaledIngredient).displayQuantity
                        ? (ing as ScaledIngredient).displayQuantity
                        : ing.quantity;

                    const adjustment = ingredientAdjustments.get(
                      ing.ingredientId
                    );
                    const finalQty: string =
                      adjustment !== undefined
                        ? adjustment.toFixed(2).replace(/\.?0+$/, '')
                        : String(displayQty || '');

                    return (
                      <div
                        key={ing.id}
                        className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {ing.ingredientName || 'Unknown ingredient'}
                          </p>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {finalQty}
                            {ing.unit ? ` ${ing.unit}` : ''}
                            {adjustment !== undefined && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Adjusted
                              </Badge>
                            )}
                          </div>
                          {ing.notes && (
                            <p className="mt-1 text-xs text-slate-500">
                              {ing.notes}
                            </p>
                          )}
                        </div>

                        {/* Quantity adjustment controls */}
                        {displayQty && !ing.optional && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                const current =
                                  adjustment !== undefined
                                    ? adjustment
                                    : parseFloat(displayQty || '0');
                                adjustIngredientQuantity(
                                  ing.ingredientId,
                                  Math.max(0, current - 0.5)
                                );
                              }}
                            >
                              -
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                const current =
                                  adjustment !== undefined
                                    ? adjustment
                                    : parseFloat(displayQty || '0');
                                adjustIngredientQuantity(
                                  ing.ingredientId,
                                  current + 0.5
                                );
                              }}
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pantry impact preview */}
          <Card>
            <CardHeader>
              <CardTitle>Pantry Impact</CardTitle>
            </CardHeader>
            <CardContent>
              {(hasInsufficient || hasNotInPantry) && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                    <div className="text-sm text-amber-900 dark:text-amber-100">
                      {hasInsufficient && (
                        <p>Some items have insufficient quantities.</p>
                      )}
                      {hasNotInPantry && (
                        <p>Some items not in pantry will be skipped.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {deductions.map((ing) => (
                  <div
                    key={ing.id}
                    className="rounded border border-slate-200 p-2 text-xs dark:border-slate-800"
                  >
                    <p className="truncate font-medium">{ing.ingredientName}</p>
                    {ing.notInPantry ? (
                      <p className="text-amber-600 dark:text-amber-500">
                        Not in pantry - will skip
                      </p>
                    ) : ing.notTracked ? (
                      <p className="text-slate-500">Quantity not tracked</p>
                    ) : ing.quantityNeeded === null ? (
                      <p className="text-slate-500">Non-numeric quantity</p>
                    ) : (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {ing.currentQty?.toFixed(2)} →{' '}
                          {ing.remainingQty?.toFixed(2)} {ing.unit}
                        </span>
                        {ing.willBeRemoved && (
                          <Badge variant="destructive" className="text-xs">
                            Remove
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Finish cooking dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Cooking</DialogTitle>
            <DialogDescription>
              Are you ready to finish cooking? This will update your pantry
              based on the ingredients used.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              {completedSteps.size < recipe.instructions.length && (
                <span className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  You haven't completed all steps yet.
                </span>
              )}
              This will deduct{' '}
              {
                deductions.filter(
                  (d) =>
                    d.quantityNeeded !== null && !d.notInPantry && !d.notTracked
                ).length
              }{' '}
              ingredients from your pantry.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
              disabled={isCooking}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleFinishCooking}
              disabled={isCooking}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm & Finish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating prompt modal */}
      <RatingPromptModal
        recipeId={recipe.id}
        recipeName={recipe.title}
        imageUrl={recipe.imageUrl}
        open={showRatingPrompt}
        onOpenChange={setShowRatingPrompt}
        onRatingComplete={handleRatingComplete}
      />
    </div>
  );
}
