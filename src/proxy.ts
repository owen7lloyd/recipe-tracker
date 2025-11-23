import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

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
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isAuthenticated) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

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
