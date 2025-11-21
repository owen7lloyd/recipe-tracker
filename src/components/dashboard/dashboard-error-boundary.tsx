'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useRouter } from 'next/navigation';

export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <ErrorBoundary
      onReset={() => {
        router.refresh();
      }}
      showDetails
    >
      {children}
    </ErrorBoundary>
  );
}
