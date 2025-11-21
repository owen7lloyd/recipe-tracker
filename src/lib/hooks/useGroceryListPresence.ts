'use client';

import { useEffect, useState } from 'react';
import { subscribeToGroceryListPresence } from '@/lib/supabase/realtime';

export interface PresenceUser {
  id: string;
  name: string;
}

export function useGroceryListPresence(
  listId: string,
  userId: string | undefined,
  userName: string | undefined
) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!userId || !userName) {
      return;
    }

    const unsubscribe = subscribeToGroceryListPresence(
      listId,
      userId,
      userName,
      (users) => {
        setActiveUsers(users);
      }
    );

    return unsubscribe;
  }, [listId, userId, userName]);

  return activeUsers;
}
