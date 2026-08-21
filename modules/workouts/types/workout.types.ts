import { Exercise, WorkoutPlan, WorkoutSession, WorkoutLevel } from '@/types';

export type { Exercise, WorkoutPlan, WorkoutSession, WorkoutLevel };

export interface WorkoutFilterParams {
  level?: WorkoutLevel | 'ALL';
  category?: string;
  search?: string;
}
