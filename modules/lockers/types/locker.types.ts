import { LockerItem as GymLocker, LockerStatus as GymLockerStatus, LockerUsageRecord as GymLockerLog } from '@/features/gym/gymSlice';

export type LockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OVERDUE';
export type LockerSize = 'STANDARD' | 'MEDIUM' | 'LARGE' | 'VIP';
export type LockerGender = 'MALE' | 'FEMALE' | 'UNISEX';

export interface LockerLog {
  id: string;
  lockerNumber: number;
  memberName: string;
  eventDescription: string;
  timestamp: string;
  staffLogged: string;
}

export type { GymLocker, GymLockerStatus, GymLockerLog };

export interface Locker {
  id: string;
  number: number;
  size?: LockerSize;
  zone: 'MEN' | 'WOMEN' | 'VIP' | 'STAFF' | 'MAIN';
  gender: LockerGender;
  status: LockerStatus;
  assignedMemberName?: string;
  assignedMemberId?: string;
  assignedRegId?: string;
  assignedAt?: string;
  expiresAt?: string;
  notes?: string;
  pinCode?: string;
  isOverdue?: boolean;
}

export type LockerZoneFilter = 'ALL' | 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'VIP';

export interface LockerStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  overdue: number;
  occupancyRate: number;
}

