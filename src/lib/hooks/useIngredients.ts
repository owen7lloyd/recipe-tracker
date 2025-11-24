'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  commonUnits?: string[] | null;
  isCustom?: boolean;
}

/**
 * Hook for fetching and searching both default and custom ingredients
 * Automatically includes custom ingredients for the authenticated user
 */
export function useIngredients(initialQuery?: string) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string, category?: string, limit: number = 20) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (category) params.set('category', category);
        params.set('limit', limit.toString());

        const response = await fetch(
          `/api/ingredients/search?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch ingredients');
        }

        const data = await response.json();
        setIngredients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIngredients([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialQuery !== undefined) {
      search(initialQuery);
    }
  }, [initialQuery, search]);

  return { ingredients, loading, error, search };
}

/**
 * Hook for managing custom ingredients (CRUD operations)
 */
export function useCustomIngredients() {
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomIngredients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ingredients/custom');

      if (!response.ok) {
        throw new Error('Failed to fetch custom ingredients');
      }

      const data = await response.json();
      setCustomIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCustomIngredients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomIngredient = useCallback(
    async (
      name: string,
      defaultUnit?: string,
      category?: string
    ): Promise<Ingredient | null> => {
      try {
        const response = await fetch('/api/ingredients/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, defaultUnit, category }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to create custom ingredient'
          );
        }

        const newIngredient = await response.json();
        setCustomIngredients((prev) => [...prev, newIngredient]);
        return newIngredient;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    []
  );

  const updateCustomIngredient = useCallback(
    async (
      id: string,
      updates: Partial<Ingredient>
    ): Promise<Ingredient | null> => {
      try {
        const response = await fetch(`/api/ingredients/custom/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to update custom ingredient'
          );
        }

        const updated = await response.json();
        setCustomIngredients((prev) =>
          prev.map((ing) => (ing.id === id ? updated : ing))
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return null;
      }
    },
    []
  );

  const deleteCustomIngredient = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/ingredients/custom/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to delete custom ingredient'
          );
        }

        setCustomIngredients((prev) => prev.filter((ing) => ing.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return false;
      }
    },
    []
  );

  return {
    customIngredients,
    loading,
    error,
    fetchCustomIngredients,
    createCustomIngredient,
    updateCustomIngredient,
    deleteCustomIngredient,
  };
}
