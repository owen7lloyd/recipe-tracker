import { describe, it, expect } from 'vitest';
import {
  normalizeUnit,
  canConvert,
  convertBetweenUnits,
  getUnitInfo,
  isKnownUnit,
  getBaseUnit,
  isSameSystem,
} from './converter';

describe('Unit Converter', () => {
  describe('normalizeUnit', () => {
    it('should normalize unit strings', () => {
      expect(normalizeUnit('TSP')).toBe('tsp');
      expect(normalizeUnit('  cup  ')).toBe('cup');
      expect(normalizeUnit('POUND')).toBe('lb');
    });

    it('should apply aliases', () => {
      expect(normalizeUnit('teaspoon')).toBe('tsp');
      expect(normalizeUnit('tablespoon')).toBe('tbsp');
      expect(normalizeUnit('ounce')).toBe('oz');
      expect(normalizeUnit('pound')).toBe('lb');
    });

    it('should handle unknown units', () => {
      expect(normalizeUnit('unknown')).toBe('unknown');
    });
  });

  describe('canConvert', () => {
    describe('same unit conversions', () => {
      it('should allow conversion of identical units', () => {
        expect(canConvert('cup', 'cup')).toBe(true);
        expect(canConvert('g', 'g')).toBe(true);
        expect(canConvert('lb', 'lb')).toBe(true);
      });
    });

    describe('volume conversions', () => {
      it('should convert imperial volume units', () => {
        expect(canConvert('tsp', 'tbsp')).toBe(true);
        expect(canConvert('cup', 'fl oz')).toBe(true);
        expect(canConvert('pint', 'cup')).toBe(true);
      });

      it('should convert metric volume units', () => {
        expect(canConvert('ml', 'liter')).toBe(true);
        expect(canConvert('liter', 'ml')).toBe(true);
      });

      it('should handle null units', () => {
        expect(canConvert(null, 'cup')).toBe(false);
        expect(canConvert('cup', null)).toBe(false);
        expect(canConvert(null, null)).toBe(false);
      });
    });

    describe('weight conversions', () => {
      it('should convert imperial weight units', () => {
        expect(canConvert('oz', 'lb')).toBe(true);
        expect(canConvert('lb', 'oz')).toBe(true);
      });

      it('should convert metric weight units', () => {
        expect(canConvert('g', 'kg')).toBe(true);
        expect(canConvert('kg', 'g')).toBe(true);
      });
    });

    describe('incompatible conversions', () => {
      it('should not convert volume to weight', () => {
        expect(canConvert('cup', 'g')).toBe(false);
        expect(canConvert('ml', 'oz')).toBe(false);
      });

      it('should not convert count units', () => {
        expect(canConvert('piece', 'slice')).toBe(false);
      });

      it('should not convert packaging units', () => {
        expect(canConvert('can', 'jar')).toBe(false);
      });

      it('should not convert special units', () => {
        expect(canConvert('pinch', 'dash')).toBe(false);
      });

      it('should not convert count to volume/weight', () => {
        expect(canConvert('piece', 'cup')).toBe(false);
        expect(canConvert('whole', 'g')).toBe(false);
      });
    });
  });

  describe('convertBetweenUnits', () => {
    describe('volume conversions', () => {
      it('should convert teaspoons to tablespoons', () => {
        const result = convertBetweenUnits(3, 'tsp', 'tbsp');
        expect(result).toBeCloseTo(1, 2);
      });

      it('should convert cups to milliliters', () => {
        const result = convertBetweenUnits(1, 'cup', 'ml');
        expect(result).toBeCloseTo(236.588, 2);
      });

      it('should convert milliliters to cups', () => {
        const result = convertBetweenUnits(236.588, 'ml', 'cup');
        expect(result).toBeCloseTo(1, 2);
      });

      it('should convert cups to fl oz', () => {
        const result = convertBetweenUnits(1, 'cup', 'fl oz');
        expect(result).toBeCloseTo(8, 2);
      });

      it('should convert liters to milliliters', () => {
        const result = convertBetweenUnits(1, 'liter', 'ml');
        expect(result).toBe(1000);
      });
    });

    describe('weight conversions', () => {
      it('should convert pounds to grams', () => {
        const result = convertBetweenUnits(1, 'lb', 'g');
        expect(result).toBeCloseTo(453.592, 2);
      });

      it('should convert grams to pounds', () => {
        const result = convertBetweenUnits(453.592, 'g', 'lb');
        expect(result).toBeCloseTo(1, 2);
      });

      it('should convert ounces to grams', () => {
        const result = convertBetweenUnits(1, 'oz', 'g');
        expect(result).toBeCloseTo(28.3495, 2);
      });

      it('should convert kilograms to grams', () => {
        const result = convertBetweenUnits(1, 'kg', 'g');
        expect(result).toBe(1000);
      });
    });

    describe('edge cases', () => {
      it('should handle zero quantity', () => {
        const result = convertBetweenUnits(0, 'cup', 'ml');
        expect(result).toBe(0);
      });

      it('should handle same unit conversion', () => {
        const result = convertBetweenUnits(5, 'cup', 'cup');
        expect(result).toBe(5);
      });

      it('should return null for negative quantity', () => {
        const result = convertBetweenUnits(-1, 'cup', 'ml');
        expect(result).toBeNull();
      });

      it('should return null for incompatible units', () => {
        const result = convertBetweenUnits(1, 'cup', 'g');
        expect(result).toBeNull();
      });

      it('should return null for null units', () => {
        expect(convertBetweenUnits(1, null as any, 'cup')).toBeNull();
        expect(convertBetweenUnits(1, 'cup', null as any)).toBeNull();
      });

      it('should handle unknown units gracefully', () => {
        const result = convertBetweenUnits(1, 'unknown', 'cup');
        expect(result).toBeNull();
      });

      it('should handle very large quantities', () => {
        const result = convertBetweenUnits(1000000, 'g', 'kg');
        expect(result).toBe(1000);
      });

      it('should handle very small quantities', () => {
        const result = convertBetweenUnits(0.001, 'liter', 'ml');
        expect(result).toBeCloseTo(1, 2);
      });
    });

    describe('precision and rounding', () => {
      it('should round results to reasonable precision', () => {
        const result = convertBetweenUnits(1.23456, 'cup', 'ml');
        // Should not have excessive decimal places
        const decimalPlaces = (result?.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle pantry deduction with same units', () => {
      // Example: Recipe needs 2 cups flour, pantry has 5 cups flour
      const flourConversion = convertBetweenUnits(2, 'cup', 'cup');
      expect(flourConversion).toBe(2); // Direct conversion

      // Example: Recipe needs 1 tbsp salt, pantry has salt in tsp
      const saltConversion = convertBetweenUnits(1, 'tbsp', 'tsp');
      expect(saltConversion).toBeCloseTo(3, 2);
    });

    it('should handle metric to imperial conversions', () => {
      // Recipe needs 500ml milk, pantry has milk in cups
      const milkConversion = convertBetweenUnits(500, 'ml', 'cup');
      expect(milkConversion).toBeCloseTo(2.11, 1);

      // Recipe needs 100g butter, pantry has butter in oz
      const butterConversion = convertBetweenUnits(100, 'g', 'oz');
      expect(butterConversion).toBeCloseTo(3.53, 1);
    });

    it('should reject impossible conversions (volume to weight)', () => {
      // Recipe needs 2 cups flour, but pantry has flour tracked in pounds
      // This cannot be converted without knowing ingredient density
      const flourConversion = convertBetweenUnits(2, 'cup', 'lb');
      expect(flourConversion).toBeNull(); // Incompatible - volume to weight

      // Recipe needs 1 cup sugar, but pantry has sugar tracked in pounds
      const sugarConversion = convertBetweenUnits(1, 'cup', 'lb');
      expect(sugarConversion).toBeNull(); // Incompatible - volume to weight
    });

    it('should convert between metric and imperial properly', () => {
      // 1 cup liquid in grams (approximate for water)
      const milkInMl = convertBetweenUnits(1, 'cup', 'ml');
      expect(milkInMl).toBeCloseTo(236.588, 2);

      // 500g in cups (volume)
      const gramsInCups = convertBetweenUnits(500, 'g', 'cup');
      expect(gramsInCups).toBeNull(); // Incompatible - weight to volume
    });
  });

  describe('getUnitInfo', () => {
    it('should return unit information', () => {
      const info = getUnitInfo('cup');
      expect(info).toBeDefined();
      expect(info?.value).toBe('cup');
      expect(info?.system).toBe('volume_imperial');
      expect(info?.baseUnit).toBe('ml');
    });

    it('should return null for unknown unit', () => {
      const info = getUnitInfo('unknown');
      expect(info).toBeNull();
    });

    it('should return null for null unit', () => {
      const info = getUnitInfo(null);
      expect(info).toBeNull();
    });
  });

  describe('isKnownUnit', () => {
    it('should identify known units', () => {
      expect(isKnownUnit('cup')).toBe(true);
      expect(isKnownUnit('g')).toBe(true);
      expect(isKnownUnit('tsp')).toBe(true);
    });

    it('should identify unknown units', () => {
      expect(isKnownUnit('unknown')).toBe(false);
      expect(isKnownUnit(null)).toBe(false);
    });

    it('should handle aliases', () => {
      expect(isKnownUnit('teaspoon')).toBe(true);
      expect(isKnownUnit('pound')).toBe(true);
    });
  });

  describe('getBaseUnit', () => {
    it('should return base unit for convertible units', () => {
      expect(getBaseUnit('cup')).toBe('ml');
      expect(getBaseUnit('tsp')).toBe('ml');
      expect(getBaseUnit('g')).toBe('g');
      expect(getBaseUnit('oz')).toBe('g');
    });

    it('should return null for non-convertible units', () => {
      expect(getBaseUnit('can')).toBeNull();
      expect(getBaseUnit('pinch')).toBeNull();
    });

    it('should return null for unknown units', () => {
      expect(getBaseUnit('unknown')).toBeNull();
      expect(getBaseUnit(null)).toBeNull();
    });
  });

  describe('isSameSystem', () => {
    it('should identify same measurement system', () => {
      expect(isSameSystem('cup', 'tsp')).toBe(true);
      expect(isSameSystem('g', 'kg')).toBe(true);
      expect(isSameSystem('oz', 'lb')).toBe(true);
    });

    it('should identify different systems', () => {
      expect(isSameSystem('cup', 'g')).toBe(false);
      expect(isSameSystem('ml', 'oz')).toBe(false);
    });

    it('should return false for null units', () => {
      expect(isSameSystem(null, 'cup')).toBe(false);
      expect(isSameSystem('cup', null)).toBe(false);
    });

    it('should return false for unknown units', () => {
      expect(isSameSystem('unknown', 'cup')).toBe(false);
    });
  });
});
