/**
 * Recipe Availability API
 * GET /api/recipes/available
 *
 * Returns recipes that can be cooked with current pantry inventory,
 * optionally including near-matches with missing ingredients
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { findCookableRecipes } from '@/lib/recipe-matching';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's household
    const user = await db
      .select({ householdId: users.householdId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || user.length === 0 || !user[0].householdId) {
      return NextResponse.json(
        { error: 'User not found or not part of a household' },
        { status: 400 }
      );
    }

    const householdId = user[0].householdId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeNearMatches = searchParams.get('near_matches') === 'true';
    const minMatch = parseInt(searchParams.get('min_match') || '100', 10);
    const sortBy = (searchParams.get('sort_by') || 'match') as
      | 'match'
      | 'newest'
      | 'rating'
      | 'prepTime';
    const includeReducedServings =
      searchParams.get('include_reduced_servings') === 'true';

    // Find cookable recipes
    const matches = await findCookableRecipes(householdId, {
      minMatchPercentage: minMatch,
      includeNearMatches,
      sortBy,
      includeReducedServings,
    });

    // Separate cookable from near-matches
    const cookable = matches.filter((m) => m.cookable);
    const nearMatches = matches.filter((m) => !m.cookable);

    return NextResponse.json({
      cookable,
      nearMatches: includeNearMatches ? nearMatches : [],
      total: matches.length,
      cookableCount: cookable.length,
      nearMatchCount: nearMatches.length,
    });
  } catch (error) {
    console.error('Error fetching available recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
