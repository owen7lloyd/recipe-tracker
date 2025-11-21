import { supabase, isSupabaseConfigured } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface GroceryListUpdate {
  id: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
  table: string;
}

export interface BroadcastPayload {
  type: 'broadcast';
  event: string;
  payload: any;
}

/**
 * Subscribe to real-time updates for a grocery list
 * Listens to both item changes and list deletion
 */
export function subscribeToGroceryList(
  listId: string,
  onUpdate: (payload: GroceryListUpdate) => void,
  onListDeleted?: () => void
): () => void {
  if (!supabase || !isSupabaseConfigured) {
    console.warn(
      'Supabase not configured. Real-time sync disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable.'
    );
    return () => {}; // Return no-op function
  }

  const channel = supabase
    .channel(`grocery_list:${listId}`)
    // Listen to grocery_list_items changes
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'grocery_list_items',
        filter: `grocery_list_id=eq.${listId}`,
      },
      (payload) => {
        onUpdate({
          id: listId,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
          table: 'grocery_list_items',
        });
      }
    )
    // Listen to grocery_lists deletion
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'grocery_lists',
        filter: `id=eq.${listId}`,
      },
      (payload) => {
        if (onListDeleted) {
          onListDeleted();
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Subscribe to presence updates for a grocery list (who's viewing)
 */
export function subscribeToGroceryListPresence(
  listId: string,
  userId: string,
  userName: string,
  onPresenceUpdate: (users: Array<{ id: string; name: string }>) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) {
    console.warn('Supabase not configured. Presence tracking disabled.');
    return () => {}; // Return no-op function
  }

  const channel = supabase.channel(`grocery_list_presence:${listId}`);

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const users = Object.values(presenceState)
        .flat()
        .map((user: any) => ({
          id: user.id,
          name: user.name,
        }));
      onPresenceUpdate(users);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          id: userId,
          name: userName,
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Broadcast an update to all clients subscribed to a grocery list
 */
export async function broadcastListUpdate(
  listId: string,
  event: string,
  data: any
): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    console.warn('Supabase not configured. Broadcast disabled.');
    return;
  }

  const channel = supabase.channel(`grocery_list:${listId}`);

  await channel.send({
    type: 'broadcast',
    event,
    payload: data,
  });
}
