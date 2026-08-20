import { z } from 'zod';

export const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED']).default('ACTIVE'),
  fitnessGoal: z.string().max(200, 'Goal description too long').optional().nullable(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']).default('BEGINNER'),
  notes: z.string().max(1000, 'Notes too long').optional().nullable(),
});

export type ClientInput = z.infer<typeof clientSchema>;
