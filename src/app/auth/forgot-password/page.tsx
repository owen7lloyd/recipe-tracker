import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-merriweather text-4xl font-bold text-[#2d5016] mb-2">
            Forgot Your Password?
          </h1>
          <p className="text-[#6b6250]">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <div className="p-6 border rounded-2xl bg-white border-[#e8dcc8]">
          <ForgotPasswordForm />

          <div className="mt-6 text-center">
            <p className="text-[#6b6250] text-sm">
              Remember your password?{' '}
              <a
                href="/login"
                className="font-semibold text-[#2d5016] hover:text-[#3d6b1f] transition-colors"
              >
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
