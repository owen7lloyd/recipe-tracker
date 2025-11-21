'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { subscribeToGroceryList } from '@/lib/supabase/realtime';
import type { GroceryListUpdate } from '@/lib/supabase/realtime';

export function useGroceryListRealtime(listId: string, readOnly: boolean = false) {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToGroceryList(
      listId,
      (payload: GroceryListUpdate) => {
        // Invalidate the query to refetch complete data from server
        // This ensures we get the full item with nested ingredient object
        queryClient.invalidateQueries({
          queryKey: ['grocery-list', listId],
          refetchType: 'active', // Only refetch if the query is currently being used
        });
      },
      () => {
        // List was deleted - redirect to grocery lists page
        if (!readOnly) {
          router.push('/dashboard/grocery-lists');
        }
      }
    );

    return unsubscribe;
  }, [listId, queryClient, router, readOnly]);
}
