import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth configuration
 * This config is used by middleware and doesn't include database calls
 * The authorize callback runs in the Node.js runtime via API routes
 */
export const authConfigEdge: NextAuthConfig = {
  providers: [], // Providers with DB access are added in the full config
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public routes that don't require authentication
      const publicRoutes = ['/', '/login', '/register'];
      const authRoutes = ['/login', '/register'];

      // Allow shared grocery lists (read-only public access)
      if (pathname.startsWith('/shared/') || pathname.startsWith('/api/grocery-lists/shared/')) {
        return true;
      }

      // Allow public routes
      if (publicRoutes.includes(pathname)) {
        // Redirect authenticated users away from auth pages
        if (isAuthenticated && authRoutes.includes(pathname)) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      // Protect all other routes - redirect to login if not authenticated
      if (!isAuthenticated) {
        const signInUrl = new URL('/login', nextUrl);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return Response.redirect(signInUrl);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.householdId = user.householdId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.householdId = token.householdId as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
