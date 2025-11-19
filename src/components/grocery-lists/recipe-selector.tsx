'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Users, Loader2 } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  category: string;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number;
}

interface RecipeSelectorProps {
  recipes: Recipe[];
}

export function RecipeSelector({ recipes }: RecipeSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [servings, setServings] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleRecipe = (recipeId: string, defaultServings: number) => {
    const newSelected = new Set(selectedRecipes);

    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
      const newServings = { ...servings };
      delete newServings[recipeId];
      setServings(newServings);
    } else {
      newSelected.add(recipeId);
      setServings({ ...servings, [recipeId]: defaultServings });
    }

    setSelectedRecipes(newSelected);
  };

  const generateList = async () => {
    if (selectedRecipes.size === 0) {
      toast({
        title: 'No recipes selected',
        description: 'Please select at least one recipe.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/grocery-lists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeIds: Array.from(selectedRecipes),
          servings,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate list');
      }

      const list = await res.json();

      toast({
        title: 'Grocery list created!',
        description: `Created list with ${list.items?.length || 0} items`,
      });

      router.push(`/dashboard/grocery-lists/${list.id}`);
    } catch (error) {
      console.error('Error generating list:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to generate list',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAll = () => {
    const allRecipeIds = new Set(recipes.map((r) => r.id));
    const allServings: Record<string, number> = {};
    recipes.forEach((r) => {
      allServings[r.id] = r.servings;
    });
    setSelectedRecipes(allRecipeIds);
    setServings(allServings);
  };

  const clearAll = () => {
    setSelectedRecipes(new Set());
    setServings({});
  };

  const totalTime = (recipe: Recipe) => {
    return (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Select Recipes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose recipes to generate a shopping list
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {selectedRecipes.size} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={selectedRecipes.size === 0}
            >
              Clear
            </Button>
            <Button
              onClick={generateList}
              disabled={selectedRecipes.size === 0 || isGenerating}
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Shopping List
            </Button>
          </div>
        </div>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-slate-600 dark:text-slate-400">
              No recipes found. Add some recipes first!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className={`cursor-pointer transition-all ${
                selectedRecipes.has(recipe.id)
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
              onClick={() => toggleRecipe(recipe.id, recipe.servings)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedRecipes.has(recipe.id)}
                    onCheckedChange={() =>
                      toggleRecipe(recipe.id, recipe.servings)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{recipe.title}</h3>
                      {recipe.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      {totalTime(recipe) && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{totalTime(recipe)} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>

                    {selectedRecipes.has(recipe.id) && (
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Label htmlFor={`servings-${recipe.id}`} className="text-sm">
                          Servings:
                        </Label>
                        <Input
                          id={`servings-${recipe.id}`}
                          type="number"
                          min="1"
                          value={servings[recipe.id] || recipe.servings}
                          onChange={(e) =>
                            setServings({
                              ...servings,
                              [recipe.id]: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
