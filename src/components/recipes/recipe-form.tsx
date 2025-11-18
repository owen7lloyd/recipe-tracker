'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ImageUpload } from './image-upload';
import { IngredientInput, type RecipeIngredient } from './ingredient-input';
import {
  createRecipeSchema,
  type CreateRecipeInput,
} from '@/lib/validations/recipe';
import { Loader2, Plus, X, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RecipeFormProps {
  initialData?: any;
  recipeId?: string;
  onSuccess?: (recipeId: string) => void;
}

export function RecipeForm({ initialData, recipeId, onSuccess }: RecipeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(initialData?.rating || 0);

  const isEditing = !!recipeId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      imageUrl: null,
      sourceUrl: null,
      category: 'dinner' as const,
      tags: [],
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      servings: 4,
      rating: null,
      ingredients: [],
      instructions: [''],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: 'instructions',
  });

  const imageUrl = watch('imageUrl');
  const tags = watch('tags');

  const onSubmit = async (data: any) => {
    try {
      setError(null);

      // Validate that all ingredients have valid IDs
      const invalidIngredients = data.ingredients.filter(
        (ing: any) => !ing.ingredientId || ing.ingredientId === ''
      );

      if (invalidIngredients.length > 0) {
        setError(
          'Some ingredients are not properly selected. Please choose an ingredient from the dropdown for each item. If an ingredient is not found, you may need to add it to your pantry first.'
        );
        // Scroll to the first error
        const ingredientsSection = document.querySelector(
          '[class*="Ingredients"]'
        );
        ingredientsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const url = isEditing ? `/api/recipes/${recipeId}` : '/api/recipes';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save recipe');
      }

      const result = await response.json();

      toast({
        title: isEditing ? 'Recipe updated' : 'Recipe created',
        description: `"${data.title}" has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });

      if (onSuccess) {
        onSuccess(result.id);
      } else {
        router.push(`/dashboard/recipes/${result.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setValue('tags', [...tags, tag]);
    }
  };

  const handleRemoveTag = (index: number) => {
    setValue(
      'tags',
      tags.filter((_: any, i: number) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Essential details about your recipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              {...register('title')}
              disabled={isSubmitting}
              placeholder="e.g., Classic Spaghetti Carbonara"
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              disabled={isSubmitting}
              placeholder="A brief description of your recipe..."
              rows={3}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.description.message as string}
              </p>
            )}
          </div>

          <ImageUpload
            value={imageUrl}
            onChange={(url) => setValue('imageUrl', url)}
            disabled={isSubmitting}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...register('category')}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
                <option value="beverage">Beverage</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.category.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Servings *</Label>
              <Input
                id="servings"
                type="number"
                {...register('servings', { valueAsNumber: true })}
                disabled={isSubmitting}
                min="1"
              />
              {errors.servings && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.servings.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prepTimeMinutes">Prep Time (minutes)</Label>
              <Input
                id="prepTimeMinutes"
                type="number"
                {...register('prepTimeMinutes', { valueAsNumber: true })}
                disabled={isSubmitting}
                min="0"
              />
              {errors.prepTimeMinutes && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.prepTimeMinutes.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookTimeMinutes">Cook Time (minutes)</Label>
              <Input
                id="cookTimeMinutes"
                type="number"
                {...register('cookTimeMinutes', { valueAsNumber: true })}
                disabled={isSubmitting}
                min="0"
              />
              {errors.cookTimeMinutes && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.cookTimeMinutes.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    setValue('rating', star);
                  }}
                  disabled={isSubmitting}
                  className="transition-colors hover:text-yellow-500"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRating(0);
                    setValue('rating', null);
                  }}
                  disabled={isSubmitting}
                  className="ml-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              type="url"
              {...register('sourceUrl')}
              disabled={isSubmitting}
              placeholder="https://example.com/recipe"
            />
            {errors.sourceUrl && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.sourceUrl.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    disabled={isSubmitting}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-slate-500">
              Press Enter to add a tag
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients *</CardTitle>
          <CardDescription>
            Add all ingredients needed for this recipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredientFields.map((field, index) => (
            <IngredientInput
              key={field.id}
              value={watch(`ingredients.${index}`)}
              onChange={(value) => setValue(`ingredients.${index}`, value)}
              onRemove={() => removeIngredient(index)}
              disabled={isSubmitting}
            />
          ))}
          {errors.ingredients && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.ingredients.message as string}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendIngredient({
                ingredientId: '',
                ingredientName: '',
                quantity: null,
                unit: null,
                notes: null,
                optional: false,
              } as any)
            }
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions *</CardTitle>
          <CardDescription>
            Step-by-step instructions for preparing this recipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold dark:bg-slate-800">
                {index + 1}
              </div>
              <textarea
                {...register(`instructions.${index}`)}
                disabled={isSubmitting}
                placeholder="Describe this step..."
                rows={2}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
              />
              {instructionFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.instructions && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.instructions.message as string}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendInstruction('')}
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Recipe'
          ) : (
            'Create Recipe'
          )}
        </Button>
      </div>
    </form>
  );
}
