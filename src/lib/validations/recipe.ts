import { z } from 'zod';

// Recipe ingredient validation schema
export const recipeIngredientSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  ingredientName: z.string().optional(),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .optional()
    .nullable(),
  unit: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  optional: z.boolean().default(false),
});

// Create recipe validation schema
export const createRecipeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional().nullable(),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  sourceUrl: z
    .string()
    .url('Invalid source URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  category: z.enum(
    ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage']
  ),
  tags: z.array(z.string()).default([]),
  prepTimeMinutes: z
    .number()
    .int('Prep time must be a whole number')
    .nonnegative('Prep time cannot be negative')
    .optional()
    .nullable(),
  cookTimeMinutes: z
    .number()
    .int('Cook time must be a whole number')
    .nonnegative('Cook time cannot be negative')
    .optional()
    .nullable(),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .positive('Servings must be at least 1')
    .default(4),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional()
    .nullable(),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, 'At least one ingredient is required'),
  instructions: z
    .array(z.string().min(1, 'Instruction cannot be empty'))
    .min(1, 'At least one instruction step is required'),
});

// Update recipe validation schema (allows partial updates)
export const updateRecipeSchema = createRecipeSchema.partial().refine(
  (data) => {
    // If ingredients are provided, ensure at least one
    if (data.ingredients !== undefined && data.ingredients.length === 0) {
      return false;
    }
    // If instructions are provided, ensure at least one
    if (data.instructions !== undefined && data.instructions.length === 0) {
      return false;
    }
    return true;
  },
  {
    message:
      'If updating ingredients or instructions, at least one must be provided',
  }
);

// Export types
export type RecipeIngredientInput = z.infer<typeof recipeIngredientSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
