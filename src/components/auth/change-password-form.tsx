'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { changePasswordSchema } from '@/lib/validations/auth';
import type { z } from 'zod';

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
      // Redirect to login after a short delay
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
              className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574] focus:outline-none"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
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
              className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574] focus:outline-none"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showNew ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
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
              className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574] focus:outline-none"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
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
          className="w-full bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </Button>
      </form>
    </div>
  );
}
