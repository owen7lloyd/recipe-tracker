'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';

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

interface GroceryListItemProps {
  item: ListItem;
  onUpdate: (updates: {
    quantity?: number;
    unit?: string;
    checked?: boolean;
  }) => void;
  onDelete: () => void;
}

export function GroceryListItem({
  item,
  onUpdate,
  onDelete,
}: GroceryListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(parseFloat(item.quantity));
  const [editUnit, setEditUnit] = useState(item.unit || '');

  const handleSave = () => {
    onUpdate({
      quantity: editQuantity,
      unit: editUnit,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditQuantity(parseFloat(item.quantity));
    setEditUnit(item.unit || '');
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
        checked={item.checked}
        onCheckedChange={handleCheckChange}
        className="mt-1"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              item.checked ? 'line-through text-slate-500' : ''
            }`}
          >
            {item.ingredient.name}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseFloat(e.target.value))}
              className="w-24"
              step="0.01"
            />
            <Input
              type="text"
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              className="w-32"
              placeholder="unit"
            />
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
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

      {!item.checked && (
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
