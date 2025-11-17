import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, households } from '@/lib/db/schema';
import { registerSchema } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 },
      );
    }

    // Hash password
    const passwordHash = await hash(validatedData.password, 12);

    // Create a default household for the user
    const [household] = await db
      .insert(households)
      .values({
        name: `${validatedData.name}'s Household`,
      })
      .returning();

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        householdId: household.id,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        householdId: users.householdId,
      });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          householdId: user.householdId,
        },
        message: 'User registered successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data', details: error.message },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: 'An error occurred during registration' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
