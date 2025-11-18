import { z } from 'zod';

/**
 * Validation schemas for pantry operations
 */

// Schema for adding a single pantry item
export const addPantryItemSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unit: z.string().min(1).max(50).optional(),
});

// Schema for updating a pantry item
export const updatePantryItemSchema = z.object({
  quantity: z.number().positive('Quantity must be positive').optional(),
  unit: z.string().min(1).max(50).optional(),
});

// Schema for bulk operations
export const bulkUpdateSchema = z.object({
  add: z
    .array(
      z.object({
        ingredientId: z.string().uuid('Invalid ingredient ID'),
        quantity: z.number().positive().optional(),
        unit: z.string().min(1).max(50).optional(),
      })
    )
    .optional(),
  update: z
    .array(
      z.object({
        id: z.string().uuid('Invalid pantry item ID'),
        quantity: z.number().positive().optional(),
        unit: z.string().min(1).max(50).optional(),
      })
    )
    .optional(),
  delete: z.array(z.string().uuid('Invalid pantry item ID')).optional(),
});

// Type exports
export type AddPantryItem = z.infer<typeof addPantryItemSchema>;
export type UpdatePantryItem = z.infer<typeof updatePantryItemSchema>;
export type BulkUpdate = z.infer<typeof bulkUpdateSchema>;
