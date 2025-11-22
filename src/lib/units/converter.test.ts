import { describe, it, expect } from 'vitest';
import {
  getUnitType,
  canConvert,
  unitsMatch,
  convertToBaseUnit,
  convertFromBaseUnit,
  convertBetweenUnits,
  getConversionError,
  roundForDisplay,
} from './converter';

describe('Unit Converter', () => {
  describe('getUnitType', () => {
    it('should identify volume units', () => {
      expect(getUnitType('tsp')).toBe('volume');
      expect(getUnitType('tbsp')).toBe('volume');
      expect(getUnitType('cup')).toBe('volume');
      expect(getUnitType('ml')).toBe('volume');
      expect(getUnitType('liter')).toBe('volume');
      expect(getUnitType('fl oz')).toBe('volume');
      expect(getUnitType('gallon')).toBe('volume');
    });

    it('should identify weight units', () => {
      expect(getUnitType('oz')).toBe('weight');
      expect(getUnitType('lb')).toBe('weight');
      expect(getUnitType('g')).toBe('weight');
      expect(getUnitType('kg')).toBe('weight');
    });

    it('should identify count units', () => {
      expect(getUnitType('whole')).toBe('count');
      expect(getUnitType('piece')).toBe('count');
      expect(getUnitType('slice')).toBe('count');
      expect(getUnitType('clove')).toBe('count');
      expect(getUnitType('dozen')).toBe('count');
    });

    it('should identify packaging units', () => {
      expect(getUnitType('can')).toBe('packaging');
      expect(getUnitType('jar')).toBe('packaging');
      expect(getUnitType('bottle')).toBe('packaging');
      expect(getUnitType('bag')).toBe('packaging');
    });

    it('should identify special units', () => {
      expect(getUnitType('pinch')).toBe('special');
      expect(getUnitType('dash')).toBe('special');
      expect(getUnitType('drop')).toBe('special');
    });

    it('should handle case insensitivity', () => {
      expect(getUnitType('CUP')).toBe('volume');
      expect(getUnitType('Cup')).toBe('volume');
      expect(getUnitType('LB')).toBe('weight');
    });

    it('should handle extra whitespace', () => {
      expect(getUnitType(' cup ')).toBe('volume');
      expect(getUnitType('  g  ')).toBe('weight');
    });
  });

  describe('canConvert', () => {
    it('should allow conversion between volume units', () => {
      expect(canConvert('cup', 'ml')).toBe(true);
      expect(canConvert('tsp', 'tbsp')).toBe(true);
      expect(canConvert('liter', 'gallon')).toBe(true);
    });

    it('should allow conversion between weight units', () => {
      expect(canConvert('lb', 'oz')).toBe(true);
      expect(canConvert('g', 'kg')).toBe(true);
      expect(canConvert('lb', 'g')).toBe(true);
    });

    it('should not allow conversion between different types', () => {
      expect(canConvert('cup', 'g')).toBe(false);
      expect(canConvert('lb', 'ml')).toBe(false);
      expect(canConvert('piece', 'cup')).toBe(false);
    });

    it('should not allow conversion between count units', () => {
      expect(canConvert('piece', 'slice')).toBe(false);
      expect(canConvert('whole', 'clove')).toBe(false);
    });

    it('should not allow conversion between packaging units', () => {
      expect(canConvert('can', 'jar')).toBe(false);
    });

    it('should handle null/empty units', () => {
      expect(canConvert('', 'cup')).toBe(false);
      expect(canConvert('cup', '')).toBe(false);
    });
  });

  describe('unitsMatch', () => {
    it('should match identical units', () => {
      expect(unitsMatch('cup', 'cup')).toBe(true);
      expect(unitsMatch('lb', 'lb')).toBe(true);
    });

    it('should match case-insensitively', () => {
      expect(unitsMatch('cup', 'CUP')).toBe(true);
      expect(unitsMatch('Cup', 'cup')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(unitsMatch(' cup ', 'cup')).toBe(true);
      expect(unitsMatch('cup', ' cup')).toBe(true);
    });

    it('should not match different units', () => {
      expect(unitsMatch('cup', 'tbsp')).toBe(false);
      expect(unitsMatch('lb', 'oz')).toBe(false);
    });

    it('should handle null values', () => {
      expect(unitsMatch(null, null)).toBe(true);
      expect(unitsMatch('cup', null)).toBe(false);
      expect(unitsMatch(null, 'cup')).toBe(false);
    });
  });

  describe('convertToBaseUnit', () => {
    describe('volume conversions', () => {
      it('should convert teaspoons to ml', () => {
        const result = convertToBaseUnit(1, 'tsp');
        expect(result?.baseUnit).toBe('ml');
        expect(result?.value).toBeCloseTo(4.92892, 4);
        expect(result?.convertible).toBe(true);
      });

      it('should convert tablespoons to ml', () => {
        const result = convertToBaseUnit(1, 'tbsp');
        expect(result?.baseUnit).toBe('ml');
        expect(result?.value).toBeCloseTo(14.7868, 4);
      });

      it('should convert cups to ml', () => {
        const result = convertToBaseUnit(1, 'cup');
        expect(result?.baseUnit).toBe('ml');
        expect(result?.value).toBeCloseTo(236.588, 2);
      });

      it('should convert liters to ml', () => {
        const result = convertToBaseUnit(1, 'liter');
        expect(result?.baseUnit).toBe('ml');
        expect(result?.value).toBe(1000);
      });

      it('should keep ml as is', () => {
        const result = convertToBaseUnit(100, 'ml');
        expect(result?.baseUnit).toBe('ml');
        expect(result?.value).toBe(100);
      });
    });

    describe('weight conversions', () => {
      it('should convert pounds to grams', () => {
        const result = convertToBaseUnit(1, 'lb');
        expect(result?.baseUnit).toBe('g');
        expect(result?.value).toBeCloseTo(453.592, 2);
      });

      it('should convert ounces to grams', () => {
        const result = convertToBaseUnit(1, 'oz');
        expect(result?.baseUnit).toBe('g');
        expect(result?.value).toBeCloseTo(28.3495, 3);
      });

      it('should convert kilograms to grams', () => {
        const result = convertToBaseUnit(1, 'kg');
        expect(result?.baseUnit).toBe('g');
        expect(result?.value).toBe(1000);
      });

      it('should keep grams as is', () => {
        const result = convertToBaseUnit(500, 'g');
        expect(result?.baseUnit).toBe('g');
        expect(result?.value).toBe(500);
      });
    });

    describe('non-convertible units', () => {
      it('should mark count units as not convertible', () => {
        const result = convertToBaseUnit(3, 'piece');
        expect(result?.baseUnit).toBe('count');
        expect(result?.value).toBe(3);
        expect(result?.convertible).toBe(false);
      });

      it('should mark packaging units as not convertible', () => {
        const result = convertToBaseUnit(2, 'can');
        expect(result?.baseUnit).toBe('count');
        expect(result?.convertible).toBe(false);
      });
    });

    it('should return null for empty unit', () => {
      expect(convertToBaseUnit(1, '')).toBeNull();
    });
  });

  describe('convertFromBaseUnit', () => {
    it('should convert ml to cups', () => {
      const result = convertFromBaseUnit(236.588, 'ml', 'cup');
      expect(result).toBeCloseTo(1, 4);
    });

    it('should convert g to lb', () => {
      const result = convertFromBaseUnit(453.592, 'g', 'lb');
      expect(result).toBeCloseTo(1, 4);
    });

    it('should return null for incompatible conversions', () => {
      expect(convertFromBaseUnit(100, 'ml', 'g')).toBeNull();
      expect(convertFromBaseUnit(100, 'g', 'cup')).toBeNull();
    });
  });

  describe('convertBetweenUnits', () => {
    describe('volume conversions', () => {
      it('should convert cups to tablespoons', () => {
        const result = convertBetweenUnits(1, 'cup', 'tbsp');
        expect(result).toBeCloseTo(16, 0); // 1 cup = ~16 tbsp
      });

      it('should convert tablespoons to teaspoons', () => {
        const result = convertBetweenUnits(1, 'tbsp', 'tsp');
        expect(result).toBeCloseTo(3, 0); // 1 tbsp = 3 tsp
      });

      it('should convert liters to cups', () => {
        const result = convertBetweenUnits(1, 'liter', 'cup');
        expect(result).toBeCloseTo(4.22675, 2); // 1 liter ≈ 4.23 cups
      });

      it('should convert ml to cups', () => {
        const result = convertBetweenUnits(236.588, 'ml', 'cup');
        expect(result).toBeCloseTo(1, 4);
      });
    });

    describe('weight conversions', () => {
      it('should convert pounds to ounces', () => {
        const result = convertBetweenUnits(1, 'lb', 'oz');
        expect(result).toBeCloseTo(16, 0); // 1 lb = 16 oz
      });

      it('should convert kilograms to grams', () => {
        const result = convertBetweenUnits(1, 'kg', 'g');
        expect(result).toBe(1000);
      });

      it('should convert grams to ounces', () => {
        const result = convertBetweenUnits(28.3495, 'g', 'oz');
        expect(result).toBeCloseTo(1, 4);
      });

      it('should convert pounds to grams', () => {
        const result = convertBetweenUnits(1, 'lb', 'g');
        expect(result).toBeCloseTo(453.592, 2);
      });
    });

    describe('same unit conversions', () => {
      it('should return same value for identical units', () => {
        expect(convertBetweenUnits(2.5, 'cup', 'cup')).toBe(2.5);
        expect(convertBetweenUnits(100, 'g', 'g')).toBe(100);
      });

      it('should handle case differences', () => {
        expect(convertBetweenUnits(2.5, 'CUP', 'cup')).toBe(2.5);
      });
    });

    describe('invalid conversions', () => {
      it('should return null for volume to weight', () => {
        expect(convertBetweenUnits(1, 'cup', 'g')).toBeNull();
        expect(convertBetweenUnits(1, 'ml', 'lb')).toBeNull();
      });

      it('should return null for count to volume/weight', () => {
        expect(convertBetweenUnits(1, 'piece', 'cup')).toBeNull();
        expect(convertBetweenUnits(1, 'whole', 'g')).toBeNull();
      });

      it('should return null for empty units', () => {
        expect(convertBetweenUnits(1, '', 'cup')).toBeNull();
        expect(convertBetweenUnits(1, 'cup', '')).toBeNull();
      });
    });

    describe('real-world scenarios from bug report', () => {
      it('should correctly convert recipe cups to pantry pounds for flour', () => {
        // Bug scenario: pantry has 2 lb flour, recipe needs 1.5 cups
        // We can convert 1.5 cups to lb for comparison purposes
        // Note: This is volume-to-volume, not volume-to-weight
        // The system cannot convert cups to pounds (different types)
        expect(convertBetweenUnits(1.5, 'cup', 'lb')).toBeNull();
      });

      it('should convert between compatible metric/imperial volume', () => {
        // 500 ml to cups
        const cups = convertBetweenUnits(500, 'ml', 'cup');
        expect(cups).toBeCloseTo(2.11, 1);
      });

      it('should convert between compatible metric/imperial weight', () => {
        // 1 lb to g
        const grams = convertBetweenUnits(1, 'lb', 'g');
        expect(grams).toBeCloseTo(453.592, 2);

        // 500g to oz
        const oz = convertBetweenUnits(500, 'g', 'oz');
        expect(oz).toBeCloseTo(17.64, 1);
      });
    });
  });

  describe('getConversionError', () => {
    it('should explain volume to weight incompatibility', () => {
      const error = getConversionError('cup', 'g');
      expect(error).toContain('volume');
      expect(error).toContain('weight');
    });

    it('should explain count unit limitations', () => {
      const error = getConversionError('piece', 'slice');
      expect(error).toContain('count');
    });

    it('should handle missing units', () => {
      expect(getConversionError(null, 'cup')).toContain('Missing');
      expect(getConversionError('cup', null)).toContain('Missing');
    });
  });

  describe('roundForDisplay', () => {
    it('should round to specified precision', () => {
      expect(roundForDisplay(1.23456, 2)).toBe(1.23);
      expect(roundForDisplay(1.23456, 3)).toBe(1.235);
      expect(roundForDisplay(1.23456, 0)).toBe(1);
    });

    it('should default to 2 decimal places', () => {
      expect(roundForDisplay(1.23456)).toBe(1.23);
    });

    it('should handle exact values', () => {
      expect(roundForDisplay(1.5, 2)).toBe(1.5);
      expect(roundForDisplay(2, 2)).toBe(2);
    });
  });
});
