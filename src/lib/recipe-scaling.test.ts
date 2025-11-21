import { describe, it, expect } from 'vitest'
import {
  formatQuantity,
  scaleRecipe,
  isRecipeScaled,
  getScalingDescription,
  type ScaledRecipe,
} from './recipe-scaling'

describe('Recipe Scaling', () => {
  describe('formatQuantity', () => {
    it('should format common fractions', () => {
      expect(formatQuantity(0.25)).toBe('¼')
      expect(formatQuantity(0.5)).toBe('½')
      expect(formatQuantity(0.75)).toBe('¾')
      expect(formatQuantity(0.333)).toBe('⅓')
      expect(formatQuantity(0.666)).toBe('⅔')
    })

    it('should handle mixed numbers', () => {
      expect(formatQuantity(1.5)).toBe('1 ½')
      expect(formatQuantity(2.25)).toBe('2 ¼')
      expect(formatQuantity(3.75)).toBe('3 ¾')
      expect(formatQuantity(1.333)).toBe('1 ⅓')
    })

    it('should handle whole numbers', () => {
      expect(formatQuantity(0)).toBe('0')
      expect(formatQuantity(1)).toBe('1')
      expect(formatQuantity(3)).toBe('3')
      expect(formatQuantity(10)).toBe('10')
    })

    it('should handle uncommon fractions as decimals', () => {
      // 1.67 is close enough to 2/3 (0.667) that it gets formatted as a fraction
      // Use a value that won't match any common fraction
      const result = formatQuantity(1.42)
      expect(result).toMatch(/1\.4[12]/)
    })

    it('should handle small fractions', () => {
      expect(formatQuantity(0.125)).toBe('⅛')
      expect(formatQuantity(0.375)).toBe('⅜')
      expect(formatQuantity(0.625)).toBe('⅝')
      expect(formatQuantity(0.875)).toBe('⅞')
    })
  })

  describe('scaleRecipe', () => {
    const mockRecipe = {
      id: 'recipe-1',
      householdId: 'household-1',
      title: 'Test Recipe',
      category: 'dinner',
      servings: 4,
      rating: 5,
      instructions: ['Step 1', 'Step 2'],
      ingredients: [
        {
          id: 'ing-1',
          ingredientId: 'flour-1',
          ingredientName: 'Flour',
          ingredientCategory: 'baking',
          quantity: '2',
          unit: 'cups',
          notes: null,
          optional: false,
        },
        {
          id: 'ing-2',
          ingredientId: 'sugar-1',
          ingredientName: 'Sugar',
          ingredientCategory: 'baking',
          quantity: '1',
          unit: 'cup',
          notes: null,
          optional: false,
        },
        {
          id: 'ing-3',
          ingredientId: 'salt-1',
          ingredientName: 'Salt',
          ingredientCategory: 'spices',
          quantity: '1',
          unit: 'tsp',
          notes: 'to taste',
          optional: true,
        },
      ],
      createdBy: 'user-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    it('should scale recipe quantities correctly when doubling', () => {
      const scaled = scaleRecipe(mockRecipe, 8)

      expect(scaled.currentServings).toBe(8)
      expect(scaled.scaleFactor).toBe(2)
      expect(scaled.ingredients[0].displayQuantity).toBe('4')
      expect(scaled.ingredients[0].scaledQuantity).toBe(4)
      expect(scaled.ingredients[1].displayQuantity).toBe('2')
      expect(scaled.ingredients[1].scaledQuantity).toBe(2)
    })

    it('should scale recipe quantities correctly when halving', () => {
      const scaled = scaleRecipe(mockRecipe, 2)

      expect(scaled.currentServings).toBe(2)
      expect(scaled.scaleFactor).toBe(0.5)
      expect(scaled.ingredients[0].displayQuantity).toBe('1')
      expect(scaled.ingredients[0].scaledQuantity).toBe(1)
      expect(scaled.ingredients[1].displayQuantity).toBe('½')
      expect(scaled.ingredients[1].scaledQuantity).toBe(0.5)
    })

    it('should preserve non-numeric quantities', () => {
      const scaled = scaleRecipe(mockRecipe, 8)

      // Salt has "to taste" in notes, should not be scaled
      const saltIngredient = scaled.ingredients[2]
      expect(saltIngredient.displayQuantity).toBe('1')
      expect(saltIngredient.scaledQuantity).toBe(null)
    })

    it('should handle decimal servings', () => {
      const scaled = scaleRecipe(mockRecipe, 6)

      expect(scaled.currentServings).toBe(6)
      expect(scaled.scaleFactor).toBe(1.5)
      expect(scaled.ingredients[0].displayQuantity).toBe('3')
      expect(scaled.ingredients[0].scaledQuantity).toBe(3)
      expect(scaled.ingredients[1].displayQuantity).toBe('1 ½')
      expect(scaled.ingredients[1].scaledQuantity).toBe(1.5)
    })

    it('should preserve original recipe data', () => {
      const scaled = scaleRecipe(mockRecipe, 8)

      expect(scaled.id).toBe(mockRecipe.id)
      expect(scaled.title).toBe(mockRecipe.title)
      expect(scaled.category).toBe(mockRecipe.category)
      expect(scaled.servings).toBe(mockRecipe.servings)
      expect(scaled.instructions).toEqual(mockRecipe.instructions)
    })

    it('should store original quantities', () => {
      const scaled = scaleRecipe(mockRecipe, 8)

      expect(scaled.ingredients[0].originalQuantity).toBe('2')
      expect(scaled.ingredients[1].originalQuantity).toBe('1')
    })

    it('should handle recipe with no quantity', () => {
      const recipeWithNoQty = {
        ...mockRecipe,
        ingredients: [
          {
            id: 'ing-1',
            ingredientId: 'garnish-1',
            ingredientName: 'Parsley',
            ingredientCategory: 'herbs',
            quantity: null,
            unit: null,
            notes: 'for garnish',
            optional: true,
          },
        ],
      }

      const scaled = scaleRecipe(recipeWithNoQty, 8)

      expect(scaled.ingredients[0].displayQuantity).toBe(null)
      expect(scaled.ingredients[0].scaledQuantity).toBe(null)
    })

    it('should handle recipe with non-numeric quantity string', () => {
      const recipeWithTextQty = {
        ...mockRecipe,
        ingredients: [
          {
            id: 'ing-1',
            ingredientId: 'salt-1',
            ingredientName: 'Salt',
            ingredientCategory: 'spices',
            quantity: 'pinch',
            unit: null,
            notes: null,
            optional: false,
          },
        ],
      }

      const scaled = scaleRecipe(recipeWithTextQty, 8)

      expect(scaled.ingredients[0].displayQuantity).toBe('pinch')
      expect(scaled.ingredients[0].scaledQuantity).toBe(null)
    })
  })

  describe('isRecipeScaled', () => {
    it('should return true when servings differ', () => {
      const recipe = {
        servings: 4,
        currentServings: 8,
      }

      expect(isRecipeScaled(recipe)).toBe(true)
    })

    it('should return false when servings are the same', () => {
      const recipe = {
        servings: 4,
        currentServings: 4,
      }

      expect(isRecipeScaled(recipe)).toBe(false)
    })

    it('should return false when currentServings is undefined', () => {
      const recipe = {
        servings: 4,
      }

      expect(isRecipeScaled(recipe)).toBe(false)
    })
  })

  describe('getScalingDescription', () => {
    it('should describe doubling correctly', () => {
      const description = getScalingDescription(4, 8)
      expect(description).toBe('Scaled from 4 to 8 servings (2x)')
    })

    it('should describe halving correctly', () => {
      const description = getScalingDescription(8, 4)
      expect(description).toBe('Scaled from 8 to 4 servings (0.5x)')
    })

    it('should describe tripling correctly', () => {
      const description = getScalingDescription(2, 6)
      expect(description).toBe('Scaled from 2 to 6 servings (3x)')
    })

    it('should describe 1.5x scaling correctly', () => {
      const description = getScalingDescription(4, 6)
      expect(description).toBe('Scaled from 4 to 6 servings (1.5x)')
    })
  })
})
