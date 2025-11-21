'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { COOKING_UNITS } from '@/lib/constants/units';

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

interface GroceryListItemProps {
  item: ListItem;
  onUpdate: (updates: {
    quantity?: number;
    unit?: string;
    store?: string;
    checked?: boolean;
  }) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function GroceryListItem({
  item,
  onUpdate,
  onDelete,
  readOnly = false,
}: GroceryListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(parseFloat(item.quantity));
  const [editUnit, setEditUnit] = useState(item.unit || '');
  const [editStore, setEditStore] = useState(item.store || '');

  const handleSave = () => {
    onUpdate({
      quantity: editQuantity,
      unit: editUnit,
      store: editStore,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditQuantity(parseFloat(item.quantity));
    setEditUnit(item.unit || '');
    setEditStore(item.store || '');
    setIsEditing(false);
  };

  const handleCheckChange = (checked: boolean) => {
    onUpdate({ checked });
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
        item.checked
          ? 'bg-slate-50 opacity-60 dark:bg-slate-900'
          : 'bg-white dark:bg-slate-950'
      }`}
    >
      <Checkbox
        checked={item.checked ?? false}
        onCheckedChange={handleCheckChange}
        className="mt-1"
        disabled={readOnly}
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              item.checked ? 'text-slate-500 line-through' : ''
            }`}
          >
            {item.ingredient.name}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(parseFloat(e.target.value))}
                className="w-24"
                step="0.01"
                placeholder="qty"
              />
              <Select
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                className="w-40"
              >
                <option value="">Select unit...</option>
                {COOKING_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </Select>
              <Input
                type="text"
                value={editStore}
                onChange={(e) => setEditStore(e.target.value)}
                className="w-40"
                placeholder="store (optional)"
              />
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>
              {parseFloat(item.quantity).toFixed(2)} {item.unit || ''}
            </span>
            {item.recipeIds && item.recipeIds.length > 0 && (
              <span className="text-xs text-slate-500">
                • Used in {item.recipeIds.length} recipe
                {item.recipeIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {!item.checked && !readOnly && (
        <div className="flex gap-1">
          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
}
