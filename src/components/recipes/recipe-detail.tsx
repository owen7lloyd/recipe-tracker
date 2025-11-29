'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Users,
  Star,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  ChefHat,
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
import { RecipeNoteInput, type RecipeNote } from './recipe-note';
import type { ScaledRecipe } from '@/lib/recipe-scaling';
import { formatDistanceToNow } from 'date-fns';

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

interface RecipeDetailProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  category: string;
  tags?: string[] | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number;
  rating?: number | null;
  instructions: string[];
  ingredients: Ingredient[];
  createdAt: string;
}

export function RecipeDetail(recipe: RecipeDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [scaledRecipe, setScaledRecipe] = useState<
    RecipeDetailProps | ScaledRecipe
  >(recipe);
  const [isScaling, setIsScaling] = useState(false);
  const [notes, setNotes] = useState<RecipeNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) || null;

  // Fetch scaled recipe when servings change
  useEffect(() => {
    const fetchScaledRecipe = async () => {
      if (currentServings === recipe.servings) {
        // Reset to original recipe
        setScaledRecipe(recipe);
        return;
      }

      setIsScaling(true);
      try {
        const response = await fetch(
          `/api/recipes/${recipe.id}/scale?servings=${currentServings}`
        );

        if (!response.ok) {
          throw new Error('Failed to scale recipe');
        }

        const data = await response.json();
        setScaledRecipe(data);
      } catch (error) {
        console.error('Error scaling recipe:', error);
        toast({
          title: 'Error',
          description: 'Failed to scale recipe. Please try again.',
          variant: 'destructive',
        });
        // Reset to original servings on error
        setCurrentServings(recipe.servings);
        setScaledRecipe(recipe);
      } finally {
        setIsScaling(false);
      }
    };

    fetchScaledRecipe();
  }, [currentServings, recipe]);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoadingNotes(true);
        const response = await fetch(`/api/recipes/${recipe.id}/notes`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        const data = await response.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [recipe.id]);

  const handleScaleChange = (newServings: number) => {
    setCurrentServings(newServings);
  };

  const refetchNotes = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipe.id}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      toast({
        title: 'Recipe deleted',
        description: `"${recipe.title}" has been deleted successfully.`,
      });

      router.push('/dashboard/recipes');
      router.refresh();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
            {scaledRecipe.title}
          </h1>
          {scaledRecipe.description && (
            <p className="text-slate-600 dark:text-slate-400">
              {scaledRecipe.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {scaledRecipe.category}
            </Badge>
            {scaledRecipe.tags?.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/recipes/${recipe.id}/cook`}>
              <ChefHat className="mr-2 h-4 w-4" />
              Cook This Recipe
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/recipes/${recipe.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Image */}
      {scaledRecipe.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={scaledRecipe.imageUrl}
            alt={scaledRecipe.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Quick Info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {totalTime && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Time
                </p>
                <p className="text-lg font-semibold">{totalTime} min</p>
              </div>
            </CardContent>
          </Card>
        )}
        {recipe.prepTimeMinutes && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Prep Time
                </p>
                <p className="text-lg font-semibold">
                  {recipe.prepTimeMinutes} min
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Servings
              </p>
              <p className="text-lg font-semibold">{currentServings}</p>
              {currentServings !== recipe.servings && (
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  (Original: {recipe.servings})
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {recipe.rating && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Star className="h-8 w-8 fill-current text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Rating
                </p>
                <p className="text-lg font-semibold">{recipe.rating}/5</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {recipe.sourceUrl && (
        <Card>
          <CardContent className="p-4">
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              <ExternalLink className="h-4 w-4" />
              View Original Recipe
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            {isScaling ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <ul className="space-y-3">
                {scaledRecipe.ingredients.map((ingredient) => {
                  // Use displayQuantity if available (for scaled recipes)
                  const displayQty =
                    'displayQuantity' in ingredient &&
                    ingredient.displayQuantity
                      ? ingredient.displayQuantity
                      : ingredient.quantity;

                  return (
                    <li
                      key={ingredient.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <div className="flex-1">
                        <span className="font-medium">
                          {displayQty && ingredient.unit
                            ? `${displayQty} ${ingredient.unit} `
                            : displayQty
                              ? `${displayQty} `
                              : ''}
                          {ingredient.ingredientName || 'Unknown ingredient'}
                        </span>
                        {ingredient.optional && (
                          <span className="ml-2 text-slate-500">
                            (optional)
                          </span>
                        )}
                        {ingredient.notes && (
                          <p className="text-slate-600 dark:text-slate-400">
                            {ingredient.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {scaledRecipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white dark:bg-slate-50 dark:text-slate-900">
                    {index + 1}
                  </div>
                  <p className="flex-1 pt-1 text-sm leading-relaxed">
                    {instruction}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Recipe Notes */}
      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Your Notes ({notes.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showNotes && (
            <CardContent>
              <div className="space-y-4">
                {isLoadingNotes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : notes.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">
                    No notes yet. Add notes while cooking to remember adjustments
                    and improvements.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20"
                    >
                      <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
                        {note.noteText}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>
                          {formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {note.stepNumber !== null && (
                          <Badge variant="secondary" className="text-xs">
                            Step {note.stepNumber + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{recipe.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
