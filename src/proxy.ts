import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token directly - bypasses NextAuth's URL construction
  // Important: Must specify secureCookie to match development vs production cookie names
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // Validate token has required fields to be considered authenticated
  // This prevents issues with stale or corrupted tokens
  const isAuthenticated = !!(token && token.id && token.email);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];
  const authRoutes = ['/login', '/register'];

  // Allow shared grocery lists (read-only public access)
  if (
    pathname.startsWith('/shared/') ||
    pathname.startsWith('/api/grocery-lists/shared/')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes - redirect to login if not authenticated
  if (!isAuthenticated) {
    const signInUrl = new URL('/login', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api/auth (NextAuth API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)',
  ],
};
