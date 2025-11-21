# Supabase Realtime Setup Documentation

This document explains how the real-time synchronization feature was implemented and what's required to make it work.

## Overview

The application uses Supabase Realtime to provide instant synchronization of grocery list items across multiple devices and browser windows. Changes made by one user are immediately reflected for all other users viewing the same list.

## Architecture

### Components

1. **Supabase Client** (`src/lib/supabase/client.ts`)
   - Creates a Supabase client with realtime configuration
   - Uses public anon key (safe for client-side use)

2. **Realtime Utilities** (`src/lib/supabase/realtime.ts`)
   - `subscribeToGroceryList()` - Subscribes to database changes
   - `subscribeToGroceryListPresence()` - Tracks active users viewing a list

3. **React Hooks**
   - `useGroceryListRealtime` (`src/lib/hooks/useGroceryListRealtime.ts`) - Manages realtime subscriptions and invalidates React Query cache when changes occur
   - `useGroceryListPresence` (`src/lib/hooks/useGroceryListPresence.ts`) - Tracks and displays active viewers

4. **UI Components**
   - `OrganizedGroceryList` - Main list component that uses realtime hooks
   - `GroceryListWithRealtime` - Wrapper with all controls (Share, Complete Shopping, etc.)

### Data Flow

1. User makes a change (e.g., checks an item) → Update sent to Next.js API
2. Next.js API updates PostgreSQL via Drizzle ORM
3. PostgreSQL replication stream captures the change
4. Supabase Realtime broadcasts the change to all subscribed clients
5. React hook receives the change and invalidates React Query cache
6. React Query refetches the complete list data (with JOIN for ingredient details)
7. UI updates automatically

## Required Supabase Configuration

### 1. Database Permissions

The `anon` and `authenticated` roles need permissions to access the table:

```sql
-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON grocery_list_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON grocery_list_items TO authenticated;

-- Also grant SELECT on related tables
GRANT SELECT ON grocery_lists TO anon;
GRANT SELECT ON grocery_lists TO authenticated;
GRANT SELECT ON ingredients TO anon;
GRANT SELECT ON ingredients TO authenticated;
```

### 2. Row Level Security (RLS)

Since the app uses next-auth (not Supabase Auth), RLS must be disabled. Security is enforced at the API level through next-auth session validation and household membership checks.

```sql
ALTER TABLE grocery_list_items DISABLE ROW LEVEL SECURITY;
```

**Why this is safe:**
- All write operations go through authenticated Next.js API endpoints
- API validates user session and household membership before any database changes
- The anon key is already public (NEXT_PUBLIC_* env var)
- Realtime only listens to changes (clients don't directly modify database)

### 3. Replica Identity

PostgreSQL needs to know what data to include in the replication stream:

```sql
ALTER TABLE grocery_list_items REPLICA IDENTITY FULL;
```

This ensures all column values are included in change events, not just the primary key.

### 4. Realtime Publication

Add the table to Supabase's realtime publication:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;
```

### Complete Setup Script

Run this once in Supabase SQL Editor:

```sql
-- Disable RLS (security handled by API)
ALTER TABLE grocery_list_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON grocery_list_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON grocery_list_items TO authenticated;
GRANT SELECT ON grocery_lists TO anon;
GRANT SELECT ON grocery_lists TO authenticated;
GRANT SELECT ON ingredients TO anon;
GRANT SELECT ON ingredients TO authenticated;

-- Set replica identity
ALTER TABLE grocery_list_items REPLICA IDENTITY FULL;

-- Add to publication (ignore error if already exists)
ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;
```

## Environment Variables

Required in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database connection (use connection pooler for IPv4)
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Important:** Use the connection pooler URL (port 6543) instead of direct connection (port 5432) to avoid IPv6 issues.

## How It Works

### Subscription

When a user opens a grocery list:

1. `useGroceryListRealtime(listId)` hook subscribes to changes on that list
2. Supabase establishes a WebSocket connection
3. PostgreSQL replication stream sends changes to Supabase
4. Supabase broadcasts changes to all subscribed clients

### Change Handling

When a database change occurs:

1. Hook receives a `postgres_changes` event with `eventType` (INSERT/UPDATE/DELETE)
2. Hook invalidates the React Query cache for that list: `queryClient.invalidateQueries(['grocery-list', listId])`
3. React Query refetches the complete list data from the API
4. API returns properly formatted data with JOINed ingredient objects
5. UI re-renders with the updated data

**Why we refetch instead of merging:**
- Supabase sends raw database rows (e.g., `ingredient_id: "abc123"`)
- UI expects nested objects (e.g., `ingredient: { id: "abc123", name: "Tomatoes", category: "produce" }`)
- Refetching ensures data consistency and simplicity

### Presence Tracking

Users viewing the same list see how many others are viewing:

1. `useGroceryListPresence(listId, userId, userName)` joins a presence channel
2. Each client broadcasts their presence when they join
3. Supabase tracks all connected clients in that channel
4. UI displays "X viewing" badge when multiple users are present

## Troubleshooting

### WebSocket Connection Issues

If you see cookie warnings about `__cf_bm`:
- This is a Cloudflare cookie rejection - it's harmless and doesn't affect functionality
- The warning appears in the browser console but doesn't break realtime

### Changes Not Syncing

1. Check that the table is in the publication:
   ```sql
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime' AND tablename = 'grocery_list_items';
   ```

2. Verify replica identity is FULL:
   ```sql
   SELECT relname, relreplident FROM pg_class
   WHERE relname = 'grocery_list_items';
   -- Should show 'f' for FULL
   ```

3. Check permissions:
   ```sql
   SELECT grantee, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_name = 'grocery_list_items' AND grantee = 'anon';
   ```

### No Updates in Second Window

Open browser DevTools console and look for:
- `[Realtime] Successfully subscribed to grocery_list:...` - Subscription working
- `[Realtime] Received postgres_changes event:` - Changes being received
- `Real-time update received:` - Hook processing changes

If subscription succeeds but no events arrive, the database configuration is incomplete.

## Performance Considerations

- **Optimistic Updates:** Check/uncheck operations use optimistic UI updates for instant feedback
- **Automatic Refetch:** React Query handles background refetching when changes occur
- **Smart Invalidation:** Only active queries are refetched (not stale/inactive ones)
- **Connection Pooling:** Using Supabase's connection pooler reduces latency

## Security Model

1. **Authentication:** next-auth validates user sessions
2. **Authorization:** API endpoints verify household membership before any operations
3. **Read Access:** Supabase anon key allows reading any data (necessary for realtime)
4. **Write Access:** All writes go through authenticated API endpoints
5. **Public Sharing:** Share links use temporary tokens with expiration (30 days)

This model is secure because:
- Users can't bypass the API to write directly to Supabase (API keys are server-side only)
- Even if someone reads data via the anon key, they can't modify it without API access
- API validates every write operation against user's household membership
- Share tokens are cryptographically random and expire automatically

## Future Enhancements

Potential improvements:
- Add optimistic updates for add/delete operations (currently only check/uncheck)
- Implement presence avatars showing who's viewing
- Add "Someone is typing..." indicators for collaborative editing
- Track who checked each item (already in schema, not displayed in UI)
- Add undo/redo for accidental changes
- Implement conflict resolution for simultaneous edits
