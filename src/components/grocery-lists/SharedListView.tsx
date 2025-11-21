'use client';

import { useEffect, useState } from 'react';
import { useGroceryListRealtime } from '@/lib/hooks/useGroceryListRealtime';
import { OrganizedGroceryList } from './OrganizedGroceryList';
import Link from 'next/link';

interface GroceryList {
  id: string;
  name: string;
  items: any[];
  shared: boolean;
  expiresAt: Date | null;
}

export function SharedListView({ token }: { token: string }) {
  const [list, setList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedList() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/grocery-lists/shared/${token}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Share link API error:', res.status, errorData);

          if (res.status === 404) {
            setError('Share link not found');
          } else if (res.status === 410) {
            setError('Share link has expired');
          } else {
            setError('Failed to load shared list');
          }
          return;
        }

        const data = await res.json();
        console.log('Shared list loaded:', data);
        setList(data);
      } catch (err) {
        console.error('Error fetching shared list:', err);
        setError('Failed to load shared list');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSharedList();
  }, [token]);

  // Subscribe to real-time updates for this list
  useGroceryListRealtime(list?.id || '');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8">
          <h2 className="mb-2 text-2xl font-bold text-red-900">
            {error === 'Share link not found'
              ? 'Link Not Found'
              : error === 'Share link has expired'
                ? 'Link Expired'
                : 'Error'}
          </h2>
          <p className="text-red-700">
            {error === 'Share link not found'
              ? 'This share link may have been removed or revoked.'
              : error === 'Share link has expired'
                ? 'This share link has expired. Please ask for a new one.'
                : error}
          </p>
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Create Your Own Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              📋 Viewing shared grocery list (read-only)
            </p>
            {list.expiresAt && (
              <p className="text-xs text-blue-700">
                Link expires: {new Date(list.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <OrganizedGroceryList listId={list.id} readOnly={true} />

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Want to create your own grocery lists?
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Track your pantry, import recipes, and generate organized shopping
          lists automatically.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Sign Up Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
