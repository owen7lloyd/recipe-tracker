export const GROCERY_CATEGORIES = [
  { id: 'produce', name: 'Produce', icon: '🥬' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'seafood', name: 'Seafood', icon: '🐟' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
  { id: 'pantry', name: 'Pantry/Dry Goods', icon: '🥫' },
  { id: 'other', name: 'Other', icon: '🛒' },
] as const;

export const DEFAULT_CATEGORY_ORDER = GROCERY_CATEGORIES.map((c) => c.id);

export type GroceryCategoryId = (typeof GROCERY_CATEGORIES)[number]['id'];

export function getCategoryLabel(categoryId: string): string {
  const category = GROCERY_CATEGORIES.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

export function getCategoryIcon(categoryId: string): string {
  const category = GROCERY_CATEGORIES.find((c) => c.id === categoryId);
  return category?.icon || '🛒';
}
