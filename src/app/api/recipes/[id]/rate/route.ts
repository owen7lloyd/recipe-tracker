import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recipeRatings, recipes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as it's now a Promise in Next.js 15
    const { id } = await params;

    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Household authorization
    const householdId = session.user.householdId;
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to household' },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    const { rating, comment } = ratingSchema.parse(body);

    // 4. Verify recipe exists and belongs to household
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(
        and(eq(recipes.id, id), eq(recipes.householdId, householdId))
      )
      .limit(1);

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // 5. Check if user has already rated
    const [existingRating] = await db
      .select()
      .from(recipeRatings)
      .where(
        and(
          eq(recipeRatings.recipeId, id),
          eq(recipeRatings.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingRating) {
      // Update existing rating
      await db
        .update(recipeRatings)
        .set({
          rating,
          comment: comment || null,
          ratedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(recipeRatings.id, existingRating.id));
    } else {
      // Create new rating
      await db.insert(recipeRatings).values({
        recipeId: id,
        userId: session.user.id,
        householdId,
        rating,
        comment: comment || null,
        ratedAt: new Date(),
      });
    }

    // 6. Calculate average rating
    const [ratingStats] = await db
      .select({
        avgRating: sql<number>`ROUND(AVG(${recipeRatings.rating})::numeric, 1)`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(recipeRatings)
      .where(eq(recipeRatings.recipeId, id));

    const avgRating = ratingStats?.avgRating ?? null;
    const ratingCount = ratingStats?.count ?? 0;

    // 7. Update recipe rating
    await db
      .update(recipes)
      .set({
        avgRating: avgRating ? String(avgRating) : null,
        ratingCount,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id));

    // 8. Return response
    return NextResponse.json({
      success: true,
      message: existingRating ? 'Rating updated' : 'Rating saved',
      avgRating,
      ratingCount,
    });
  } catch (error) {
    // 9. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's rating for a recipe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as it's now a Promise in Next.js 15
    const { id } = await params;

    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Household authorization
    const householdId = session.user.householdId;
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to household' },
        { status: 403 }
      );
    }

    // 3. Get user's rating for this recipe
    const [userRating] = await db
      .select()
      .from(recipeRatings)
      .where(
        and(
          eq(recipeRatings.recipeId, id),
          eq(recipeRatings.userId, session.user.id)
        )
      )
      .limit(1);

    if (!userRating) {
      return NextResponse.json({ userRating: null });
    }

    return NextResponse.json({
      userRating: {
        rating: userRating.rating,
        comment: userRating.comment,
        ratedAt: userRating.ratedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}
