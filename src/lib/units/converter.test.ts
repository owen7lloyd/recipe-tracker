import { describe, it, expect } from 'vitest';
import {
  convertBetweenUnits,
  roundQuantity,
  convertToBaseUnit,
} from './converter';
import { areUnitsCompatible, getUnitSystem } from './conversions';

describe('Unit Converter', () => {
  describe('convertBetweenUnits', () => {
    // Volume conversions
    describe('volume conversions', () => {
      it('should convert teaspoons to tablespoons', () => {
        const result = convertBetweenUnits(3, 'tsp', 'tbsp');
        expect(result).toBeCloseTo(1, 1);
      });

      it('should convert cups to milliliters', () => {
        const result = convertBetweenUnits(1, 'cup', 'ml');
        expect(result).toBeCloseTo(236.588, 1);
      });

      it('should convert milliliters to cups', () => {
        const result = convertBetweenUnits(236.588, 'ml', 'cup');
        expect(result).toBeCloseTo(1, 1);
      });

      it('should convert liters to cups', () => {
        const result = convertBetweenUnits(1, 'liter', 'cup');
        expect(result).toBeCloseTo(4.227, 1);
      });

      it('should convert fluid ounces to milliliters', () => {
        const result = convertBetweenUnits(1, 'fl oz', 'ml');
        expect(result).toBeCloseTo(29.5735, 1);
      });

      it('should handle identical units', () => {
        const result = convertBetweenUnits(5, 'cup', 'cup');
        expect(result).toBe(5);
      });
    });

    // Weight conversions
    describe('weight conversions', () => {
      it('should convert ounces to grams', () => {
        const result = convertBetweenUnits(1, 'oz', 'g');
        expect(result).toBeCloseTo(28.3495, 1);
      });

      it('should convert pounds to grams', () => {
        const result = convertBetweenUnits(1, 'lb', 'g');
        expect(result).toBeCloseTo(453.592, 1);
      });

      it('should convert grams to kilograms', () => {
        const result = convertBetweenUnits(1000, 'g', 'kg');
        expect(result).toBeCloseTo(1, 2);
      });

      it('should convert kilograms to grams', () => {
        const result = convertBetweenUnits(1, 'kg', 'g');
        expect(result).toBe(1000);
      });

      it('should convert pounds to kilograms', () => {
        const result = convertBetweenUnits(1, 'lb', 'kg');
        expect(result).toBeCloseTo(0.453592, 2);
      });
    });

    // Incompatible units
    describe('incompatible unit conversions', () => {
      it('should return null for cups to pounds', () => {
        const result = convertBetweenUnits(1, 'cup', 'lb');
        expect(result).toBeNull();
      });

      it('should return null for milliliters to grams', () => {
        const result = convertBetweenUnits(100, 'ml', 'g');
        expect(result).toBeNull();
      });

      it('should return null for count to volume units', () => {
        const result = convertBetweenUnits(5, 'whole', 'cup');
        expect(result).toBeNull();
      });

      it('should return null for packaging to weight units', () => {
        const result = convertBetweenUnits(2, 'can', 'oz');
        expect(result).toBeNull();
      });
    });

    // Real-world cooking scenarios
    describe('real-world cooking scenarios', () => {
      it('should NOT convert recipe flour (cups) to pantry flour (pounds) in Phase 1', () => {
        // Cross-system conversions (volume to weight) require ingredient density data
        // This is Phase 2 enhancement - for now, return null
        const result = convertBetweenUnits(2, 'cup', 'lb');
        expect(result).toBeNull();
      });

      it('should NOT convert recipe sugar (cups) to pantry sugar (grams) in Phase 1', () => {
        // Cross-system conversions require ingredient density data (Phase 2)
        const result = convertBetweenUnits(1, 'cup', 'g');
        expect(result).toBeNull();
      });

      it('should NOT convert recipe butter (cups) to pantry butter (pounds) in Phase 1', () => {
        // Cross-system conversions require ingredient density data (Phase 2)
        const result = convertBetweenUnits(0.5, 'cup', 'lb');
        expect(result).toBeNull();
      });

      it('should handle mixed imperial measurements (same system)', () => {
        // Recipe: 1 pint (should be 16 fl oz)
        const result = convertBetweenUnits(1, 'pint', 'fl oz');
        expect(result).toBeCloseTo(16, 0);
      });

      it('should convert recipe ml to pantry liters (same system)', () => {
        // Recipe: 500 ml
        // Pantry: measured in liters
        const result = convertBetweenUnits(500, 'ml', 'liter');
        expect(result).toBeCloseTo(0.5, 1);
      });

      it('should convert recipe oz to pantry grams (same weight system)', () => {
        // Recipe: 8 oz
        // Pantry: measured in grams
        const result = convertBetweenUnits(8, 'oz', 'g');
        expect(result).toBeCloseTo(226.8, 0);
      });
    });
  });

  describe('roundQuantity', () => {
    it('should round to 2 decimal places by default', () => {
      const result = roundQuantity(1.23456);
      expect(result).toBe(1.23);
    });

    it('should round to specified decimal places', () => {
      const result = roundQuantity(1.23456, 3);
      expect(result).toBe(1.235);
    });

    it('should round to 0 decimal places', () => {
      const result = roundQuantity(1.56, 0);
      expect(result).toBe(2);
    });

    it('should handle negative numbers', () => {
      const result = roundQuantity(-1.234);
      expect(result).toBe(-1.23);
    });

    it('should preserve trailing zeros when needed', () => {
      const result = roundQuantity(1.0, 2);
      expect(result).toBe(1);
    });
  });

  describe('convertToBaseUnit', () => {
    it('should convert cups to milliliters (base unit)', () => {
      const result = convertToBaseUnit(1, 'cup');
      expect(result?.value).toBeCloseTo(236.588, 1);
      expect(result?.baseUnit).toBe('ml');
      expect(result?.originalUnit).toBe('cup');
    });

    it('should convert pounds to grams (base unit)', () => {
      const result = convertToBaseUnit(1, 'lb');
      expect(result?.value).toBeCloseTo(453.592, 1);
      expect(result?.baseUnit).toBe('g');
      expect(result?.originalUnit).toBe('lb');
    });

    it('should return null for count units', () => {
      const result = convertToBaseUnit(5, 'whole');
      expect(result).toBeNull();
    });

    it('should return null for unknown units', () => {
      const result = convertToBaseUnit(1, 'invalid-unit');
      expect(result).toBeNull();
    });
  });

  describe('areUnitsCompatible', () => {
    it('should recognize volume units as compatible', () => {
      expect(areUnitsCompatible('cup', 'ml')).toBe(true);
      expect(areUnitsCompatible('tbsp', 'liter')).toBe(true);
    });

    it('should recognize weight units as compatible', () => {
      expect(areUnitsCompatible('oz', 'g')).toBe(true);
      expect(areUnitsCompatible('lb', 'kg')).toBe(true);
    });

    it('should recognize count units as compatible', () => {
      expect(areUnitsCompatible('whole', 'piece')).toBe(true);
      expect(areUnitsCompatible('clove', 'head')).toBe(true);
    });

    it('should recognize volume and weight as incompatible', () => {
      expect(areUnitsCompatible('cup', 'oz')).toBe(false);
      expect(areUnitsCompatible('ml', 'g')).toBe(false);
    });

    it('should recognize count and weight as incompatible', () => {
      expect(areUnitsCompatible('whole', 'g')).toBe(false);
    });

    it('should handle unknown units', () => {
      expect(areUnitsCompatible('invalid', 'cup')).toBe(false);
    });
  });

  describe('getUnitSystem', () => {
    it('should identify volume units', () => {
      expect(getUnitSystem('cup')).toBe('volume');
      expect(getUnitSystem('ml')).toBe('volume');
      expect(getUnitSystem('tbsp')).toBe('volume');
    });

    it('should identify weight units', () => {
      expect(getUnitSystem('g')).toBe('weight');
      expect(getUnitSystem('oz')).toBe('weight');
      expect(getUnitSystem('lb')).toBe('weight');
    });

    it('should identify count units', () => {
      expect(getUnitSystem('whole')).toBe('count');
      expect(getUnitSystem('piece')).toBe('count');
      expect(getUnitSystem('clove')).toBe('count');
    });

    it('should identify packaging units', () => {
      expect(getUnitSystem('can')).toBe('packaging');
      expect(getUnitSystem('jar')).toBe('packaging');
      expect(getUnitSystem('box')).toBe('packaging');
    });

    it('should identify specialty units', () => {
      expect(getUnitSystem('pinch')).toBe('specialty');
      expect(getUnitSystem('dash')).toBe('specialty');
    });

    it('should return unknown for invalid units', () => {
      expect(getUnitSystem('invalid-unit')).toBe('unknown');
    });
  });

  describe('edge cases', () => {
    it('should handle zero quantities', () => {
      const result = convertBetweenUnits(0, 'cup', 'ml');
      expect(result).toBe(0);
    });

    it('should handle very large quantities', () => {
      const result = convertBetweenUnits(1000, 'ml', 'liter');
      expect(result).toBeCloseTo(1, 2);
    });

    it('should handle very small quantities', () => {
      const result = convertBetweenUnits(0.0001, 'oz', 'g');
      expect(result).toBeCloseTo(0.00283495, 6);
    });

    it('should handle negative quantities gracefully', () => {
      const result = convertBetweenUnits(-1, 'cup', 'ml');
      expect(result).toBeCloseTo(-236.588, 1);
    });

    it('should round to avoid floating point errors', () => {
      // 1 ml converted to ml and back should equal 1
      const converted = convertBetweenUnits(1, 'ml', 'liter');
      const back = convertBetweenUnits(converted!, 'liter', 'ml');
      expect(back).toBeCloseTo(1, 10);
    });
  });
});
