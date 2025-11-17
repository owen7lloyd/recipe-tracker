import { db } from '@/lib/db';
import { users, households, householdInvites } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Generate a unique 8-character invite code
 * Uses uppercase letters and numbers, excluding similar-looking characters (I, L, O, 0, 1)
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique invite code (checks for uniqueness in database)
 */
export async function generateUniqueInviteCode(): Promise<string> {
  let code = generateInviteCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await db
      .select()
      .from(householdInvites)
      .where(eq(householdInvites.code, code))
      .limit(1);

    if (existing.length === 0) {
      return code;
    }

    code = generateInviteCode();
    attempts++;
  }

  throw new Error('Failed to generate unique invite code');
}

/**
 * Check if a user has access to a household
 */
export async function requireHousehold(
  userId: string,
  householdId: string
): Promise<boolean> {
  const user = await db
    .select({ householdId: users.householdId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user[0]?.householdId === householdId;
}

/**
 * Check if a user is the creator of a household
 */
export async function isHouseholdCreator(
  userId: string,
  householdId: string
): Promise<boolean> {
  const household = await db
    .select({ createdBy: households.createdBy })
    .from(households)
    .where(eq(households.id, householdId))
    .limit(1);

  return household[0]?.createdBy === userId;
}

/**
 * Validate an invite code
 */
export async function validateInviteCode(code: string) {
  const invite = await db
    .select()
    .from(householdInvites)
    .where(
      and(
        eq(householdInvites.code, code),
        gt(householdInvites.expiresAt, new Date())
      )
    )
    .limit(1);

  if (invite.length === 0) {
    return null;
  }

  // Check if invite has already been used
  if (invite[0].usedBy) {
    return null;
  }

  return invite[0];
}

/**
 * Get household with members
 */
export async function getHouseholdWithMembers(householdId: string) {
  const household = await db
    .select()
    .from(households)
    .where(eq(households.id, householdId))
    .limit(1);

  if (household.length === 0) {
    return null;
  }

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.householdId, householdId));

  return {
    ...household[0],
    members,
  };
}
