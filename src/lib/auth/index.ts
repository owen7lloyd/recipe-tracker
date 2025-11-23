import NextAuth from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authConfig } from './config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Get the session using getToken instead of auth()
 * This avoids the URL construction bug in NextAuth v5 beta
 * that causes "Invalid URL" errors on Vercel preview deployments
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = await getToken({
      req: {
        cookies: Object.fromEntries(
          cookieStore.getAll().map((c) => [c.name, c.value])
        ),
        headers: {},
      } as Parameters<typeof getToken>[0]['req'],
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
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
  } catch {
    return null;
  }
}
