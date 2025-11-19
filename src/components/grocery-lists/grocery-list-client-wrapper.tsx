'use client';

import { useRouter } from 'next/navigation';
import { GroceryListView } from './grocery-list-view';

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

interface GroceryListClientWrapperProps {
  initialList: GroceryList;
}

export function GroceryListClientWrapper({
  initialList,
}: GroceryListClientWrapperProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return <GroceryListView list={initialList} onUpdate={handleUpdate} />;
}
