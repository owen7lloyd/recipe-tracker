'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GroceryListItem } from './grocery-list-item';

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
  checked: boolean | null;
  checkedBy: string | null;
  checkedAt: Date | null;
  recipeIds: string[] | null;
}

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  items: ListItem[];
  onItemUpdate: (
    itemId: string,
    updates: { quantity?: number; unit?: string; checked?: boolean }
  ) => void;
  onItemDelete: (itemId: string) => void;
  defaultCollapsed?: boolean;
}

export function CategorySection({
  categoryId: _categoryId,
  categoryName,
  categoryIcon,
  items,
  onItemUpdate,
  onItemDelete,
  defaultCollapsed = false,
}: CategorySectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;

  return (
    <Card>
      <CardHeader className="p-0">
        <Button
          variant="ghost"
          className="h-auto w-full justify-between rounded-none px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryIcon}</span>
            <span className="text-lg font-semibold">{categoryName}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              ({checkedCount}/{totalCount})
            </span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-slate-500" />
          )}
        </Button>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-2 pt-3">
          {items.map((item) => (
            <GroceryListItem
              key={item.id}
              item={item}
              onUpdate={(updates) => onItemUpdate(item.id, updates)}
              onDelete={() => onItemDelete(item.id)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}
