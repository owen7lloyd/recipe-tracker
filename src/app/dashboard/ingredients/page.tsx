'use client';

import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { CreateCustomIngredientModal } from '@/components/ingredients/create-custom-ingredient-modal';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  commonUnits: string[] | null;
  householdId: string | null;
  createdBy: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  meat: 'Meat',
  seafood: 'Seafood',
  pantry: 'Pantry',
  frozen: 'Frozen',
  bakery: 'Bakery',
  other: 'Other',
};

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ingredients/custom');
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.filter((i: Ingredient) => i.householdId)); // Only show custom ingredients
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load ingredients',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ingredients',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditName(ingredient.name);
    setEditCategory(ingredient.category);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast({
        title: 'Error',
        description: 'Ingredient name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/ingredients/custom/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          category: editCategory,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setIngredients(
          ingredients.map((i) => (i.id === editingId ? updated : i))
        );
        setEditingId(null);
        toast({
          title: 'Success',
          description: 'Ingredient updated successfully',
        });
      } else if (response.status === 409) {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'This ingredient name already exists',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update ingredient',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ingredient',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/ingredients/custom/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIngredients(ingredients.filter((i) => i.id !== deleteId));
        setDeleteId(null);
        toast({
          title: 'Success',
          description: 'Ingredient deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete ingredient',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ingredient',
        variant: 'destructive',
      });
    }
  };

  const handleModalSuccess = () => {
    fetchIngredients();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">Loading ingredients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Custom Ingredients
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage custom ingredients for your household
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
              No custom ingredients yet. Create one to get started!
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Ingredient
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) =>
                  editingId === ingredient.id ? (
                    <tr
                      key={ingredient.id}
                      className="border-b border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-6 py-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isSaving}
                          className="w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          disabled={isSaving}
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                        >
                          {Object.entries(CATEGORY_LABELS).map(
                            ([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                      <td className="space-x-2 px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={ingredient.id}
                      className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-50">
                        {ingredient.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {CATEGORY_LABELS[ingredient.category]}
                        </span>
                      </td>
                      <td className="space-x-2 px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ingredient)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteId(ingredient.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        <CreateCustomIngredientModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={handleModalSuccess}
        />

        <AlertDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this ingredient? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
