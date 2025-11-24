# Change Password Feature

**Phase:** 5 - Enhancements
**Priority:** P1
**Estimate:** 2 days

## Description

Allow authenticated users to change their account password from the settings page. This is a critical security feature that enables users to update their credentials if compromised or for regular security hygiene.

## Tasks

### Backend API

- [ ] Create `PATCH /api/auth/change-password` endpoint
- [ ] Validate current password matches user's hash
- [ ] Validate new password meets security requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- [ ] Hash new password with bcrypt
- [ ] Update password in database
- [ ] Invalidate existing sessions (force re-login)
- [ ] Add rate limiting (max 5 attempts per 15 minutes)
- [ ] Log password change event for audit trail

### Frontend Components

- [ ] Create `ChangePasswordForm` component
- [ ] Add to settings page (`/dashboard/settings`)
- [ ] Form fields:
  - Current password (hidden)
  - New password (hidden)
  - Confirm new password (hidden)
  - Password strength indicator
- [ ] Client-side validation before submission
- [ ] Show password requirements hint
- [ ] Display success/error messages

### Security Features

- [ ] Clear form after successful change
- [ ] Hide password visibility toggle with eye icon
- [ ] Disable auto-complete on password fields
- [ ] CSRF protection via form token
- [ ] Password strength validation on client and server
- [ ] Hash new password with Argon2 or bcrypt
- [ ] No password sent in logs or error messages

### Settings Page Updates

- [ ] Add "Change Password" section
- [ ] Add "Password" label with last changed date (optional)
- [ ] Display security recommendations
- [ ] Show password change history (optional, for future)

## Acceptance Criteria

- [ ] Users can change password from settings
- [ ] Current password must match to change
- [ ] New password must meet security requirements
- [ ] Password strength is validated on client and server
- [ ] Success message displayed after password change
- [ ] User is logged out after password change
- [ ] Rate limiting prevents brute force attempts
- [ ] No sensitive data exposed in errors
- [ ] WCAG AA accessibility compliant

## Technical Details

### Database Schema (if not already present)

```typescript
// Add to users table if missing:
interface User {
  // ... existing fields
  passwordHash: string;
  passwordChangedAt?: timestamp;
  passwordChangeAttempts?: integer;
  passwordChangeLastAttemptAt?: timestamp;
}
```

### API Endpoint

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    // Fetch user with password hash
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(
      validated.currentPassword,
      user.passwordHash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validated.newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // TODO: Invalidate all existing sessions
    // This would require clearing auth tokens/sessions

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
```

### Form Component

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof changePasswordSchema>;

function PasswordRequirement({
  met,
  text,
}: {
  met: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>
        {text}
      </span>
    </div>
  );
}

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch('newPassword');

  const requirements = {
    length: (newPassword?.length ?? 0) >= 8,
    uppercase: /[A-Z]/.test(newPassword ?? ''),
    lowercase: /[a-z]/.test(newPassword ?? ''),
    number: /[0-9]/.test(newPassword ?? ''),
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully. Please log in again.',
        duration: 3000,
      });

      reset();
      // Redirect to login or refresh session
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-2xl bg-white border-[#e8dcc8]">
      <h2 className="font-merriweather text-2xl font-bold mb-6 text-[#2c2415]">
        Change Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="current" className="block text-sm font-medium mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              {...register('currentPassword')}
              type={showCurrent ? 'text' : 'password'}
              id="current"
              className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574]"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5"
            >
              {showCurrent ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="new" className="block text-sm font-medium mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showNew ? 'text' : 'password'}
              id="new"
              className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574]"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5"
            >
              {showNew ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          <div className="mt-3 p-3 bg-[#faf8f3] rounded-lg space-y-1">
            <PasswordRequirement
              met={requirements.length}
              text="At least 8 characters"
            />
            <PasswordRequirement
              met={requirements.uppercase}
              text="One uppercase letter"
            />
            <PasswordRequirement
              met={requirements.lowercase}
              text="One lowercase letter"
            />
            <PasswordRequirement
              met={requirements.number}
              text="One number"
            />
          </div>

          {errors.newPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              id="confirm"
              className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574]"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5"
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white rounded-full"
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}
```

### Settings Page Integration

```typescript
import { ChangePasswordForm } from '@/components/auth/change-password-form';

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-merriweather text-2xl font-bold mb-6">
          Account Settings
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
```

## Security Considerations

1. **Password Hashing**: Use bcrypt or Argon2 with salt rounds ≥ 10
2. **Rate Limiting**: Limit attempts to 5 per 15 minutes per user
3. **Session Invalidation**: Force user to re-login after password change
4. **Audit Logging**: Log all password changes for security audits
5. **HTTPS Only**: All password changes over encrypted connection
6. **No Password History**: Don't prevent reusing old passwords (optional)
7. **Password Requirements**: Enforce strong password policy

## Dependencies

- Authentication system (Phase 1)
- Settings page UI (Phase 4)
- React Hook Form and Zod validation

## Testing

- [ ] Valid password change succeeds
- [ ] Incorrect current password fails
- [ ] Password validation catches weak passwords
- [ ] Mismatched confirm password fails
- [ ] User logged out after password change
- [ ] Form clears after successful change
- [ ] Error messages are helpful and secure
- [ ] Rate limiting prevents brute force
- [ ] Mobile form is usable
- [ ] Accessibility keyboard navigation works

## References

- Authentication System: `.github-issues/03-authentication-system.md`
- Settings Page: Part of Phase 4 UI/UX Polish
