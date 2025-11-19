import { z } from 'zod';

export const groceryListGenerationSchema = z.object({
  recipeIds: z.array(z.string().uuid()).min(1, 'Select at least one recipe'),
  servings: z.record(z.string(), z.number().positive()).optional(),
  name: z.string().max(255).optional(),
});

export const groceryListCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  items: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        quantity: z.number().positive(),
        unit: z.string(),
        category: z.enum([
          'produce',
          'dairy',
          'meat',
          'seafood',
          'pantry',
          'frozen',
          'bakery',
          'other',
        ]),
      })
    )
    .optional(),
});

export const groceryListUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const groceryListItemSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string(),
  store: z.string().optional(),
  category: z
    .enum([
      'produce',
      'dairy',
      'meat',
      'seafood',
      'pantry',
      'frozen',
      'bakery',
      'other',
    ])
    .optional(),
});

export const groceryListItemUpdateSchema = z.object({
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  store: z.string().optional(),
  checked: z.boolean().optional(),
});

export type GroceryListGenerationInput = z.infer<
  typeof groceryListGenerationSchema
>;
export type GroceryListCreateInput = z.infer<typeof groceryListCreateSchema>;
export type GroceryListUpdateInput = z.infer<typeof groceryListUpdateSchema>;
export type GroceryListItemInput = z.infer<typeof groceryListItemSchema>;
export type GroceryListItemUpdateInput = z.infer<
  typeof groceryListItemUpdateSchema
>;
