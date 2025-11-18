/**
 * Ingredient Substitution Service
 * Provides methods for querying and managing ingredient substitutions
 */

import { db } from '@/lib/db';
import { ingredients, ingredientSubstitutions } from '@/lib/db/schema';
import { eq, or, and } from 'drizzle-orm';

export interface Substitution {
  id: string;
  ingredientId: string;
  substitute: {
    id: string;
    name: string;
    category: string;
    commonUnits: string[] | null;
  };
  ratio: string;
  notes: string | null;
}

export interface SubstitutionCheck {
  substitutable: boolean;
  ratio?: number;
}

export class SubstitutionService {
  /**
   * Get all substitutes for an ingredient (bidirectional)
   * Returns both forward substitutions (A→B) and reverse (B→A)
   */
  async getSubstitutes(ingredientId: string): Promise<Substitution[]> {
    // Get forward substitutions (ingredient_id matches)
    const forwardSubs = await db
      .select({
        id: ingredientSubstitutions.id,
        ingredientId: ingredientSubstitutions.ingredientId,
        substituteId: ingredientSubstitutions.substituteId,
        ratio: ingredientSubstitutions.ratio,
        notes: ingredientSubstitutions.notes,
        substituteName: ingredients.name,
        substituteCategory: ingredients.category,
        substituteCommonUnits: ingredients.commonUnits,
      })
      .from(ingredientSubstitutions)
      .innerJoin(
        ingredients,
        eq(ingredientSubstitutions.substituteId, ingredients.id)
      )
      .where(eq(ingredientSubstitutions.ingredientId, ingredientId));

    // Get reverse substitutions (substitute_id matches)
    const reverseSubs = await db
      .select({
        id: ingredientSubstitutions.id,
        ingredientId: ingredientSubstitutions.substituteId,
        substituteId: ingredientSubstitutions.ingredientId,
        ratio: ingredientSubstitutions.ratio,
        notes: ingredientSubstitutions.notes,
        substituteName: ingredients.name,
        substituteCategory: ingredients.category,
        substituteCommonUnits: ingredients.commonUnits,
      })
      .from(ingredientSubstitutions)
      .innerJoin(
        ingredients,
        eq(ingredientSubstitutions.ingredientId, ingredients.id)
      )
      .where(eq(ingredientSubstitutions.substituteId, ingredientId));

    // Format forward substitutions
    const forwardResults: Substitution[] = forwardSubs.map((sub) => ({
      id: sub.id,
      ingredientId: ingredientId,
      substitute: {
        id: sub.substituteId,
        name: sub.substituteName,
        category: sub.substituteCategory,
        commonUnits: sub.substituteCommonUnits,
      },
      ratio: sub.ratio || '1.00',
      notes: sub.notes,
    }));

    // Format reverse substitutions with inverse ratio
    const reverseResults: Substitution[] = reverseSubs.map((sub) => {
      const originalRatio = parseFloat(sub.ratio || '1.00');
      const inverseRatio = originalRatio !== 0 ? 1 / originalRatio : 1;

      return {
        id: sub.id,
        ingredientId: ingredientId,
        substitute: {
          id: sub.substituteId,
          name: sub.substituteName,
          category: sub.substituteCategory,
          commonUnits: sub.substituteCommonUnits,
        },
        ratio: inverseRatio.toFixed(2),
        notes: sub.notes,
      };
    });

    return [...forwardResults, ...reverseResults];
  }

  /**
   * Check if two ingredients are substitutable
   * Returns substitutability status and ratio if applicable
   */
  async areSubstitutable(
    ingredientId1: string,
    ingredientId2: string
  ): Promise<SubstitutionCheck> {
    const substitution = await db
      .select()
      .from(ingredientSubstitutions)
      .where(
        or(
          and(
            eq(ingredientSubstitutions.ingredientId, ingredientId1),
            eq(ingredientSubstitutions.substituteId, ingredientId2)
          ),
          and(
            eq(ingredientSubstitutions.ingredientId, ingredientId2),
            eq(ingredientSubstitutions.substituteId, ingredientId1)
          )
        )
      )
      .limit(1);

    if (!substitution || substitution.length === 0) {
      return { substitutable: false };
    }

    const sub = substitution[0];
    const ratio =
      sub.ingredientId === ingredientId1
        ? parseFloat(sub.ratio || '1.00')
        : 1 / parseFloat(sub.ratio || '1.00');

    return { substitutable: true, ratio };
  }

  /**
   * Get all substitutions in the database (admin function)
   */
  async getAllSubstitutions() {
    const allSubs = await db
      .select({
        id: ingredientSubstitutions.id,
        ingredientId: ingredientSubstitutions.ingredientId,
        substituteId: ingredientSubstitutions.substituteId,
        ratio: ingredientSubstitutions.ratio,
        notes: ingredientSubstitutions.notes,
      })
      .from(ingredientSubstitutions);

    return allSubs;
  }

  /**
   * Add a new substitution (admin function)
   */
  async addSubstitution(
    ingredientId: string,
    substituteId: string,
    ratio: string,
    notes?: string
  ) {
    const [newSub] = await db
      .insert(ingredientSubstitutions)
      .values({
        ingredientId,
        substituteId,
        ratio,
        notes,
      })
      .returning();

    return newSub;
  }

  /**
   * Delete a substitution (admin function)
   */
  async deleteSubstitution(substitutionId: string) {
    const [deleted] = await db
      .delete(ingredientSubstitutions)
      .where(eq(ingredientSubstitutions.id, substitutionId))
      .returning();

    return deleted;
  }

  /**
   * Find transitive substitutions (A→B→C)
   * Optional advanced feature for finding indirect substitutions
   */
  async getTransitiveSubstitutes(
    ingredientId: string,
    maxDepth: number = 2
  ): Promise<Substitution[]> {
    const visited = new Set<string>();
    const results: Substitution[] = [];

    const traverse = async (
      currentId: string,
      depth: number,
      cumulativeRatio: number
    ): Promise<void> => {
      if (depth >= maxDepth || visited.has(currentId)) {
        return;
      }

      visited.add(currentId);
      const directSubs = await this.getSubstitutes(currentId);

      for (const sub of directSubs) {
        const newRatio = cumulativeRatio * parseFloat(sub.ratio);
        results.push({
          ...sub,
          ratio: newRatio.toFixed(2),
        });
        await traverse(sub.substitute.id, depth + 1, newRatio);
      }
    };

    await traverse(ingredientId, 0, 1);
    return results;
  }
}

// Export singleton instance
export const substitutionService = new SubstitutionService();
