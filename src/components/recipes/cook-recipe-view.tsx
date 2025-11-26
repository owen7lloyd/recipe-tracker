'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServingScaler } from './serving-scaler';
import { RecipeTimer } from './recipe-timer';
import { RecipeNoteInput, type RecipeNote } from './recipe-note';
import {
  ChefHat,
  Check,
  X,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  Timer,
  StickyNote,
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
import { convertBetweenUnits } from '@/lib/units/converter';
import type { ScaledRecipe, ScaledIngredient } from '@/lib/recipe-scaling';
import { detectAllTimers, type StepTimer } from '@/lib/recipe-timer';
import { type TimerState } from './recipe-timer';

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

  // Timer and notes state
  const [stepTimers, setStepTimers] = useState<StepTimer[]>([]);
  const [notes, setNotes] = useState<RecipeNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [expandedTimers, setExpandedTimers] = useState<Set<number>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  // Timer state management (persists across collapse/expand)
  const [timerStates, setTimerStates] = useState<Map<string, TimerState>>(
    new Map()
  );

  // Get or initialize timer state
  const getTimerState = (
    timerId: string,
    initialDuration: number
  ): TimerState => {
    if (!timerStates.has(timerId)) {
      const initialState: TimerState = {
        duration: initialDuration,
        remaining: initialDuration,
        isActive: false,
        isPaused: false,
        isComplete: false,
        soundEnabled: true,
        startTime: null,
        pausedTime: initialDuration,
      };
      setTimerStates((prev) => new Map(prev).set(timerId, initialState));
      return initialState;
    }
    return timerStates.get(timerId)!;
  };

  // Update timer state
  const updateTimerState = (timerId: string, newState: TimerState) => {
    setTimerStates((prev) => new Map(prev).set(timerId, newState));
  };

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

  // Detect timers in recipe instructions
  useEffect(() => {
    const detectedTimers = detectAllTimers(recipe.instructions);
    setStepTimers(detectedTimers);
  }, [recipe.instructions]);

  // Fetch notes for this recipe
  useEffect(() => {
    fetchNotes();
  }, [recipe.id]);

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

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await fetch(`/api/recipes/${recipe.id}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingNotes(false);
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

        // Convert quantity needed to pantry unit if units differ
        let quantityToDeduct = quantityNeeded;
        let unitsMatch =
          !ing.unit || !pantryItem?.unit || ing.unit === pantryItem.unit;
        let unitMismatch = false;
        let densityConverted = false;

        if (
          quantityNeeded !== null &&
          ing.unit &&
          pantryItem?.unit &&
          ing.unit !== pantryItem.unit
        ) {
          // Attempt to convert recipe unit to pantry unit
          const converted = convertBetweenUnits(
            quantityNeeded,
            ing.unit,
            pantryItem.unit,
            ing.ingredientName
          );

          if (converted !== null) {
            quantityToDeduct = converted;
            unitsMatch = true;
            // Mark that density conversion was used (units were different but conversion succeeded)
            densityConverted = true;
          } else {
            // Conversion failed - mark as unit mismatch
            unitMismatch = true;
            quantityToDeduct = quantityNeeded; // Use original for now
          }
        }

        const remainingQty =
          currentQty !== null && quantityToDeduct !== null && !unitMismatch
            ? Math.max(0, currentQty - quantityToDeduct)
            : null;
        const insufficient =
          currentQty !== null &&
          quantityToDeduct !== null &&
          !unitMismatch &&
          currentQty < quantityToDeduct;

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
          unitMismatch,
          densityConverted,
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

      // Redirect back to recipe detail
      router.push(`/dashboard/recipes/${recipe.id}`);
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
      setShowFinishDialog(false);
    }
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
        {/* Main cooking area - Instructions */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => {
                  const isCompleted = completedSteps.has(index);
                  const stepTimer = stepTimers.find(
                    (st) => st.stepNumber === index
                  );
                  const hasTimers = stepTimer && stepTimer.timers.length > 0;
                  const stepNotes = notes.filter(
                    (note) => note.stepNumber === index
                  );
                  const timerExpanded = expandedTimers.has(index);
                  const notesExpanded = expandedNotes.has(index);
                  const hasExpandedContent = timerExpanded || notesExpanded;

                  return (
                    <li
                      key={index}
                      className={`rounded-lg border-2 transition-all ${
                        hasExpandedContent
                          ? 'border-[#d4a574] bg-amber-50 dark:bg-amber-950/10'
                          : isCompleted
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Main step content - always visible */}
                      <div className="flex items-start gap-4 p-4">
                        {/* Step number */}
                        <div
                          onClick={() => toggleStep(index)}
                          className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full font-semibold transition-all ${
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

                        {/* Step instruction and controls */}
                        <div className="flex-1">
                          <p
                            onClick={() => toggleStep(index)}
                            className={`cursor-pointer text-sm leading-relaxed ${
                              isCompleted
                                ? 'text-slate-500 line-through dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {instruction}
                          </p>

                          {/* Control buttons below instruction */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {hasTimers && (
                              <Button
                                size="sm"
                                variant={timerExpanded ? 'default' : 'outline'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newExpanded = new Set(expandedTimers);
                                  if (timerExpanded) {
                                    newExpanded.delete(index);
                                  } else {
                                    newExpanded.add(index);
                                  }
                                  setExpandedTimers(newExpanded);
                                }}
                                className="text-xs"
                              >
                                <Timer className="mr-2 h-3 w-3" />
                                {timerExpanded ? 'Hide' : 'Show'} Timer
                                {stepTimer.timers.length > 1 ? 's' : ''}
                                {stepTimer.timers.length > 1 &&
                                  ` (${stepTimer.timers.length})`}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant={notesExpanded ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newExpanded = new Set(expandedNotes);
                                if (notesExpanded) {
                                  newExpanded.delete(index);
                                } else {
                                  newExpanded.add(index);
                                }
                                setExpandedNotes(newExpanded);
                              }}
                              className="text-xs"
                            >
                              <StickyNote className="mr-2 h-3 w-3" />
                              {notesExpanded ? 'Hide' : 'Add'} Notes{' '}
                              {stepNotes.length > 0 && `(${stepNotes.length})`}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded panels - side by side */}
                      {hasExpandedContent && (
                        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                          <div className="grid gap-4 lg:grid-cols-2">
                            {/* Timers panel */}
                            {timerExpanded && (
                              <div>
                                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  ⏱️ Timers
                                </h4>
                                {hasTimers ? (
                                  <div className="space-y-3">
                                    {stepTimer.timers.map(
                                      (timer, timerIndex) => {
                                        const timerId = `step-${index}-timer-${timerIndex}`;
                                        const timerState = getTimerState(
                                          timerId,
                                          timer.duration
                                        );
                                        return (
                                          <RecipeTimer
                                            key={timerId}
                                            timerId={timerId}
                                            duration={timer.duration}
                                            label={timer.label}
                                            stepNumber={index}
                                            isRange={timer.isRange}
                                            minDuration={timer.minDuration}
                                            maxDuration={timer.maxDuration}
                                            timerState={timerState}
                                            onStateChange={updateTimerState}
                                          />
                                        );
                                      }
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    No timers detected
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Notes panel */}
                            {notesExpanded && (
                              <div>
                                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  📝 Notes
                                </h4>
                                <RecipeNoteInput
                                  recipeId={recipe.id}
                                  stepNumber={index}
                                  existingNotes={notes}
                                  onNoteAdded={fetchNotes}
                                  onNoteUpdated={fetchNotes}
                                  onNoteDeleted={fetchNotes}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Unified Sidebar - Servings, Ingredients, and Pantry */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Cooking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Servings subsection */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Servings
                </h3>
                <ServingScaler
                  originalServings={recipe.servings}
                  currentServings={servings}
                  onScaleChange={setServings}
                  disabled={isScaling}
                />
              </div>

              {/* Ingredients subsection */}
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Ingredients
                </h3>
                {isLoadingPantry || isScaling ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="max-h-[300px] space-y-2 overflow-y-auto">
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
                          className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {ing.ingredientName || 'Unknown ingredient'}
                              </p>
                              <div className="text-slate-600 dark:text-slate-400">
                                {finalQty}
                                {ing.unit ? ` ${ing.unit}` : ''}
                              </div>
                              {ing.notes && (
                                <p className="mt-1 text-slate-500">
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
                                  className="h-6 w-6 p-0"
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
                                  className="h-6 w-6 p-0"
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pantry Impact subsection */}
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Pantry Impact
                </h3>
                {(hasInsufficient || hasNotInPantry) && (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-900 dark:bg-amber-950">
                    <div className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-500" />
                      <div className="text-xs text-amber-900 dark:text-amber-100">
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
                      <p className="truncate font-medium">
                        {ing.ingredientName}
                      </p>
                      {ing.notInPantry ? (
                        <p className="text-amber-600 dark:text-amber-500">
                          Not in pantry - will skip
                        </p>
                      ) : ing.notTracked ? (
                        <p className="text-slate-500">Quantity not tracked</p>
                      ) : ing.quantityNeeded === null ? (
                        <p className="text-slate-500">Non-numeric quantity</p>
                      ) : ing.unitMismatch ? (
                        <p className="text-amber-600 dark:text-amber-500">
                          Unit mismatch ({ing.unit} vs{' '}
                          {pantry.find(
                            (p) => p.ingredient.id === ing.ingredientId
                          )?.unit || '?'}
                          ) - will skip
                        </p>
                      ) : (
                        <div className="mt-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                              {ing.currentQty?.toFixed(2)} →{' '}
                              {ing.remainingQty?.toFixed(2)}{' '}
                              {pantry.find(
                                (p) => p.ingredient.id === ing.ingredientId
                              )?.unit || ing.unit}
                            </span>
                            {ing.willBeRemoved && (
                              <Badge variant="destructive" className="text-xs">
                                Remove
                              </Badge>
                            )}
                          </div>
                          {ing.densityConverted && (
                            <div className="flex items-center gap-1 rounded bg-blue-50 p-1.5 text-xs dark:bg-blue-950">
                              <span className="text-blue-700 dark:text-blue-300">
                                ℹ️ Unit conversion used (density-based)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
