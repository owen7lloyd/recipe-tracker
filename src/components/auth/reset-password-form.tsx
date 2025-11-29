'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { resetPasswordSchema } from '@/lib/validations/auth';
import type { z } from 'zod';

type FormData = z.infer<typeof resetPasswordSchema>;

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

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }

      toast({
        title: 'Success',
        description: 'Your password has been reset. You can now log in.',
        duration: 3000,
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[#2c2415] mb-2"
        >
          New Password
        </label>
        <div className="relative">
          <input
            {...register('newPassword')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            className="w-full px-4 py-2 border rounded-xl border-[#e8dcc8] focus:ring-2 focus:ring-[#d4a574] focus:outline-none"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
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
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-[#2c2415] mb-2"
        >
          Confirm Password
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

      {/* Hidden token field */}
      <input {...register('token')} type="hidden" />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
      </Button>
    </form>
  );
}
