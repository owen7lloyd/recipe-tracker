import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { DashboardErrorBoundary } from '@/components/dashboard/dashboard-error-boundary';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <DashboardNav user={session.user} />
      <main>
        <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
      </main>
    </div>
  );
}
