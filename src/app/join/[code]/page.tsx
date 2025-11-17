import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { JoinHouseholdForm } from '@/components/household/join-household-form';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const session = await auth();
  const { code } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/join/${code}`);
  }

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <JoinHouseholdForm code={code} />
    </div>
  );
}
