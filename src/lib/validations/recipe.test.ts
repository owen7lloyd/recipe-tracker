import { describe, it, expect } from 'vitest'
import {
  recipeIngredientSchema,
  createRecipeSchema,
  updateRecipeSchema,
} from './recipe'

describe('Recipe Validation Schemas', () => {
  describe('recipeIngredientSchema', () => {
    it('should validate valid recipe ingredient', () => {
      const validIngredient = {
        ingredientId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
        unit: 'cups',
        notes: 'diced',
        optional: false,
      }

      const result = recipeIngredientSchema.parse(validIngredient)
      expect(result).toEqual(validIngredient)
    })

    it('should accept optional fields', () => {
      const minimalIngredient = {
        ingredientId: '550e8400-e29b-41d4-a716-446655440000',
      }

      const result = recipeIngredientSchema.parse(minimalIngredient)
      expect(result.ingredientId).toBe(minimalIngredient.ingredientId)
      expect(result.optional).toBe(false) // default value
    })

    it('should reject invalid UUID', () => {
      const invalidIngredient = {
        ingredientId: 'not-a-uuid',
        quantity: 2,
      }

      expect(() => recipeIngredientSchema.parse(invalidIngredient)).toThrow(
        'Invalid ingredient ID'
      )
    })

    it('should reject negative quantity', () => {
      const negativeQty = {
        ingredientId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: -1,
      }

      expect(() => recipeIngredientSchema.parse(negativeQty)).toThrow(
        'Quantity must be positive'
      )
    })

    it('should allow null for quantity, unit, and notes', () => {
      const ingredientWithNulls = {
        ingredientId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: null,
        unit: null,
        notes: null,
        optional: true,
      }

      const result = recipeIngredientSchema.parse(ingredientWithNulls)
      expect(result.quantity).toBe(null)
      expect(result.unit).toBe(null)
      expect(result.notes).toBe(null)
    })
  })

  describe('createRecipeSchema', () => {
    it('should validate valid recipe', () => {
      const validRecipe = {
        title: 'Chocolate Chip Cookies',
        description: 'Classic cookies',
        category: 'dessert' as const,
        servings: 24,
        prepTimeMinutes: 15,
        cookTimeMinutes: 12,
        rating: 5,
        tags: ['baking', 'cookies'],
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
            quantity: 2,
            unit: 'cups',
          },
        ],
        instructions: ['Mix ingredients', 'Bake at 350°F for 12 minutes'],
      }

      const result = createRecipeSchema.parse(validRecipe)
      expect(result.title).toBe(validRecipe.title)
      expect(result.category).toBe(validRecipe.category)
    })

    it('should reject empty title', () => {
      const recipeWithEmptyTitle = {
        title: '',
        category: 'dinner' as const,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(recipeWithEmptyTitle)).toThrow(
        'Title is required'
      )
    })

    it('should reject title over 255 characters', () => {
      const longTitle = 'a'.repeat(256)
      const recipeWithLongTitle = {
        title: longTitle,
        category: 'dinner' as const,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(recipeWithLongTitle)).toThrow(
        'Title must be less than 255 characters'
      )
    })

    it('should reject invalid category', () => {
      const invalidCategory = {
        title: 'Test Recipe',
        category: 'invalid',
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(invalidCategory)).toThrow()
    })

    it('should reject recipe with no ingredients', () => {
      const noIngredients = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        ingredients: [],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(noIngredients)).toThrow(
        'At least one ingredient is required'
      )
    })

    it('should reject recipe with no instructions', () => {
      const noInstructions = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: [],
      }

      expect(() => createRecipeSchema.parse(noInstructions)).toThrow(
        'At least one instruction step is required'
      )
    })

    it('should validate rating range', () => {
      const invalidRatingHigh = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        rating: 6,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(invalidRatingHigh)).toThrow(
        'Rating must be between 1 and 5'
      )

      const invalidRatingLow = {
        ...invalidRatingHigh,
        rating: 0,
      }

      expect(() => createRecipeSchema.parse(invalidRatingLow)).toThrow(
        'Rating must be between 1 and 5'
      )
    })

    it('should reject negative prep or cook times', () => {
      const negativePrepTime = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        prepTimeMinutes: -5,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(negativePrepTime)).toThrow(
        'Prep time cannot be negative'
      )
    })

    it('should reject negative servings', () => {
      const negativeServings = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        servings: 0,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      expect(() => createRecipeSchema.parse(negativeServings)).toThrow(
        'Servings must be at least 1'
      )
    })

    it('should apply default values', () => {
      const minimalRecipe = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      const result = createRecipeSchema.parse(minimalRecipe)
      expect(result.servings).toBe(4) // default value
      expect(result.tags).toEqual([]) // default value
    })

    it('should allow empty string for URLs', () => {
      const recipeWithEmptyUrls = {
        title: 'Test Recipe',
        category: 'dinner' as const,
        imageUrl: '',
        sourceUrl: '',
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
        instructions: ['Step 1'],
      }

      const result = createRecipeSchema.parse(recipeWithEmptyUrls)
      expect(result.imageUrl).toBe('')
      expect(result.sourceUrl).toBe('')
    })
  })

  describe('updateRecipeSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        title: 'Updated Title',
      }

      const result = updateRecipeSchema.parse(partialUpdate)
      expect(result.title).toBe('Updated Title')
    })

    it('should allow updating only description', () => {
      const descriptionUpdate = {
        description: 'New description',
      }

      const result = updateRecipeSchema.parse(descriptionUpdate)
      expect(result.description).toBe('New description')
    })

    it('should reject empty ingredients array when provided', () => {
      const emptyIngredients = {
        ingredients: [],
      }

      expect(() => updateRecipeSchema.parse(emptyIngredients)).toThrow()
    })

    it('should reject empty instructions array when provided', () => {
      const emptyInstructions = {
        instructions: [],
      }

      expect(() => updateRecipeSchema.parse(emptyInstructions)).toThrow()
    })

    it('should allow updating ingredients with valid array', () => {
      const validUpdate = {
        ingredients: [
          {
            ingredientId: '550e8400-e29b-41d4-a716-446655440000',
            quantity: 3,
          },
        ],
      }

      const result = updateRecipeSchema.parse(validUpdate)
      expect(result.ingredients).toHaveLength(1)
      expect(result.ingredients![0].quantity).toBe(3)
    })
  })
})
