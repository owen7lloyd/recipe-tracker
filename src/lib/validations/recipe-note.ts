import { z } from 'zod';

// Create recipe note validation schema
export const createRecipeNoteSchema = z.object({
  noteText: z
    .string()
    .min(1, 'Note text is required')
    .max(5000, 'Note must be less than 5000 characters'),
  stepNumber: z
    .number()
    .int('Step number must be a whole number')
    .nonnegative('Step number cannot be negative')
    .optional()
    .nullable(),
  sessionId: z.string().uuid('Invalid session ID').optional().nullable(),
});

// Update recipe note validation schema
export const updateRecipeNoteSchema = z.object({
  noteText: z
    .string()
    .min(1, 'Note text is required')
    .max(5000, 'Note must be less than 5000 characters'),
});

// Query parameters for fetching notes
export const getRecipeNotesQuerySchema = z.object({
  stepNumber: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'Step number must be a non-negative integer',
    }),
  sessionId: z.string().uuid('Invalid session ID').optional(),
  limit: z
    .string()
    .optional()
    .default('50')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});

export type CreateRecipeNoteInput = z.infer<typeof createRecipeNoteSchema>;
export type UpdateRecipeNoteInput = z.infer<typeof updateRecipeNoteSchema>;
export type GetRecipeNotesQuery = z.infer<typeof getRecipeNotesQuerySchema>;
