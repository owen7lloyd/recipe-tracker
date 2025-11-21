'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToGroceryList } from '@/lib/supabase/realtime';
import type { GroceryListUpdate } from '@/lib/supabase/realtime';

export function useGroceryListRealtime(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToGroceryList(listId, (payload: GroceryListUpdate) => {
      console.log('Real-time update received:', payload.eventType, payload);

      // Invalidate the query to refetch complete data from server
      // This ensures we get the full item with nested ingredient object
      queryClient.invalidateQueries({
        queryKey: ['grocery-list', listId],
        refetchType: 'active' // Only refetch if the query is currently being used
      });
    });

    return unsubscribe;
  }, [listId, queryClient]);
}
