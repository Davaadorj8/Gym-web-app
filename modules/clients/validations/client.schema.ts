import { z } from 'zod';

export const clientFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(6, 'Valid phone number is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
  dateOfBirth: z.string().optional(),
  membershipType: z.string().default('STANDARD'),
  startDate: z.string().optional(),
  rfidTag: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  medicalNotes: z.string().optional(),
  fitnessGoals: z.string().optional(),
  waiverSigned: z.boolean().default(true),
  assignedTrainerId: z.string().optional(),
});

export const clientSchema = clientFormSchema;

export type ClientFormData = z.infer<typeof clientFormSchema>;

export const clientFilterSchema = z.object({
  status: z.enum(['ALL', 'ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});
