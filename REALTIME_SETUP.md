# Real-time Sync Setup Guide

This document explains how to set up Supabase for real-time synchronization of grocery lists.

## Overview

The application uses Supabase Realtime to synchronize grocery list updates across multiple users in real-time. This allows household members to see changes to the grocery list immediately as they happen.

## Features Implemented

- ✅ Real-time sync for grocery list item updates
- ✅ Real-time sync for item check/uncheck
- ✅ Optimistic UI updates for better UX
- ✅ Presence detection (see who's viewing the list)
- ✅ Shareable public links with expiration
- ✅ Read-only public view

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note your project URL and anon key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Enable Realtime on Tables

In your Supabase dashboard:

1. Go to Database → Replication
2. Enable realtime for the `grocery_list_items` table:
   - Toggle "Enable Realtime" for the table
   - Or run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;
```

### 4. Configure Row Level Security (RLS)

For security, set up RLS policies on the `grocery_list_items` table:

```sql
-- Enable RLS
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see items from their household's lists
CREATE POLICY "Users can view household grocery list items"
  ON grocery_list_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists gl
      INNER JOIN users u ON u.household_id = gl.household_id
      WHERE gl.id = grocery_list_items.grocery_list_id
      AND u.id = auth.uid()
    )
  );

-- Policy: Users can update items from their household's lists
CREATE POLICY "Users can update household grocery list items"
  ON grocery_list_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists gl
      INNER JOIN users u ON u.household_id = gl.household_id
      WHERE gl.id = grocery_list_items.grocery_list_id
      AND u.id = auth.uid()
    )
  );
```

## How It Works

### Real-time Subscription

The application subscribes to changes on the `grocery_list_items` table:

```typescript
// Automatically subscribes when viewing a grocery list
useGroceryListRealtime(listId);
```

### Optimistic Updates

When checking/unchecking items, the UI updates immediately before the server confirms:

```typescript
// Item appears checked instantly
checkMutation.mutate({ itemId, checked: true });

// Server syncs in background
// If error occurs, UI rolls back automatically
```

### Presence

Shows who else is viewing the same list:

```typescript
const activeUsers = useGroceryListPresence(
  listId,
  userId,
  userName
);
// Returns array of users currently viewing
```

## Architecture

### Files Created

**Real-time Infrastructure:**
- `src/lib/supabase/client.ts` - Supabase client configuration
- `src/lib/supabase/realtime.ts` - Real-time subscription utilities
- `src/lib/hooks/useGroceryListRealtime.ts` - Hook for list updates
- `src/lib/hooks/useGroceryListPresence.ts` - Hook for presence

**API Routes:**
- `src/app/api/grocery-lists/[id]/share/route.ts` - Generate/revoke share links
- `src/app/api/grocery-lists/shared/[token]/route.ts` - Public list access

**Components:**
- `src/components/grocery-lists/OrganizedGroceryList.tsx` - List with real-time updates
- `src/components/grocery-lists/ShareListModal.tsx` - Share link modal
- `src/components/grocery-lists/SharedListView.tsx` - Public list view
- `src/components/providers/query-provider.tsx` - React Query provider

**Pages:**
- `src/app/shared/[token]/page.tsx` - Public shared list page

## Testing Real-time Sync

### Test Scenario 1: Two Users, Same List

1. User A and User B both open the same grocery list
2. User A checks an item
3. User B should see the item checked within 1 second
4. Both users should see each other in the "viewers" indicator

### Test Scenario 2: Shared Public Link

1. User A generates a share link
2. User B (not logged in) opens the link
3. User B can see all items (read-only)
4. User A checks items - User B sees updates in real-time
5. User B cannot check items or edit

### Test Scenario 3: Optimistic Updates

1. User A checks an item
2. Item appears checked immediately
3. Disconnect internet
4. Try to check another item
5. Item appears checked, then reverts when error occurs
6. Reconnect internet - changes sync

## Performance Considerations

### Connection Limits

- Supabase Free Tier: 200 concurrent connections
- Each user viewing a list = 1-2 connections
- Consider upgrading for production use

### Debouncing

For high-frequency updates (like typing), consider debouncing:

```typescript
// Wait 500ms before syncing to server
const debouncedUpdate = debounce(updateItem, 500);
```

### Cleanup

Subscriptions are automatically cleaned up when components unmount:

```typescript
useEffect(() => {
  const unsubscribe = subscribeToGroceryList(listId, onUpdate);
  return unsubscribe; // Cleanup on unmount
}, [listId]);
```

## Troubleshooting

### "Missing Supabase environment variables" Error

**Solution:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

### Real-time updates not working

**Check:**
1. Realtime is enabled on the table (Supabase Dashboard → Database → Replication)
2. Environment variables are set correctly
3. Browser console for WebSocket connection errors
4. RLS policies allow the user to read the table

### Share links not working

**Check:**
1. `shareToken` and `shareExpiresAt` columns exist in `grocery_lists` table
2. Token is not expired (`shareExpiresAt > NOW()`)
3. Token exists in database

### Presence not showing other users

**Check:**
1. Both users have valid session data
2. User IDs and names are being passed to the hook
3. Both users are on the same list ID
4. Check browser console for presence subscription errors

## Production Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables set in production (Vercel/hosting platform)
- [ ] Realtime enabled on necessary tables
- [ ] RLS policies configured for security
- [ ] Connection limits reviewed for expected user base
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Test real-time sync with multiple users
- [ ] Test share links work from incognito/different browser
- [ ] Monitor Supabase realtime usage in dashboard

## Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Query Docs](https://tanstack.com/query/latest)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

## Support

For issues with real-time sync, check:
1. Supabase Dashboard → Logs → Realtime
2. Browser Developer Console → Network → WS (WebSocket)
3. Application logs for subscription errors
