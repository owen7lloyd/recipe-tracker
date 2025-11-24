import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import type { NextRequest } from 'next/server';

/**
 * Custom NextAuth handlers that work around the URL construction bug
 * in NextAuth v5 beta on Vercel preview deployments.
 *
 * The issue is that VERCEL_URL doesn't include the protocol, causing
 * "Invalid URL" errors when NextAuth tries to construct callback URLs.
 *
 * This workaround sets NEXTAUTH_URL dynamically from request headers.
 */

function getBaseUrl(request: NextRequest): string {
  // First check if NEXTAUTH_URL is already properly set with protocol
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('http')) {
    return process.env.NEXTAUTH_URL;
  }

  // Get protocol from x-forwarded-proto header (set by Vercel)
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  // Get host from headers
  const host =
    request.headers.get('host') || request.headers.get('x-forwarded-host');

  if (host) {
    return `${proto}://${host}`;
  }

  // Fallback to VERCEL_URL with https
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

// Create handlers for each request, setting the URL dynamically
export async function GET(request: NextRequest) {
  // Set NEXTAUTH_URL dynamically for this request
  const baseUrl = getBaseUrl(request);
  process.env.NEXTAUTH_URL = baseUrl;

  const { handlers } = NextAuth(authConfig);
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  // Set NEXTAUTH_URL dynamically for this request
  const baseUrl = getBaseUrl(request);
  process.env.NEXTAUTH_URL = baseUrl;

  const { handlers } = NextAuth(authConfig);
  return handlers.POST(request);
}
