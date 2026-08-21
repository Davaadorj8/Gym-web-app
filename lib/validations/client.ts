import { z } from 'zod';

export const clientFormSchema = z.object({
  // Core Essentials
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
  dateOfBirth: z.string().optional(),
  membershipType: z.enum(['STANDARD', 'PREMIUM', 'VIP', 'DAY_PASS']).default('STANDARD'),
  startDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  rfidTag: z.string().optional(),

  // Extended Details (Progressive)
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  medicalNotes: z.string().optional(),
  fitnessGoals: z.string().optional(),
  waiverSigned: z.boolean().default(true),
  assignedTrainerId: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// Backwards compatibility aliases
export const clientSchema = clientFormSchema;
export type ClientInput = ClientFormData;
