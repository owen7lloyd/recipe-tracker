import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

async function ResetPasswordContent({
  token,
}: {
  token: string | undefined;
}) {
  if (!token) {
    return (
      <div className="text-center">
        <h2 className="font-merriweather text-2xl font-bold text-red-600 mb-4">
          Invalid Reset Link
        </h2>
        <p className="text-[#6b6250] mb-6">
          The password reset link is missing or invalid. Please request a new
          one.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Back to Login
        </a>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-merriweather text-4xl font-bold text-[#2d5016] mb-2">
            Reset Your Password
          </h1>
          <p className="text-[#6b6250]">
            Enter a new password to regain access to your account
          </p>
        </div>

        <div className="p-6 border rounded-2xl bg-white border-[#e8dcc8]">
          <Suspense
            fallback={
              <div className="text-center text-[#6b6250]">Loading...</div>
            }
          >
            <ResetPasswordContent token={token} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
