import { Metadata } from 'next';
import { SharedListView } from '@/components/grocery-lists/SharedListView';

export const metadata: Metadata = {
  title: 'Shared Grocery List',
  description: 'View a shared grocery list',
};

export default async function SharedListPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SharedListView token={token} />
    </div>
  );
}
