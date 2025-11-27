# Real-time Sync and List Sharing

**Phase:** 3 - Grocery Lists
**Priority:** P0
**Estimate:** 6 days

## Description

Implement real-time synchronization for grocery lists between household members and shareable links for external users.

## Tasks

### Real-time Infrastructure
- [ ] Choose real-time provider (Supabase Realtime or Pusher)
- [ ] Set up WebSocket connections
- [ ] Configure channels per grocery list
- [ ] Handle connection management
- [ ] Implement reconnection logic

### Real-time Features
- [ ] Sync item check/uncheck in real-time
- [ ] Sync item additions/removals
- [ ] Sync quantity updates
- [ ] Show who checked each item
- [ ] Show active users on list

### Optimistic Updates
- [ ] Update UI immediately on user action
- [ ] Sync to server in background
- [ ] Rollback on server error
- [ ] Conflict resolution (last-write-wins)

### Shareable Links
- [ ] Generate unique shareable tokens
- [ ] Create public read-only view
- [ ] Set expiration (30 days default)
- [ ] Revoke share links
- [ ] Track link usage (optional)

### Collaboration Features
- [ ] Show who's currently viewing the list
- [ ] Show who checked each item
- [ ] Real-time cursor/presence (optional for MVP)
- [ ] Activity feed (optional)

### API Endpoints
- [ ] `POST /api/grocery-lists/:id/share` - Generate share link
- [ ] `DELETE /api/grocery-lists/:id/share` - Revoke share link
- [ ] `GET /api/grocery-lists/shared/:token` - Public list view
- [ ] `PUT /api/grocery-lists/:id/items/:itemId` - Update item (with broadcast)

### UI Components
- [ ] `ShareListButton` - Share dialog trigger
- [ ] `ShareLinkModal` - Display shareable link
- [ ] `SharedListView` - Read-only public view
- [ ] `ActiveUsers` - Show who's online
- [ ] `ItemAttribution` - Show who checked

## Acceptance Criteria

- [ ] Changes sync in real-time (< 1 second latency)
- [ ] Multiple users can view same list simultaneously
- [ ] Checking items updates for all users
- [ ] Can generate shareable link
- [ ] Shared links work without login
- [ ] Shared view is read-only
- [ ] Can revoke share links
- [ ] Shows who checked each item
- [ ] Works across devices (web + mobile)
- [ ] Handles connection drops gracefully

## Technical Details

### Real-time Setup (Supabase)

```typescript
// lib/realtime.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function subscribeToGroceryList(
  listId: string,
  onUpdate: (payload: any) => void
) {
  const channel = supabase
    .channel(`grocery_list:${listId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'grocery_list_items',
        filter: `grocery_list_id=eq.${listId}`
      },
      (payload) => {
        onUpdate(payload)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

export function broadcastListUpdate(listId: string, data: any) {
  const channel = supabase.channel(`grocery_list:${listId}`)
  channel.send({
    type: 'broadcast',
    event: 'list_update',
    payload: data
  })
}
```

### Real-time Hooks

```typescript
'use client'

export function useGroceryListRealtime(listId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeToGroceryList(listId, (payload) => {
      // Update local cache
      queryClient.setQueryData(['grocery-list', listId], (old: any) => {
        if (!old) return old

        switch (payload.eventType) {
          case 'INSERT':
            return {
              ...old,
              items: [...old.items, payload.new]
            }

          case 'UPDATE':
            return {
              ...old,
              items: old.items.map(item =>
                item.id === payload.new.id ? payload.new : item
              )
            }

          case 'DELETE':
            return {
              ...old,
              items: old.items.filter(item => item.id !== payload.old.id)
            }

          default:
            return old
        }
      })
    })

    return unsubscribe
  }, [listId, queryClient])
}
```

### Shareable Link System

```sql
CREATE TABLE grocery_list_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  token VARCHAR(32) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  access_count INTEGER DEFAULT 0
);

