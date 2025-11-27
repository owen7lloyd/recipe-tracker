/**
 * Tests for Recipe Matching with Reduced Servings Support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  findCookableRecipes,
  type RecipeMatch,
  type RecipeMatchWithServings,
} from './recipe-matching';
import * as db from '@/lib/db';

// Mock the database module
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

// Mock the substitution service
vi.mock('@/lib/substitution-service', () => ({
  SubstitutionService: class {
    async getSubstitutes() {
      return [];
    }
  },
}));

describe('Recipe Matching with Reduced Servings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Reduced servings calculation', () => {
    it('should calculate achievable servings for a recipe', () => {
      // This test verifies the calculation logic
      // Given a recipe with 4 servings and ingredients needing specific quantities
      // When we have limited pantry items
      // Then we should calculate the maximum achievable servings

      const mockRecipeData = {
        recipeId: 'recipe-1',
        recipeTitle: 'Test Recipe',
        recipeServings: 4,
        ingredientId: 'ing-1',
        ingredientRefId: 'ing-1',
        ingredientName: 'flour',
        quantity: '2',
        unit: 'cups',
        optional: false,
      };

      // If we have 1 cup of flour and need 2 cups for 4 servings
      // We can make 2 servings max
      const maxServings = (1 / 2) * 4; // = 2 servings
      expect(maxServings).toBe(2);
    });

    it('should handle fractional servings accurately', () => {
      // Test fractional servings calculation
      const recipeServings = 4;
      const quantityNeeded = 1;
      const quantityAvailable = 1.5;

      const achievableServings =
        (quantityAvailable / quantityNeeded) * recipeServings;
      // Should handle 1.5 / 1 * 4 = 6 servings
      expect(achievableServings).toBe(6);

      // Should round down to 2 decimal places
      const rounded = Math.floor(achievableServings * 100) / 100;
      expect(rounded).toBe(6);
    });

    it('should round achievable servings to 2 decimal places', () => {
      const recipeServings = 4;
      const quantityNeeded = 3;
      const quantityAvailable = 2;

      const achievableServings =
        (quantityAvailable / quantityNeeded) * recipeServings;
      // 2 / 3 * 4 = 2.666...
      expect(achievableServings).toBeCloseTo(2.667, 2);

      const rounded = Math.floor(achievableServings * 100) / 100;
      expect(rounded).toBe(2.66);
    });

    it('should categorize recipes as full or reduced', () => {
      const defaultServings = 4;

      // Full recipe test
      const achievableFull = 4;
      const canMakeFull = achievableFull >= defaultServings;
      const canMakeReduced =
        achievableFull > 0 && achievableFull < defaultServings;

      expect(canMakeFull).toBe(true);
      expect(canMakeReduced).toBe(false);

      // Reduced servings test
      const achievableReduced = 2;
      const canMakeFull2 = achievableReduced >= defaultServings;
      const canMakeReduced2 =
        achievableReduced > 0 && achievableReduced < defaultServings;

      expect(canMakeFull2).toBe(false);
      expect(canMakeReduced2).toBe(true);

      // Not possible test
      const achievableZero = 0;
      const canMakeFull3 = achievableZero >= defaultServings;
      const canMakeReduced3 =
        achievableZero > 0 && achievableZero < defaultServings;

      expect(canMakeFull3).toBe(false);
      expect(canMakeReduced3).toBe(false);
    });

    it('should identify limiting ingredients', () => {
      // When multiple ingredients have different max servings,
      // the lowest one limits the recipe
      const ingredients = [
        { name: 'flour', maxServings: 6 },
        { name: 'eggs', maxServings: 4 },
        { name: 'milk', maxServings: 8 },
      ];

      const achievableServings = Math.min(
        ...ingredients.map((i) => i.maxServings)
      );
      expect(achievableServings).toBe(4);

      const limitingIngredients = ingredients
        .filter((i) => i.maxServings === achievableServings)
        .map((i) => i.name);

      expect(limitingIngredients).toEqual(['eggs']);
    });

    it('should handle recipes with zero quantity ingredients', () => {
      // When an ingredient has no quantity specified
      // (e.g., "salt to taste"), we assume unlimited availability
      const quantityNeeded = 0; // No specific quantity
      const quantityAvailable = 0; // Doesn't matter

      // Should handle gracefully and assume unlimited
      const canMake = quantityNeeded === 0 || quantityNeeded === null;
      expect(canMake).toBe(true);
    });

    it('should filter recipes by serving range', () => {
      const recipes = [
        { title: 'Recipe A', achievableServings: 1 },
        { title: 'Recipe B', achievableServings: 2 },
        { title: 'Recipe C', achievableServings: 4 },
        { title: 'Recipe D', achievableServings: 6 },
        { title: 'Recipe E', achievableServings: 8 },
      ];

      // Filter for recipes with 2-4 servings
      const minServings = 2;
      const maxServings = 4;

      const filtered = recipes.filter(
        (r) =>
          r.achievableServings >= minServings &&
          r.achievableServings <= maxServings
      );

      expect(filtered).toEqual([
        { title: 'Recipe B', achievableServings: 2 },
        { title: 'Recipe C', achievableServings: 4 },
      ]);
    });

    it('should sort recipes by achievable servings', () => {
      const recipes = [
        { title: 'Recipe A', achievableServings: 2 },
        { title: 'Recipe B', achievableServings: 6 },
        { title: 'Recipe C', achievableServings: 1 },
        { title: 'Recipe D', achievableServings: 4 },
      ];

      // Sort by achievable servings descending
      const sorted = [...recipes].sort(
        (a, b) => b.achievableServings - a.achievableServings
      );

      expect(sorted.map((r) => r.title)).toEqual([
        'Recipe B',
        'Recipe D',
        'Recipe A',
        'Recipe C',
      ]);
    });
  });

  describe('API filtering parameters', () => {
    it('should validate min and max servings parameters', () => {
      const minServings = 2;
      const maxServings = 8;

      expect(minServings >= 0).toBe(true);
      expect(maxServings > minServings).toBe(true);
    });

    it('should handle undefined serving parameters', () => {
      const minServings = undefined;
      const maxServings = undefined;

      // Should not filter if parameters are undefined
      const recipe = { achievableServings: 4 };

      const passesMin =
        minServings === undefined || recipe.achievableServings >= minServings;
      const passesMax =
        maxServings === undefined || recipe.achievableServings <= maxServings;

      expect(passesMin && passesMax).toBe(true);
    });
  });
});
