'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizedGroceryList } from './OrganizedGroceryList';
import { ShareListModal } from './ShareListModal';
import { AddManualItem } from './add-manual-item';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Trash2, Plus, CheckCircle2, Share2 } from 'lucide-react';

interface GroceryListWithRealtimeProps {
  listId: string;
  listName: string;
}

export function GroceryListWithRealtime({
  listId,
  listName,
}: GroceryListWithRealtimeProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChecked, setShowChecked] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleAddItem = async (data: {
    ingredientId: string;
    quantity: number;
    unit: string;
    store?: string;
  }) => {
    try {
      const res = await fetch(`/api/grocery-lists/${listId}/items`, {
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
      router.refresh();
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
      const res = await fetch(`/api/grocery-lists/${listId}`, {
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

  const handleCompleteShopping = async (deleteList: boolean = true) => {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/grocery-lists/${listId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteList }),
      });

      if (!res.ok) {
        throw new Error('Failed to complete shopping');
      }

      const data = await res.json();

      toast({
        title: 'Shopping completed!',
        description: `Added ${data.addedCount} new items and updated ${data.updatedCount} items in your pantry.`,
      });

      if (deleteList) {
        router.push('/dashboard/grocery-lists');
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error completing shopping:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete shopping trip',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="default"
            disabled={isCompleting}
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleCompleteShopping(true)}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Shopping
          </Button>
          <Button variant="outline" onClick={() => setShowChecked(!showChecked)}>
            {showChecked ? 'Hide' : 'Show'} Checked Items
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowShareModal(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
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

      {/* Add Item Form */}
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

      {/* Grocery List with Real-time */}
      <OrganizedGroceryList listId={listId} showChecked={showChecked} />

      {/* Share Modal */}
      <ShareListModal
        listId={listId}
        listName={listName}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
