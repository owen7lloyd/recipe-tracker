import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    // 2. Find user with valid reset token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, validated.token))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // 3. Check if token has expired
    if (
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 4. Hash new password
    const newPasswordHash = await hash(validated.newPassword, 10);

    // 5. Update password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // 6. Return success response
    return NextResponse.json(
      { message: 'Password reset successfully. You can now log in.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
