import { ClientStatus, WorkoutLevel } from '@/types';

export type { ClientStatus, WorkoutLevel };

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
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  membershipType?: string;
  startDate?: string;
  rfidTag?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;
  medicalNotes?: string;
  fitnessGoals?: string;
  waiverSigned?: boolean;
  assignedTrainerId?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    workoutSessions: number;
  };
}

export interface ClientFilters {
  status?: ClientStatus | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}
