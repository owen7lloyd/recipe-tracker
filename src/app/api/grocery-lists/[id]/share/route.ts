import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, groceryLists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// POST /api/grocery-lists/:id/share - Generate share link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listId } = await params;

    // Get user with household
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user?.householdId) {
      return NextResponse.json(
        { error: 'User not found or not part of a household' },
        { status: 404 }
      );
    }

    // Check if list exists and belongs to household
    const [list] = await db
      .select()
      .from(groceryLists)
      .where(
        and(
          eq(groceryLists.id, listId),
          eq(groceryLists.householdId, user.householdId)
        )
      );

    if (!list) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update the list with share token
    const [updatedList] = await db
      .update(groceryLists)
      .set({
        shareToken: token,
        shareExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(groceryLists.id, listId))
      .returning();

    const baseUrl =
      process.env.NEXTAUTH_URL || `https://${req.headers.get('host')}`;

    return NextResponse.json({
      token,
      url: `${baseUrl}/shared/${token}`,
      expiresAt,
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery-lists/:id/share - Revoke share link
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listId } = await params;

    // Get user with household
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user?.householdId) {
      return NextResponse.json(
        { error: 'User not found or not part of a household' },
        { status: 404 }
      );
    }

    // Check if list exists and belongs to household
    const [list] = await db
      .select()
      .from(groceryLists)
      .where(
        and(
          eq(groceryLists.id, listId),
          eq(groceryLists.householdId, user.householdId)
        )
      );

    if (!list) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Revoke share by clearing token
    await db
      .update(groceryLists)
      .set({
        shareToken: null,
        shareExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(groceryLists.id, listId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking share link:', error);
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    );
  }
}
