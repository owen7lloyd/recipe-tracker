import { z } from 'zod';

/**
 * Validation schemas for pantry operations
 * Note: quantity is stored as decimal in DB (string type), but we accept numbers
 * and convert to strings in the API handlers
 */

// Schema for adding a single pantry item
export const addPantryItemSchema = z.object({
  ingredientId: z.string().uuid('Invalid ingredient ID'),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .transform((val) => val.toString())
    .optional(),
  unit: z.string().min(1).max(50).optional(),
  purchaseDate: z.coerce.date().optional(),
});

// Schema for updating a pantry item
export const updatePantryItemSchema = z.object({
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .transform((val) => val.toString())
    .optional(),
  unit: z.string().min(1).max(50).optional(),
  purchaseDate: z.coerce.date().optional(),
});

// Schema for bulk operations
export const bulkUpdateSchema = z.object({
  add: z
    .array(
      z.object({
        ingredientId: z.string().uuid('Invalid ingredient ID'),
        quantity: z
          .number()
          .positive()
          .transform((val) => val.toString())
          .optional(),
        unit: z.string().min(1).max(50).optional(),
        purchaseDate: z.coerce.date().optional(),
      })
    )
    .optional(),
  update: z
    .array(
      z.object({
        id: z.string().uuid('Invalid pantry item ID'),
        quantity: z
          .number()
          .positive()
          .transform((val) => val.toString())
          .optional(),
        unit: z.string().min(1).max(50).optional(),
        purchaseDate: z.coerce.date().optional(),
      })
    )
    .optional(),
  delete: z.array(z.string().uuid('Invalid pantry item ID')).optional(),
});

// Type exports
export type AddPantryItem = z.infer<typeof addPantryItemSchema>;
export type UpdatePantryItem = z.infer<typeof updatePantryItemSchema>;
export type BulkUpdate = z.infer<typeof bulkUpdateSchema>;
