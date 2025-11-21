import { db } from '@/lib/db';
import {
  users,
  households,
  recipes,
  pantryItems,
  groceryLists,
  recipeIngredients,
} from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

// Simple random ID generator for tests
function randomId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Test database helper utilities
 */

export async function cleanupTestData() {
  // Clean up test data in reverse order of dependencies
  try {
    await db.delete(recipeIngredients);
    await db.delete(groceryLists);
    await db.delete(pantryItems);
    await db.delete(recipes);
    await db.delete(users);
    await db.delete(households);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

export async function createTestHousehold(
  data?: Partial<typeof households.$inferInsert>
) {
  const [household] = await db
    .insert(households)
    .values({
      name: data?.name || 'Test Household',
      createdBy: data?.createdBy,
    })
    .returning();

  return household;
}

export async function createTestUser(
  householdId?: string,
  data?: Partial<typeof users.$inferInsert> & { password?: string }
) {
  const household = householdId
    ? await db.query.households.findFirst({
        where: (h, { eq }) => eq(h.id, householdId),
      })
    : await createTestHousehold();

  if (!household) {
    throw new Error('Household not found');
  }

  const hashedPassword = await bcrypt.hash(data?.password || 'password123', 10);

  const [user] = await db
    .insert(users)
    .values({
      email: data?.email || `test-${randomId(6)}@example.com`,
      passwordHash: hashedPassword,
      name: data?.name || 'Test User',
      householdId: household.id,
    })
    .returning();

  return { user, household };
}

export async function createTestRecipe(
  userId: string,
  householdId: string,
  data?: Partial<typeof recipes.$inferInsert>
) {
  const [recipe] = await db
    .insert(recipes)
    .values({
      title: data?.title || 'Test Recipe',
      category: data?.category || 'dinner',
      servings: data?.servings || 4,
      prepTimeMinutes: data?.prepTimeMinutes,
      cookTimeMinutes: data?.cookTimeMinutes,
      instructions: data?.instructions || ['Step 1', 'Step 2'],
      householdId,
      createdBy: userId,
      imageUrl: data?.imageUrl,
      sourceUrl: data?.sourceUrl,
    })
    .returning();

  return recipe;
}

export async function createTestPantryItem(
  householdId: string,
  ingredientId: string,
  userId: string,
  data?: Partial<typeof pantryItems.$inferInsert>
) {
  const [item] = await db
    .insert(pantryItems)
    .values({
      householdId,
      ingredientId,
      quantity: data?.quantity?.toString() || '1',
      unit: data?.unit || 'cup',
      addedBy: userId,
      purchaseDate: data?.purchaseDate,
    })
    .returning();

  return item;
}

export async function createTestGroceryList(
  householdId: string,
  userId: string,
  data?: Partial<typeof groceryLists.$inferInsert>
) {
  const [list] = await db
    .insert(groceryLists)
    .values({
      householdId,
      createdBy: userId,
      name: data?.name || 'Test List',
      shareToken: data?.shareToken,
      shareExpiresAt: data?.shareExpiresAt,
    })
    .returning();

  return list;
}

export function mockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    session?: { user: { id: string; email: string; householdId: string } };
  }
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.session) {
    // Mock session cookie
    headers['Cookie'] =
      `session=${Buffer.from(JSON.stringify(options.session)).toString('base64')}`;
  }

  return new Request(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
}

export function expectError(response: Response, status: number) {
  expect(response.status).toBe(status);
}

export async function expectSuccess(response: Response, status: number = 200) {
  expect(response.status).toBe(status);
  const data = await response.json();
  return data;
}
