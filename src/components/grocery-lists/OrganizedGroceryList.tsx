'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGroceryListRealtime } from '@/lib/hooks/useGroceryListRealtime';
import { useGroceryListPresence } from '@/lib/hooks/useGroceryListPresence';
import { useSession } from 'next-auth/react';
import { CategorySection } from './category-section';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  getCategoryLabel,
  getCategoryIcon,
  DEFAULT_CATEGORY_ORDER,
} from '@/lib/constants/grocery-categories';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  store: string | null;
  checked: boolean | null;
  checkedBy: string | null;
  checkedAt: Date | null;
  recipeIds: string[] | null;
}

interface GroceryList {
  id: string;
  name: string;
  items: ListItem[];
}

interface OrganizedGroceryListProps {
  listId: string;
  readOnly?: boolean;
  showChecked?: boolean;
}

export function OrganizedGroceryList({
  listId,
  readOnly = false,
  showChecked = true,
}: OrganizedGroceryListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryOrder, setCategoryOrder] = useState<string[]>(
    DEFAULT_CATEGORY_ORDER
  );

  // Fetch the grocery list
  const { data: list, isLoading } = useQuery<GroceryList>({
    queryKey: ['grocery-list', listId],
    queryFn: async () => {
      const res = await fetch(`/api/grocery-lists/${listId}`);
      if (!res.ok) throw new Error('Failed to fetch list');
      return res.json();
    },
    enabled: !!listId,
  });

  // Subscribe to real-time updates
  useGroceryListRealtime(listId);

  // Subscribe to presence (who's viewing)
  const activeUsers = useGroceryListPresence(
    listId,
    session?.user?.id,
    session?.user?.name
  );

  // Fetch category order
  useEffect(() => {
    async function fetchCategoryOrder() {
      try {
        const res = await fetch('/api/household/category-order');
        if (res.ok) {
          const data = await res.json();
          setCategoryOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching category order:', error);
      }
    }
    fetchCategoryOrder();
  }, []);

  // Optimistic update mutation for checking items
  const checkMutation = useMutation({
    mutationFn: async ({
      itemId,
      checked,
    }: {
      itemId: string;
      checked: boolean;
    }) => {
      const res = await fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked }),
      });

      if (!res.ok) throw new Error('Failed to update item');
      return res.json();
    },
    onMutate: async ({ itemId, checked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['grocery-list', listId] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['grocery-list', listId]);

      // Optimistically update
      queryClient.setQueryData(['grocery-list', listId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: ListItem) =>
            item.id === itemId
              ? { ...item, checked, checkedAt: new Date() }
              : item
          ),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['grocery-list', listId], context.previous);
      }
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive',
      });
    },
  });

  const handleItemUpdate = async (
    itemId: string,
    updates: { quantity?: number; unit?: string; checked?: boolean }
  ) => {
    if (readOnly) return;

    if (updates.checked !== undefined) {
      checkMutation.mutate({ itemId, checked: updates.checked });
    } else {
      // Handle other updates without optimistic UI
      try {
        const res = await fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) throw new Error('Failed to update item');

        queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update item',
          variant: 'destructive',
        });
      }
    }
  };

  const handleItemDelete = async (itemId: string) => {
    if (readOnly) return;

    try {
      const res = await fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete item');

      queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });

      toast({
        title: 'Item removed',
        description: 'The item has been removed from the list.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 animate-pulse rounded bg-gray-200"></div>
        <div className="h-64 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-slate-600">List not found</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by store first, then by category within each store
  const itemsByStore = list.items.reduce(
    (acc, item) => {
      const store = item.store || 'Unassigned';
      if (!acc[store]) {
        acc[store] = {};
      }

      const category = item.category || 'other';
      if (!acc[store][category]) {
        acc[store][category] = [];
      }
      acc[store][category].push(item);
      return acc;
    },
    {} as Record<string, Record<string, ListItem[]>>
  );

  // Sort stores alphabetically, with "Unassigned" last
  const sortedStores = Object.keys(itemsByStore).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  // Helper to sort categories
  const sortCategories = (categories: string[]) => {
    return categories.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

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
        {!readOnly && activeUsers.length > 1 && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <Users className="h-4 w-4" />
            <span>
              {activeUsers.length} viewing
            </span>
          </div>
        )}
      </div>

      {list.items.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-slate-600 dark:text-slate-400">
              No items in this list.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedStores.map((store) => {
            const storeCategories = itemsByStore[store];
            const sortedCategories = sortCategories(
              Object.keys(storeCategories)
            );

            // Count items for this store
            const storeItemCount = sortedCategories.reduce(
              (count, category) => count + storeCategories[category].length,
              0
            );

            return (
              <div key={store} className="space-y-3">
                {/* Store Header */}
                <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-2 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {store === 'Unassigned' ? '📋 Unassigned' : `🏪 ${store}`}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {storeItemCount} {storeItemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Categories within this store */}
                <div className="space-y-3">
                  {sortedCategories.map((category) => {
                    const items = storeCategories[category];
                    const visibleItems = showChecked
                      ? items
                      : items.filter((item) => !item.checked);

                    if (visibleItems.length === 0) return null;

                    return (
                      <CategorySection
                        key={`${store}-${category}`}
                        categoryId={category}
                        categoryName={getCategoryLabel(category)}
                        categoryIcon={getCategoryIcon(category)}
                        items={visibleItems}
                        onItemUpdate={handleItemUpdate}
                        onItemDelete={handleItemDelete}
                        readOnly={readOnly}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
