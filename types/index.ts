export type Role = 'ADMIN' | 'STAFF' | 'SUPER_ADMIN' | 'TRAINER' | 'CLIENT';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';
export type WorkoutLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  trainerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: ClientStatus;
  fitnessGoal?: string | null;
  fitnessLevel: WorkoutLevel;
  joinedDate: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    workoutSessions: number;
  };
}

export interface Exercise {
  id: string;
  planId: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: number;
  restSeconds: number;
  orderIndex: number;
  notes?: string | null;
}

export interface WorkoutPlan {
  id: string;
  trainerId: string;
  title: string;
  description?: string | null;
  level: WorkoutLevel;
  category: string;
  durationWeeks: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  exercises?: Exercise[];
  _count?: {
    exercises: number;
    sessions: number;
  };
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  planId?: string | null;
  title: string;
  completedAt: string;
  durationMin: number;
  caloriesBurned?: number | null;
  performanceRating?: number | null;
  feedbackNotes?: string | null;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  totalPlans: number;
  completedSessionsWeek: number;
  avgRetentionRate: number;
  revenueMtd?: number;
}
