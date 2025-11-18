'use client';

import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { COOKING_UNITS } from '@/lib/constants/units';

interface PantryItem {
  id: string;
  quantity?: string | null;
  unit?: string | null;
  updatedAt: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
    commonUnits: string[] | null;
  };
}

interface PantryListProps {
  items: PantryItem[];
  onUpdate?: () => void;
}

export function PantryList({ items, onUpdate }: PantryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleEdit = (item: PantryItem) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity?.toString() || '');
    setEditUnit(item.unit || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditUnit('');
  };

  const handleSaveEdit = async (itemId: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/pantry/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: editQuantity ? parseFloat(editQuantity) : undefined,
          unit: editUnit || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pantry item');
      }

      toast({
        title: 'Success',
        description: 'Pantry item updated',
      });

      setEditingId(null);
      setEditQuantity('');
      setEditUnit('');

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item from your pantry?')) {
      return;
    }

    setIsDeleting(itemId);

    try {
      const response = await fetch(`/api/pantry/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete pantry item');
      }

      toast({
        title: 'Success',
        description: 'Pantry item removed',
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      produce: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      dairy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      meat: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      seafood: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      pantry: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      frozen: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      bakery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[category] || colors.other;
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Your pantry is empty. Add ingredients to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{item.ingredient.name}</h3>
              <Badge className={getCategoryColor(item.ingredient.category)}>
                {item.ingredient.category}
              </Badge>
            </div>

            {editingId === item.id ? (
              <div className="mt-2 flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Quantity"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-28"
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
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.quantity ? `${item.quantity} ${item.unit || ''}` : 'No quantity set'}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {editingId === item.id ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveEdit(item.id)}
                  disabled={isUpdating}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item.id)}
                  disabled={isDeleting === item.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
