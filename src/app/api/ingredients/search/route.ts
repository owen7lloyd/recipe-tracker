import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { ilike, or, sql } from 'drizzle-orm';

// GET /api/ingredients/search?q=query
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query || query.length < 1) {
      // Return empty array or top ingredients
      const topIngredients = await db
        .select({
          id: ingredients.id,
          name: ingredients.name,
          category: ingredients.category,
          commonUnits: ingredients.commonUnits,
        })
        .from(ingredients)
        .limit(limit);

      return NextResponse.json(topIngredients);
    }

    // Search ingredients by name
    const results = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        category: ingredients.category,
        commonUnits: ingredients.commonUnits,
      })
      .from(ingredients)
      .where(ilike(ingredients.name, `%${query}%`))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching ingredients' },
      { status: 500 }
    );
  }
}
