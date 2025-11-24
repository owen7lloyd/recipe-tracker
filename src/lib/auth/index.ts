import NextAuth from 'next-auth';
import { decode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authConfig } from './config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Get the session by directly reading and decoding the JWT cookie.
 * This avoids the URL construction bug in NextAuth v5 beta
 * that causes "Invalid URL" errors on Vercel preview deployments.
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();

    // NextAuth v5 uses different cookie names in dev vs production
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token';

    const sessionCookie = cookieStore.get(cookieName);

    if (!sessionCookie?.value) {
      return null;
    }

    // Decode the JWT token directly
    const token = await decode({
      token: sessionCookie.value,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: cookieName,
    });

    if (!token) {
      return null;
    }

    // Construct session from token
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string | null,
        householdId: token.householdId as string | null,
      },
      expires: new Date((token.exp as number) * 1000).toISOString(),
    };
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[getSession] Error:', error);
    }
    return null;
  }
}
