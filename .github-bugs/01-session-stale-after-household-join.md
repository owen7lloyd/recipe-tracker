# Bug: Session Stale After Joining Household

## Status

🔴 **UNRESOLVED** - Documented for future fix

## Description

When a user joins a household via invite link, the NextAuth session does not update to reflect the new `householdId`. This causes issues accessing household-specific pages (like Settings) until the user manually logs out and logs back in.

## Impact

- **Severity**: Medium
- **Affected Feature**: Household invite/join flow
- **User Experience**: Confusing - users must manually re-authenticate after joining

## Technical Root Cause

NextAuth v5 uses JWT-based sessions that cache user data at login time. When a user joins a household:

1. Database is updated with new `householdId`
2. JWT token still contains old/null `householdId`
3. Middleware and client-side session use stale token data
4. Server components can fetch fresh data, but session remains stale

### JWT Token Structure

```typescript
{
  id: string,
  householdId: string | null, // Cached at login, not updated
  // ... other fields
}
```

## Attempted Solutions

### ❌ Solution 1: Database Query in JWT Callback

**Attempted in**: `src/lib/auth/config.ts`

```typescript
async jwt({ token, user, trigger }) {
  // Always fetch latest householdId from database
  if (token.id && (trigger === 'update' || !user)) {
    const latestUser = await db
      .select({ householdId: users.householdId })
      .from(users)
      .where(eq(users.id, token.id as string))
      .limit(1);

    if (latestUser[0]) {
      token.householdId = latestUser[0].householdId;
    }
  }
  return token;
}
```

**Result**: Failed - JWT callback runs in Edge runtime (from middleware) where database connections don't work.

**Error**:

```
[auth][error] JWTSessionError
[auth][cause]: Error: Failed query: select "household_id" from "users"...
```

### ❌ Solution 2: Sign Out and Re-login

**Attempted in**: `src/components/household/join-household-form.tsx`

```typescript
// After joining household
await signOut({ redirect: false });
router.push('/login?message=household-joined&callbackUrl=/dashboard');
```

**Result**: Technically works but terrible UX - users must log in twice in one flow.

**User Feedback**: "This is a terrible user experience"

## Current Workaround

Server components now fetch fresh data from database instead of relying on session:

```typescript
// src/app/dashboard/settings/page.tsx
const user = await db
  .select({ householdId: users.householdId })
  .from(users)
  .where(eq(users.id, session.user.id))
  .limit(1);

const household = await getHouseholdWithMembers(user[0].householdId);
```

**Limitations**:

- Only works in server components
- Client components and middleware still see stale session
- Extra database queries on every page load
- Inconsistent data between session and DB

## Files Affected

- `src/lib/auth/config.ts` - JWT/session callbacks
- `src/app/dashboard/settings/page.tsx` - Workaround implemented
- `src/app/dashboard/page.tsx` - Workaround implemented
- `src/components/household/join-household-form.tsx` - Join flow
- `src/middleware.ts` - Uses stale session data

## Potential Solutions to Explore

### Option 1: Session Update API (NextAuth v5)

NextAuth v5 has a `update()` function for session updates. Need to investigate if this can trigger JWT regeneration.

```typescript
import { useSession } from 'next-auth/react';

const { update } = useSession();
await update({ householdId: newHouseholdId });
```

**Research needed**: Does this work with JWT strategy? Does it propagate to middleware?

### Option 2: Database Adapter Instead of JWT

Switch from JWT to database session strategy. This would make session always reflect DB state.

```typescript
session: {
  strategy: 'database', // Instead of 'jwt'
}
```

**Tradeoffs**:

- ✅ Always fresh data
- ❌ Requires database query on every request
- ❌ More complex deployment (need persistent DB)
- ❌ May not work with Edge runtime/middleware

### Option 3: Custom Session Refresh Endpoint

Create an API endpoint that issues a new token after household changes.

```typescript
// POST /api/auth/refresh-session
// 1. Validate current session
// 2. Fetch fresh user data from DB
// 3. Generate new JWT token
// 4. Return new token to client
```

**Implementation needed**: Custom token generation/signing logic.

### Option 4: Short-lived JWT Tokens

Reduce JWT `maxAge` from 7 days to something shorter (e.g., 1 hour). Forces more frequent token regeneration.

**Tradeoffs**:

- ✅ Eventual consistency
- ❌ More frequent auth checks
- ❌ Worse UX (logged out more often)
- ❌ Doesn't solve immediate problem

### Option 5: Optimistic Session Updates (Client-side)

Update session data optimistically on client-side after join, then validate on next server request.

**Concerns**:

- Session/token mismatch
- Security implications
- Complex state management

## Reproduction Steps

1. User A generates invite link for their household
2. User B (not logged in) clicks invite link
3. User B sees invite preview, clicks "Continue to Join"
4. User B logs in/registers
5. User B is auto-joined to household (DB updated)
6. User B clicks "Settings" in navigation
7. Settings page may not load correctly (depending on implementation)

## Expected Behavior

After joining a household, user should have immediate access to all household features without re-authenticating.

## Actual Behavior

Session contains stale `householdId`. Workarounds implemented in server components, but architecture is fragile and inconsistent.

## Related Issues

- Session middleware uses cached data
- Client-side `useSession()` hook returns stale data
- Multiple database queries needed to work around session cache

## Priority

Medium - Feature works with workarounds, but architecture is not ideal for long-term maintenance.

## Next Steps

1. Research NextAuth v5 `update()` function capabilities
2. Consider database session adapter
3. Monitor NextAuth v5 releases for session refresh improvements
4. Consider filing issue with NextAuth project

## Notes

- This is a known limitation of JWT-based sessions
- Similar issues occur for any user data that changes after login (role changes, profile updates, etc.)
- May want to establish a pattern for handling mutable user data in sessions
