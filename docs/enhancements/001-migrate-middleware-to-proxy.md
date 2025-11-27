# Enhancement: Migrate from Middleware to Proxy Configuration

## Status
🔴 Open

## Priority
Medium

## Description
Next.js has deprecated the `middleware.ts` file convention in favor of the new `proxy` configuration. The application currently uses the deprecated middleware pattern and shows a warning on every dev server start:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

## Current Implementation
The app uses `src/middleware.ts` with next-auth's `auth()` wrapper to:
- Protect authenticated routes
- Allow public routes (`/`, `/login`, `/register`)
- Allow shared grocery list access (`/shared/*` and `/api/grocery-lists/shared/*`)
- Redirect authenticated users away from auth pages

## Required Changes

### 1. Migration Steps
Following the Next.js migration guide: https://nextjs.org/docs/messages/middleware-to-proxy

1. Create `next.config.ts` or update existing config with proxy configuration
2. Move authentication logic to appropriate locations:
   - Use route-level authentication checks
   - Consider using Next.js App Router's `middleware.ts` if still needed
   - Migrate to server components with auth checks

### 2. Authentication Strategy

**Option A: Server Component Auth Checks**
- Add `auth()` checks directly in server components
- Redirect in `page.tsx` files if not authenticated
- Simpler, more explicit

**Option B: Next.js App Router Middleware**
- Check if middleware is still supported in App Router
- May need to use `middleware.ts` at root level (not in `src/`)

**Option C: Proxy Configuration**
- Configure proxy rules in `next.config.ts`
- May need different approach for authentication

### 3. Routes to Protect

**Public Routes (no auth required):**
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/shared/*` - Shared grocery list view
- `/api/grocery-lists/shared/*` - Shared list API endpoint
- `/api/auth/*` - NextAuth endpoints

**Protected Routes (require auth):**
- `/dashboard/*` - All dashboard pages
- `/api/*` - All API routes except auth and shared lists

**Special Logic:**
- Authenticated users accessing `/login` or `/register` should be redirected to `/dashboard`

### 4. Files to Modify/Create

```
next.config.ts (create or update)
src/middleware.ts (remove or migrate)
src/app/dashboard/layout.tsx (add auth check)
src/app/api/*/route.ts (add auth checks if needed)
```

## Benefits
- ✅ Removes deprecation warning
- ✅ Aligns with Next.js best practices
- ✅ Future-proof implementation
- ✅ Potentially better performance

## Risks
- ⚠️ Breaking authentication if not tested thoroughly
- ⚠️ May require changes to multiple files
- ⚠️ Need to ensure shared links remain publicly accessible

## Testing Checklist
After migration, verify:
- [ ] Unauthenticated users cannot access `/dashboard`
- [ ] Unauthenticated users can access `/`, `/login`, `/register`
- [ ] Authenticated users are redirected from `/login` and `/register` to `/dashboard`
- [ ] Shared links work without authentication (`/shared/*`)
- [ ] Shared list API is publicly accessible (`/api/grocery-lists/shared/*`)
- [ ] Protected API routes require authentication
- [ ] NextAuth callbacks work correctly

## References
- [Next.js Middleware to Proxy Migration Guide](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [NextAuth.js with Next.js 15](https://next-auth.js.org/configuration/nextjs)

## Notes
- This is a Next.js 15+ requirement
- The current middleware pattern works but is deprecated
- No immediate urgency but should be addressed before Next.js removes support
- Consider doing this migration during a quiet period to allow thorough testing
