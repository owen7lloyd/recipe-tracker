'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GroceryListItem } from './grocery-list-item';
import { AddManualItem } from './add-manual-item';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface ListItem {
  id: string;
  ingredientId: string;
  ingredient: Ingredient;
  quantity: string;
  unit: string | null;
  category: string;
  checked: boolean;
  checkedBy: string | null;
  checkedAt: Date | null;
  recipeIds: string[] | null;
}

interface GroceryList {
  id: string;
  name: string;
  items: ListItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface GroceryListViewProps {
  list: GroceryList;
  onUpdate?: () => void;
}

const categoryOrder = [
  'produce',
  'bakery',
  'dairy',
  'meat',
  'seafood',
  'frozen',
  'pantry',
  'other',
];

const categoryLabels: Record<string, string> = {
  produce: 'Produce',
  bakery: 'Bakery',
  dairy: 'Dairy & Eggs',
  meat: 'Meat',
  seafood: 'Seafood',
  frozen: 'Frozen Foods',
  pantry: 'Pantry/Dry Goods',
  other: 'Other',
};

export function GroceryListView({ list, onUpdate }: GroceryListViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showChecked, setShowChecked] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleItemUpdate = async (
    itemId: string,
    updates: { quantity?: number; unit?: string; checked?: boolean }
  ) => {
    try {
      const res = await fetch(
        `/api/grocery-lists/${list.id}/items/${itemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update item');
      }

      toast({
        title: 'Item updated',
        description: 'The item has been updated successfully.',
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleItemDelete = async (itemId: string) => {
    try {
      const res = await fetch(
        `/api/grocery-lists/${list.id}/items/${itemId}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      toast({
        title: 'Item removed',
        description: 'The item has been removed from the list.',
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const handleAddItem = async (data: {
    ingredientId: string;
    quantity: number;
    unit: string;
  }) => {
    try {
      const res = await fetch(`/api/grocery-lists/${list.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to add item');
      }

      toast({
        title: 'Item added',
        description: 'The item has been added to the list.',
      });

      setShowAddItem(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteList = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/grocery-lists/${list.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete list');
      }

      toast({
        title: 'List deleted',
        description: 'The grocery list has been deleted.',
      });

      router.push('/dashboard/grocery-lists');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete list',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Group items by category
  const itemsByCategory = list.items.reduce(
    (acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ListItem[]>
  );

  // Sort categories
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const checkedCount = list.items.filter((item) => item.checked).length;
  const totalCount = list.items.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {checkedCount} of {totalCount} items checked
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowChecked(!showChecked)}
          >
            {showChecked ? 'Hide' : 'Show'} Checked Items
          </Button>
          <Button onClick={() => setShowAddItem(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete List
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Grocery List</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this grocery list? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteList}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {showAddItem && (
        <Card>
          <CardHeader>
            <CardTitle>Add Manual Item</CardTitle>
          </CardHeader>
          <CardContent>
            <AddManualItem
              onAdd={handleAddItem}
              onCancel={() => setShowAddItem(false)}
            />
          </CardContent>
        </Card>
      )}

      {list.items.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-slate-600 dark:text-slate-400">
              No items in this list. Add some items to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const items = itemsByCategory[category];
            const visibleItems = showChecked
              ? items
              : items.filter((item) => !item.checked);

            if (visibleItems.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {categoryLabels[category] || category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {visibleItems.map((item) => (
                    <GroceryListItem
                      key={item.id}
                      item={item}
                      onUpdate={(updates) => handleItemUpdate(item.id, updates)}
                      onDelete={() => handleItemDelete(item.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
