import { z } from 'zod';

export const updateHouseholdSchema = z.object({
  name: z.string().min(1, 'Household name is required').max(100),
});

export const joinHouseholdSchema = z.object({
  code: z
    .string()
    .length(8, 'Invite code must be 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Invalid invite code format'),
});

export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>;
export type JoinHouseholdInput = z.infer<typeof joinHouseholdSchema>;
