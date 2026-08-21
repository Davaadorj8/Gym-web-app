import { z } from 'zod';

export const clientFormSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z
      .preprocess(
        (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val ?? undefined),
        z.string().email('Invalid email address').optional().nullable()
      )
      .optional()
      .nullable(),
    phone: z.string().optional().nullable().or(z.literal('')),
    gender: z.string().optional().nullable().default('MALE'),
    dateOfBirth: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    membershipType: z.string().optional().nullable().default('STANDARD'),
    startDate: z.string().optional().nullable(),
    rfidTag: z.string().optional().nullable(),
    emergencyContact: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    emergencyRelation: z.string().optional().nullable(),
    medicalNotes: z.string().optional().nullable(),
    fitnessGoals: z.string().optional().nullable(),
    fitnessGoal: z.string().optional().nullable(),
    fitnessLevel: z.string().optional().nullable(),
    waiverSigned: z.boolean().optional().default(true),
    assignedTrainerId: z.string().optional().nullable(),
    trainerId: z.string().optional().nullable(),
    photoUrl: z.string().optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
  })
  .passthrough();

export const clientSchema = clientFormSchema;

export type ClientFormData = z.infer<typeof clientFormSchema>;

export const clientFilterSchema = z
  .object({
    status: z.string().optional().nullable(),
    search: z.string().optional().nullable(),
    page: z.number().int().positive().optional().nullable(),
    limit: z.number().int().positive().optional().nullable(),
  })
  .passthrough();