CREATE INDEX idx_shares_token ON grocery_list_shares(token);
CREATE INDEX idx_shares_list ON grocery_list_shares(grocery_list_id);
```

### Share API

```typescript
// POST /api/grocery-lists/:id/share
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  const list = await db.groceryList.findUnique({
    where: { id: params.id }
  })

  if (!list || list.household_id !== user.household_id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Generate secure token
  const token = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const share = await db.groceryListShare.create({
    data: {
      grocery_list_id: params.id,
      token,
      created_by: session.user.id,
      expires_at: expiresAt
    }
  })

  return Response.json({
    token,
    url: `${process.env.NEXTAUTH_URL}/shared/${token}`,
    expires_at: expiresAt
  })
}

// GET /api/grocery-lists/shared/:token
export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const share = await db.groceryListShare.findUnique({
    where: { token: params.token },
    include: {
      grocery_list: {
        include: {
          items: {
            include: { ingredient: true }
          }
        }
      }
    }
  })

  if (!share || share.revoked || share.expires_at < new Date()) {
    return Response.json({ error: "Share link not found or expired" }, { status: 404 })
  }

  // Increment access count
  await db.groceryListShare.update({
    where: { id: share.id },
    data: { access_count: { increment: 1 } }
  })

  // Return read-only view of list
  return Response.json({
    list: share.grocery_list,
    shared: true,
    expires_at: share.expires_at
  })
}
```

### Optimistic Update Component

```typescript
'use client'

export function GroceryListWithRealtime({ listId }: { listId: string }) {
  // Subscribe to real-time updates
  useGroceryListRealtime(listId)

  const queryClient = useQueryClient()

  const checkMutation = useMutation({
    mutationFn: async ({ itemId, checked }: { itemId: string; checked: boolean }) => {
      const res = await fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked })
      })

      if (!res.ok) throw new Error('Failed to update item')

      return res.json()
    },
    onMutate: async ({ itemId, checked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['grocery-list', listId])

      // Snapshot previous value
      const previous = queryClient.getQueryData(['grocery-list', listId])

      // Optimistically update
      queryClient.setQueryData(['grocery-list', listId], (old: any) => ({
        ...old,
        items: old.items.map(item =>
          item.id === itemId
            ? { ...item, checked, checked_at: new Date() }
            : item
        )
      }))

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['grocery-list', listId], context.previous)
      }
      toast.error('Failed to update item')
    },
    onSuccess: () => {
      // Real-time will handle the update for other users
    }
  })

  const handleCheck = (itemId: string, checked: boolean) => {
    checkMutation.mutate({ itemId, checked })
  }

  return <OrganizedGroceryList listId={listId} onCheckItem={handleCheck} />
}
```

### Shared List View

```typescript
'use client'

export function SharedListView({ token }: { token: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-list', token],
    queryFn: async () => {
      const res = await fetch(`/api/grocery-lists/shared/${token}`)
      if (!res.ok) throw new Error('Link not found or expired')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Link Not Found</h2>
        <p className="text-gray-600">
          This share link may have expired or been revoked.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          📋 Viewing shared grocery list (read-only)
        </p>
      </div>

      <OrganizedGroceryList
        listId={data.list.id}
        readOnly={true}
      />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Want to create your own grocery lists?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up free
          </a>
        </p>
      </div>
    </div>
  )
}
```

## Dependencies

- [ ] #12 Grocery List Generation
- [ ] #13 List Organization
- Supabase or Pusher configured

## Testing

- [ ] Test real-time updates with 2+ users
- [ ] Test optimistic updates
- [ ] Test error rollback
- [ ] Test connection drop and reconnect
- [ ] Test share link generation
- [ ] Test shared link access (without login)
- [ ] Test share link expiration
- [ ] Test share link revocation
- [ ] Test concurrent edits
- [ ] Performance test with multiple active connections

## Resources

- PRD Section 3.4: Grocery List Generation (US-4.3)
- Implementation Plan: Section 3.3 List Sharing & Real-time Sync
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
