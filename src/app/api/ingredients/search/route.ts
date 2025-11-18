import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { ilike, and, eq } from 'drizzle-orm';

/**
 * GET /api/ingredients/search?q=query&category=produce&limit=20
 * Search ingredients with fuzzy matching
 * Supports optional category filtering and configurable limit
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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build the base query
    let dbQuery = db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        category: ingredients.category,
        commonUnits: ingredients.commonUnits,
      })
      .from(ingredients);

    // Apply filters
    const conditions = [];

    if (query) {
      // Use ILIKE for case-insensitive search (PostgreSQL)
      conditions.push(ilike(ingredients.name, `%${query}%`));
    }

    if (category) {
      conditions.push(eq(ingredients.category, category));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      dbQuery = dbQuery.where(and(...conditions));
    }

    // Execute query with limit
    const results = await dbQuery.limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching ingredients' },
      { status: 500 }
    );
  }
}
