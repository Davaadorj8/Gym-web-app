import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  targetMuscle: z.string().min(1, 'Target muscle is required'),
  sets: z.number().int().min(1).max(20).default(3),
  reps: z.number().int().min(1).max(100).default(10),
  restSeconds: z.number().int().min(0).max(600).default(60),
  orderIndex: z.number().int().default(0),
  notes: z.string().optional().nullable(),
});

export const workoutPlanSchema = z.object({
  title: z.string().min(2, 'Plan title must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']).default('INTERMEDIATE'),
  category: z.string().min(1, 'Category is required'),
  durationWeeks: z.number().int().min(1).max(52).default(4),
  isPublished: z.boolean().default(false),
  exercises: z.array(exerciseSchema).optional().default([]),
});

export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
