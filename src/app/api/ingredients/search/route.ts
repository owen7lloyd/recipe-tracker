import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { ilike, sql } from 'drizzle-orm';

/**
 * GET /api/ingredients/search?q=query&category=produce
 * Search ingredients with fuzzy matching
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');

    // Minimum query length
    if (query.length < 2) {
      return NextResponse.json([]);
    }

    // Build query
    let dbQuery = db.select().from(ingredients);

    // Apply search filter
    if (query) {
      // Use ILIKE for case-insensitive search (PostgreSQL)
      dbQuery = dbQuery.where(ilike(ingredients.name, `%${query}%`));
    }

    // Apply category filter if provided
    if (category) {
      dbQuery = dbQuery.where(sql`${ingredients.category} = ${category}`);
    }

    // Execute query with limit
    const results = await dbQuery.limit(10);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching ingredients' },
      { status: 500 }
    );
  }
}
