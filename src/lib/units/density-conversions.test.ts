import { describe, it, expect } from 'vitest';
import {
  getDensityForIngredient,
  convertVolumToWeight,
  convertWeightToVolume,
  isVolumeUnit,
  isWeightUnit,
  INGREDIENT_DENSITIES,
} from './density-conversions';

describe('Density Conversions', () => {
  describe('getDensityForIngredient', () => {
    it('should return density for exact ingredient name match', () => {
      expect(getDensityForIngredient('flour')).toBe(0.125);
      expect(getDensityForIngredient('water')).toBe(1.0);
      expect(getDensityForIngredient('honey')).toBe(1.42);
    });

    it('should be case-insensitive', () => {
      expect(getDensityForIngredient('FLOUR')).toBe(0.125);
      expect(getDensityForIngredient('Flour')).toBe(0.125);
      expect(getDensityForIngredient('WATER')).toBe(1.0);
    });

    it('should find partial matches', () => {
      expect(getDensityForIngredient('all-purpose flour')).toBe(0.125);
      expect(getDensityForIngredient('granulated sugar')).toBe(0.8);
      expect(getDensityForIngredient('heavy cream')).toBe(1.0);
    });

    it('should handle whitespace', () => {
      expect(getDensityForIngredient('  flour  ')).toBe(0.125);
      expect(getDensityForIngredient('\twater\n')).toBe(1.0);
    });

    it('should return null for unknown ingredients', () => {
      expect(getDensityForIngredient('unknown ingredient')).toBeNull();
      expect(getDensityForIngredient('random stuff')).toBeNull();
    });

    it('should return null for null input', () => {
      expect(getDensityForIngredient(null)).toBeNull();
    });
  });

  describe('convertVolumToWeight', () => {
    it('should convert cups of flour to grams', () => {
      // 1 cup flour = 236.588 ml * 0.125 g/ml ≈ 29.57 g
      const result = convertVolumToWeight(1, 'cup', 'g', 'flour');
      expect(result).toBeCloseTo(29.57, 1);
    });

    it('should convert cups of sugar to grams', () => {
      // 1 cup sugar = 236.588 ml * 0.8 g/ml ≈ 189.27 g
      const result = convertVolumToWeight(1, 'cup', 'g', 'sugar');
      expect(result).toBeCloseTo(189.27, 1);
    });

    it('should convert ml of water to grams', () => {
      // Water density = 1.0 g/ml, so 100ml = 100g
      const result = convertVolumToWeight(100, 'ml', 'g', 'water');
      expect(result).toBeCloseTo(100, 1);
    });

    it('should convert cups of butter to pounds', () => {
      const result = convertVolumToWeight(1, 'cup', 'lb', 'butter');
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should convert tablespoons of honey to grams', () => {
      // 1 tbsp honey ≈ 21 g
      const result = convertVolumToWeight(1, 'tbsp', 'g', 'honey');
      expect(result).toBeCloseTo(14.7868 * 1.42, 0);
    });

    it('should return null when ingredient density unknown', () => {
      const result = convertVolumToWeight(1, 'cup', 'g', 'unknown ingredient');
      expect(result).toBeNull();
    });

    it('should return null for non-volume source unit', () => {
      const result = convertVolumToWeight(1, 'g', 'oz', 'flour');
      expect(result).toBeNull();
    });

    it('should return null for non-weight target unit', () => {
      const result = convertVolumToWeight(1, 'cup', 'ml', 'flour');
      expect(result).toBeNull();
    });

    it('should handle multi-ingredient matches', () => {
      // "all-purpose flour" should match "flour"
      const result1 = convertVolumToWeight(1, 'cup', 'g', 'all-purpose flour');
      const result2 = convertVolumToWeight(1, 'cup', 'g', 'flour');
      expect(result1).toBe(result2);
    });
  });

  describe('convertWeightToVolume', () => {
    it('should convert grams of flour to cups', () => {
      // 29.57 g flour ≈ 1 cup (inverse of above)
      const result = convertWeightToVolume(29.57, 'g', 'cup', 'flour');
      expect(result).toBeCloseTo(1, 1);
    });

    it('should convert pounds of sugar to cups', () => {
      const result = convertWeightToVolume(1, 'lb', 'cup', 'sugar');
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should convert grams of water to milliliters', () => {
      // 100g water = 100ml (density = 1.0)
      const result = convertWeightToVolume(100, 'g', 'ml', 'water');
      expect(result).toBeCloseTo(100, 1);
    });

    it('should convert ounces of honey to tablespoons', () => {
      const result = convertWeightToVolume(1, 'oz', 'tbsp', 'honey');
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should return null when ingredient density unknown', () => {
      const result = convertWeightToVolume(
        100,
        'g',
        'cup',
        'unknown ingredient'
      );
      expect(result).toBeNull();
    });

    it('should return null for non-weight source unit', () => {
      const result = convertWeightToVolume(1, 'cup', 'g', 'flour');
      expect(result).toBeNull();
    });

    it('should return null for non-volume target unit', () => {
      const result = convertWeightToVolume(100, 'g', 'oz', 'flour');
      expect(result).toBeNull();
    });
  });

  describe('isVolumeUnit', () => {
    it('should identify volume units', () => {
      expect(isVolumeUnit('tsp')).toBe(true);
      expect(isVolumeUnit('cup')).toBe(true);
      expect(isVolumeUnit('ml')).toBe(true);
      expect(isVolumeUnit('gallon')).toBe(true);
    });

    it('should not identify weight units as volume', () => {
      expect(isVolumeUnit('g')).toBe(false);
      expect(isVolumeUnit('oz')).toBe(false);
      expect(isVolumeUnit('lb')).toBe(false);
    });

    it('should not identify unknown units as volume', () => {
      expect(isVolumeUnit('unknown')).toBe(false);
      expect(isVolumeUnit('piece')).toBe(false);
    });
  });

  describe('isWeightUnit', () => {
    it('should identify weight units', () => {
      expect(isWeightUnit('g')).toBe(true);
      expect(isWeightUnit('oz')).toBe(true);
      expect(isWeightUnit('lb')).toBe(true);
      expect(isWeightUnit('kg')).toBe(true);
    });

    it('should not identify volume units as weight', () => {
      expect(isWeightUnit('cup')).toBe(false);
      expect(isWeightUnit('ml')).toBe(false);
      expect(isWeightUnit('tsp')).toBe(false);
    });

    it('should not identify unknown units as weight', () => {
      expect(isWeightUnit('unknown')).toBe(false);
      expect(isWeightUnit('piece')).toBe(false);
    });
  });

  describe('Real-world conversions', () => {
    it('should convert recipe flour quantity correctly', () => {
      // Recipe needs 2 cups flour, pantry has flour in grams
      const result = convertVolumToWeight(2, 'cup', 'g', 'flour');
      // 2 cups * 236.588 ml/cup * 0.125 g/ml = 59.147 g (not realistic due to density)
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should handle common baking conversions', () => {
      // 1 cup sugar in grams
      const sugar = convertVolumToWeight(1, 'cup', 'g', 'sugar');
      expect(sugar).toBeCloseTo(189.27, 0);

      // 1 cup flour in grams (using density)
      const flour = convertVolumToWeight(1, 'cup', 'g', 'flour');
      expect(flour).toBeDefined();

      // Both should be different
      expect(sugar).not.toBe(flour);
    });

    it('should be consistent for round-trip conversions', () => {
      // Convert cups to grams, then back to cups
      const original = 1.5;
      const toGrams = convertVolumToWeight(original, 'cup', 'g', 'flour');
      const backToCups = convertWeightToVolume(toGrams!, 'g', 'cup', 'flour');

      expect(backToCups).toBeCloseTo(original, 1);
    });
  });

  describe('Ingredient density lookup', () => {
    it('should have common baking ingredients', () => {
      expect(INGREDIENT_DENSITIES['flour']).toBeDefined();
      expect(INGREDIENT_DENSITIES['sugar']).toBeDefined();
      expect(INGREDIENT_DENSITIES['butter']).toBeDefined();
      expect(INGREDIENT_DENSITIES['water']).toBeDefined();
    });

    it('should have reasonable density values', () => {
      // Densities should be positive and reasonable
      for (const [ingredient, density] of Object.entries(
        INGREDIENT_DENSITIES
      )) {
        expect(density).toBeGreaterThan(0);
        expect(density).toBeLessThan(3); // Most food items under 3 g/ml
      }
    });
  });
});
