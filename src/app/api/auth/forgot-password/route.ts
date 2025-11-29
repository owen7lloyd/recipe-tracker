import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validated = forgotPasswordSchema.parse(body);

    // 2. Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json(
        {
          message:
            'If an account exists with this email, you will receive password reset instructions.',
        },
        { status: 200 }
      );
    }

    // 3. Generate reset token (valid for 1 hour)
    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // 4. Store token in database
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetTokenExpiresAt: expiresAt,
      })
      .where(eq(users.id, user.id));

    // 5. In production, send email here with reset link:
    // const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetLink);
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    // 6. Return success message (same for all emails for security)
    return NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive password reset instructions.',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
