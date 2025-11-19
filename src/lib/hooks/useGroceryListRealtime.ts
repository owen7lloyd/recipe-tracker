'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToGroceryList } from '@/lib/supabase/realtime';
import type { GroceryListUpdate } from '@/lib/supabase/realtime';

export function useGroceryListRealtime(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToGroceryList(listId, (payload: GroceryListUpdate) => {
      // Update the local cache based on the event
      queryClient.setQueryData(['grocery-list', listId], (old: any) => {
        if (!old) return old;

        switch (payload.eventType) {
          case 'INSERT':
            return {
              ...old,
              items: [...(old.items || []), payload.new],
            };

          case 'UPDATE':
            return {
              ...old,
              items: (old.items || []).map((item: any) =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              ),
            };

          case 'DELETE':
            return {
              ...old,
              items: (old.items || []).filter((item: any) => item.id !== payload.old.id),
            };

          default:
            return old;
        }
      });

      // Invalidate the query to refetch from server (optional, for data consistency)
      queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
    });

    return unsubscribe;
  }, [listId, queryClient]);
}
