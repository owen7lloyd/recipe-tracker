/**
 * Ingredient Matcher
 * Matches parsed ingredient names to database ingredients
 */

import { db } from '@/lib/db';
import { ingredients } from '@/lib/db/schema';
import { ilike, or } from 'drizzle-orm';
import type { ParsedIngredient } from './ingredient-parser';

export interface MappedIngredient {
  ingredientId?: string;
  ingredientName: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  optional?: boolean;
}

/**
 * Clean ingredient name for better matching
 */
function cleanIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Try to find a matching ingredient in the database
 */
async function findIngredientMatch(
  name: string
): Promise<{ id: string; name: string } | null> {
  const cleanName = cleanIngredientName(name);
  if (!cleanName) return null;

  // Try exact match first
  const exactMatches = await db
    .select({ id: ingredients.id, name: ingredients.name })
    .from(ingredients)
    .where(ilike(ingredients.name, cleanName))
    .limit(1);

  if (exactMatches.length > 0) {
    return exactMatches[0];
  }

  // Try partial match (ingredient name contains the search term or vice versa)
  const partialMatches = await db
    .select({ id: ingredients.id, name: ingredients.name })
    .from(ingredients)
    .where(
      or(
        ilike(ingredients.name, `%${cleanName}%`),
        ilike(ingredients.name, `${cleanName}%`)
      )
    )
    .limit(1);

  if (partialMatches.length > 0) {
    return partialMatches[0];
  }

  return null;
}

/**
 * Map parsed ingredients to database ingredients
 */
export async function mapIngredients(
  parsedIngredients: ParsedIngredient[]
): Promise<MappedIngredient[]> {
  const mapped: MappedIngredient[] = [];

  for (const parsed of parsedIngredients) {
    const match = await findIngredientMatch(parsed.name);

    mapped.push({
      ingredientId: match?.id,
      ingredientName: match?.name || parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      notes: parsed.notes,
      optional: false,
    });
  }

  return mapped;
}
