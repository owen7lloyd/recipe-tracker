'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface InvitePreviewProps {
  code: string;
  householdName?: string;
  isValid: boolean;
}

export function InvitePreview({
  code,
  householdName,
  isValid,
}: InvitePreviewProps) {
  if (!isValid) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle>Invalid Invite</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This invite link is invalid, has expired, or has already been used.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please request a new invite from your household admin.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          <CardTitle>Join Household</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You&apos;ve been invited to join
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
            {householdName}
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p className="font-medium text-slate-900 dark:text-slate-50">
            What happens when you join:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>You&apos;ll share recipes, pantry items, and meal plans</li>
            <li>All household members can view and edit shared content</li>
            <li>
              If you&apos;re currently the only member of your household, it
              will be replaced
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href={`/login?callbackUrl=/join/${code}`}>
              Continue to Join
            </Link>
          </Button>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            You&apos;ll need to sign in or create an account
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
