/**
 * API Utilities
 * Shared utilities for API route handlers
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Require authentication for an API route
 * Returns user ID if authenticated, or NextResponse error if not
 *
 * @example
 * const authResult = await requireAuth();
 * if (authResult instanceof NextResponse) return authResult;
 * const userId = authResult;
 */
export async function requireAuth(): Promise<string | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session.user.id;
}

/**
 * Create a standardized error response
 *
 * @param message - Error message to return to client
 * @param status - HTTP status code (default: 500)
 * @param logMessage - Optional message to log (defaults to message)
 * @param error - Optional error object to log
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  logMessage?: string,
  error?: unknown
): NextResponse {
  if (error) {
    console.error(logMessage || message, error);
  } else if (logMessage) {
    console.error(logMessage);
  }

  return NextResponse.json({ error: message }, { status });
}
