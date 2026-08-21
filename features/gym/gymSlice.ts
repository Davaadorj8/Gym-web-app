import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentStatus = 'PAID' | 'PENDING';
export type PaymentMethod = 'CARD' | 'CASH' | 'BANK_TRANSFER';
export type LockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface RegisteredMember {
  id: string;
  regId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  photoUrl: string | null;
  planId: string;
  planName: string;
  durationMonths: number;
  startDate: string;
  expiryDate: string;
  totalFee: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  registeredByStaffId: string;
  registeredByStaffName: string;
  registeredAt: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'INACTIVE';
}

export interface ActiveCheckIn {
  id: string;
  memberId: string;
  regId: string;
  memberName: string;
  planName: string;
  photoUrl: string | null;
  checkInTime: string;
  checkInTimestamp: number;
  lockerNumber: number;
}

export interface CompletedCheckInSession {
  id: string;
  memberId: string;
  regId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime: string;
  durationMinutes: number;
  lockerNumber: number;
}

export interface LockerItem {
  number: number;
  status: LockerStatus;
  occupiedByMemberId?: string | null;
  occupiedByMemberName?: string | null;
  occupiedByRegId?: string | null;
  assignedAt?: string | null;
  assignedTimestamp?: number | null;
  isOverdue?: boolean; // Occupied past 00:00 or longer than usual
  overdueReason?: string | null;
  inactiveReason?: string | null;
  inactiveNotes?: string | null;
  lastUpdatedBy?: string | null;
  lastUpdatedAt?: string | null;
}

export interface LockerUsageRecord {
  id: string;
  lockerNumber: number;
  memberId?: string | null;
  memberName: string;
  regId: string;
  eventDescription: string;
  timestamp: string;
  isoTime: string;
  keyStatus: 'ACTIVE_OCCUPANT' | 'RETURNED' | 'MAINTENANCE' | 'OVERDUE' | 'OUT_OF_SERVICE';
  staffLogged: string;
  notes?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  category: 'Over 18' | 'Under 18' | 'Organization' | 'Youth' | 'Classes' | 'VIP Elite' | string;
  price: number;
  durationMonths: number;
  description?: string;
  specializedLessons?: string;
  color: string;
}

export interface FrontDeskLog {
  id: string;
  memberId?: string;
  memberName: string;
  initials: string;
  actionEvent: string;
  timestamp: string;
  statusTag: 'ACTIVE' | 'PENDING' | 'CHECKED_IN' | 'COMPLETED' | 'EXPIRED';
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category:
    | 'Facility Rent'
    | 'Equipment & Maintenance'
    | 'Staff Payroll'
    | 'Utilities & HVAC'
    | 'Supplies & Sanitization'
    | 'Software & Telemetry'
    | 'Other';
  amount: number;
  date: string;
  paidVia: 'BANK_TRANSFER' | 'CARD' | 'CASH';
  loggedBy: string;
  notes?: string;
}

export interface GymFacilityState {
  gymName: string;
  tagline: string;
  activeOccupancy: number;
  maxCapacity: number;
  turnstileGateStatus: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  lockersTotal: number;
  lockersOccupied: number;
  autoAssignLocker: boolean;
}

interface GymState {
  facility: GymFacilityState;
  members: RegisteredMember[];
  activeCheckIns: ActiveCheckIn[];
  checkInHistory: CompletedCheckInSession[];
  lockers: LockerItem[];
  selectedLockerNumber: number | null;
  membershipPlans: MembershipPlan[];
  frontDeskLogs: FrontDeskLog[];
  lockerUsageLogs: LockerUsageRecord[];
  expenses: ExpenseRecord[];
}

export const initialMembershipPlans: MembershipPlan[] = [
  {
    id: 'plan-starter-1m',
    name: '1 Month - Starter Pass',
    category: 'Over 18',
    price: 110,
    durationMonths: 1,
    description: 'Standard adult athlete membership with full facility access',
    color: '#10B981',
  },
  {
    id: 'plan-pro-3m',
    name: '3 Months - Pro Athlete',
    category: 'Over 18',
    price: 299,
    durationMonths: 3,
    description: 'Quarterly membership + free locker assignment',
    color: '#06B6D4',
  },
  {
    id: 'plan-semi-6m',
    name: '6 Months - Semi-Annual',
    category: 'Over 18',
    price: 550,
    durationMonths: 6,
    description: 'Semi-annual membership with priority guest passes',
    color: '#3B82F6',
  },
  {
    id: 'plan-elite-1y',
    name: '1 Year - Elite Unlimited',
    category: 'Over 18',
    price: 999,
    durationMonths: 12,
    description: '365 Days all-facility access + recovery spa lounge',
    color: '#8B5CF6',
  },
  {
    id: 'plan-youth-1m',
    name: 'Under 18 Youth Pass',
    category: 'Under 18',
    price: 80,
    durationMonths: 1,
    description: 'Special youth supervised strength & fitness program',
    color: '#F59E0B',
  },
  {
    id: 'plan-org-corp-1m',
    name: 'Organization Corporate Pass',
    category: 'Organization',
    price: 300,
    durationMonths: 1,
    description: 'Company/Team institutional plan & group wellness access',
    color: '#EC4899',
  },
  {
    id: 'plan-aerobics-2m',
    name: 'Aerobics & Functional Cardio Pass',
    category: 'Over 18',
    price: 160,
    durationMonths: 2,
    description: 'Group aerobics, HIIT studio & cardio coaching lessons',
    color: '#A3E635',
  },
];

// Generate 50 Lockers (1 to 50)
const initialLockers: LockerItem[] = Array.from({ length: 50 }, (_, i) => {
  const lockerNum = i + 1;
  // Pre-occupy a few lockers for realistic initial state
  if (lockerNum === 2) {
    return {
      number: 2,
      status: 'OCCUPIED',
      occupiedByMemberId: 'mem-4',
      occupiedByMemberName: 'Davaadorj2 Batsaikhan',
      occupiedByRegId: 'ARC-1088',
      assignedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      assignedTimestamp: Date.now() - 35 * 60 * 1000,
    };
  }
  if (lockerNum === 7) {
    return {
      number: 7,
      status: 'OCCUPIED',
      occupiedByMemberId: 'mem-2',
      occupiedByMemberName: 'Chloe Chen',
      occupiedByRegId: 'ARC-3024',
      assignedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      assignedTimestamp: Date.now() - 65 * 60 * 1000,
    };
  }
  if (lockerNum === 24) {
    return {
      number: 24,
      status: 'OCCUPIED',
      occupiedByMemberId: 'mem-3',
      occupiedByMemberName: 'Marcus Brody',
      occupiedByRegId: 'ARC-8812',
      assignedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      assignedTimestamp: Date.now() - 14 * 60 * 60 * 1000,
      isOverdue: true,
      overdueReason: 'Key unreturned past 00:00 midnight shift. Athlete left facility.',
    };
  }
  if (lockerNum === 18) {
    return {
      number: 18,
      status: 'MAINTENANCE',
      inactiveReason: 'Broken lock / door latch jammed',
      inactiveNotes: 'Scheduled locksmith replacement',
      lastUpdatedBy: 'AD',
      lastUpdatedAt: '08:00 AM',
    };
  }
  if (lockerNum === 19) {
    return {
      number: 19,
      status: 'MAINTENANCE',
      inactiveReason: 'Dirty / Needs cleaning',
      inactiveNotes: 'Sanitization and towel removal required',
      lastUpdatedBy: 'ER',
      lastUpdatedAt: '09:15 AM',
    };
  }
  return {
    number: lockerNum,
    status: 'AVAILABLE',
  };
});

// Seed Initial Members with rich profile data & different payment dates/statuses
const now = new Date();
const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

const initialMembers: RegisteredMember[] = [
  {
    id: 'mem-4',
    regId: 'ARC-1088',
    firstName: 'Davaadorj2',
    lastName: 'Batsaikhan',
    email: 'davaadorj2@example.com',
    phone: '(555) 777-9012',
    dob: '1994-06-18',
    gender: 'Male',
    address: '24 Central Plaza',
    emergencyContact: 'Family - (555) 321-9988',
    photoUrl: null,
    planId: 'plan-starter-1m',
    planName: '1 Month Membership',
    durationMonths: 1,
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    expiryDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    totalFee: 110,
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    registeredByStaffId: 'usr-1',
    registeredByStaffName: 'Arche Owner (Admin)',
    registeredAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'mem-1',
    regId: 'ARC-4921',
    firstName: 'Jordan',
    lastName: 'Vance',
    email: 'jordan.vance@example.com',
    phone: '(555) 234-5678',
    dob: '1996-05-14',
    gender: 'Male',
    address: '422 Iron St, Downtown',
    emergencyContact: 'Sarah Vance - (555) 888-1122',
    photoUrl: null,
    planId: 'plan-starter-1m',
    planName: '1 Month Membership',
    durationMonths: 1,
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    expiryDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    totalFee: 110,
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    registeredByStaffId: 'usr-1',
    registeredByStaffName: 'Arche Owner (Admin)',
    registeredAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'mem-2',
    regId: 'ARC-3024',
    firstName: 'Chloe',
    lastName: 'Chen',
    email: 'chloe.chen@example.com',
    phone: '(555) 876-5432',
    dob: '1998-11-20',
    gender: 'Female',
    address: '109 Park Lane, Suite 4B',
    emergencyContact: 'David Chen - (555) 990-2341',
    photoUrl: null,
    planId: 'plan-youth-2m',
    planName: 'Under 18 Youth Pass (2 Mo)',
    durationMonths: 2,
    startDate: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(),
    expiryDate: new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString(),
    totalFee: 140,
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    registeredByStaffId: 'usr-2',
    registeredByStaffName: 'Elena Rostova (Front Desk)',
    registeredAt: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'mem-3',
    regId: 'ARC-8812',
    firstName: 'Marcus',
    lastName: 'Brody',
    email: 'marcus.b@example.com',
    phone: '(555) 432-1098',
    dob: '1992-03-08',
    gender: 'Male',
    address: '88 Harborview Way',
    emergencyContact: 'Tanya Brody - (555) 333-8899',
    photoUrl: null,
    planId: 'plan-elite-1y',
    planName: '1 Year - Elite Unlimited (12 Mo)',
    durationMonths: 12,
    startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
    expiryDate: new Date(now.getFullYear() + 1, now.getMonth() - 3, 1).toISOString(),
    totalFee: 999,
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    registeredByStaffId: 'usr-1',
    registeredByStaffName: 'Arche Owner (Admin)',
    registeredAt: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'mem-5',
    regId: 'ARC-5531',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@example.com',
    phone: '(555) 345-6789',
    dob: '1995-02-12',
    gender: 'Female',
    address: '12 Olympic Way',
    emergencyContact: 'Tom Jenkins - (555) 234-8877',
    photoUrl: null,
    planId: 'plan-aerobics',
    planName: 'aerobics (2 Mo)',
    durationMonths: 2,
    startDate: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
    expiryDate: new Date(now.getFullYear(), now.getMonth() + 2, 5).toISOString(),
    totalFee: 160,
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    registeredByStaffId: 'usr-2',
    registeredByStaffName: 'Elena Rostova (Front Desk)',
    registeredAt: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
    status: 'ACTIVE',
  },
  {
    id: 'mem-6',
    regId: 'ARC-9102',
    firstName: 'Alex',
    lastName: 'Mercer',
    email: 'alex.m@example.com',
    phone: '(555) 987-1234',
    dob: '1997-08-25',
    gender: 'Male',
    address: '33 Metro Blvd',
    emergencyContact: 'Karen Mercer - (555) 456-1122',
    photoUrl: null,
    planId: 'plan-starter-1m',
    planName: '1 Month Membership',
    durationMonths: 1,
    startDate: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(),
    expiryDate: new Date(now.getFullYear(), now.getMonth() + 1, 12).toISOString(),
    totalFee: 110,
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    registeredByStaffId: 'usr-1',
    registeredByStaffName: 'Arche Owner (Admin)',
    registeredAt: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(),
    status: 'ACTIVE',
  },
];

const initialActiveCheckIns: ActiveCheckIn[] = [
  {
    id: 'chk-1',
    memberId: 'mem-4',
    regId: 'ARC-1088',
    memberName: 'Davaadorj2 Batsaikhan',
    planName: '1 Month Membership',
    photoUrl: null,
    checkInTime: '07:16 PM',
    checkInTimestamp: Date.now() - 35 * 60 * 1000,
    lockerNumber: 2,
  },
  {
    id: 'chk-2',
    memberId: 'mem-2',
    regId: 'ARC-3024',
    memberName: 'Chloe Chen',
    planName: 'Under 18 Youth Pass (2 Mo)',
    photoUrl: null,
    checkInTime: '06:45 PM',
    checkInTimestamp: Date.now() - 65 * 60 * 1000,
    lockerNumber: 7,
  },
];

const initialHistory: CompletedCheckInSession[] = [
  {
    id: 'sess-1',
    memberId: 'mem-1',
    regId: 'ARC-4921',
    memberName: 'Jordan Vance',
    checkInTime: '04:15 PM',
    checkOutTime: '05:30 PM',
    durationMinutes: 75,
    lockerNumber: 12,
  },
  {
    id: 'sess-2',
    memberId: 'mem-3',
    regId: 'ARC-8812',
    memberName: 'Marcus Brody',
    checkInTime: '02:00 PM',
    checkOutTime: '03:45 PM',
    durationMinutes: 105,
    lockerNumber: 24,
  },
];

const initialFrontDeskLogs: FrontDeskLog[] = [
  {
    id: 'log-1',
    memberId: 'mem-4',
    memberName: 'Davaadorj2 Batsaikhan',
    initials: 'DB',
    actionEvent: 'Duration Extended (1 Month via Cash - $100)',
    timestamp: '11:18 AM',
    statusTag: 'ACTIVE',
  },
  {
    id: 'log-2',
    memberId: 'mem-4',
    memberName: 'Davaadorj2 Batsaikhan',
    initials: 'DB',
    actionEvent: 'Checked In (Locker #02)',
    timestamp: '07:16 PM',
    statusTag: 'ACTIVE',
  },
  {
    id: 'log-3',
    memberId: 'mem-2',
    memberName: 'Chloe Chen',
    initials: 'CC',
    actionEvent: 'Checked In (Locker #07)',
    timestamp: '06:45 PM',
    statusTag: 'ACTIVE',
  },
  {
    id: 'log-4',
    memberId: 'mem-1',
    memberName: 'Jordan Vance',
    initials: 'JV',
    actionEvent: 'Checked Out (Locker #12 returned)',
    timestamp: '05:30 PM',
    statusTag: 'COMPLETED',
  },
  {
    id: 'log-5',
    memberId: 'mem-5',
    memberName: 'Sarah Jenkins',
    initials: 'SJ',
    actionEvent: 'New Registration (aerobics 2 Mo)',
    timestamp: '03:20 PM',
    statusTag: 'ACTIVE',
  },
];

const initialLockerUsageLogs: LockerUsageRecord[] = [
  {
    id: 'lkr-log-1',
    lockerNumber: 2,
    memberId: 'mem-4',
    memberName: 'Davaadorj2 Batsaikhan',
    regId: 'IP-3283-D',
    eventDescription: 'Duration Extended (1 Month via Cash - $100)',
    timestamp: '11:18 AM',
    isoTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'DB',
    notes: 'Payment collected at desk. 1 month renewed.',
  },
  {
    id: 'lkr-log-2',
    lockerNumber: 2,
    memberId: 'mem-4',
    memberName: 'Davaadorj2 Batsaikhan',
    regId: 'IP-3283-D',
    eventDescription: 'Checked In (Locker #02)',
    timestamp: '07:16 PM',
    isoTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'DB',
    notes: 'RFID Key Tag Issued',
  },
  {
    id: 'lkr-log-3',
    lockerNumber: 1,
    memberId: 'mem-child-1',
    memberName: 'child 1 child',
    regId: 'IP-1663-C',
    eventDescription: 'Checked In (Locker #01)',
    timestamp: '06:55 PM',
    isoTime: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'CC',
    notes: 'Youth training access',
  },
  {
    id: 'lkr-log-4',
    lockerNumber: 24,
    memberId: 'mem-dav-1',
    memberName: 'DAVAADORJ BATSAIKHAN',
    regId: 'IP-1576-D',
    eventDescription: 'Checked Out (Locker #24)',
    timestamp: '06:53 PM',
    isoTime: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'DB',
    notes: 'Key fob returned at desk',
  },
  {
    id: 'lkr-log-5',
    lockerNumber: 24,
    memberId: 'mem-dav-1',
    memberName: 'DAVAADORJ BATSAIKHAN',
    regId: 'IP-1576-D',
    eventDescription: 'Duration Extended (1 Month via Cash - $100)',
    timestamp: '10:52 AM',
    isoTime: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'DB',
    notes: 'Extended via reception desk',
  },
  {
    id: 'lkr-log-6',
    lockerNumber: 7,
    memberId: 'mem-2',
    memberName: 'Chloe Chen',
    regId: 'ARC-3024',
    eventDescription: 'Checked In (Locker #07)',
    timestamp: '06:45 PM',
    isoTime: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'CC',
  },
  {
    id: 'lkr-log-7',
    lockerNumber: 12,
    memberId: 'mem-1',
    memberName: 'Jordan Vance',
    regId: 'ARC-4921',
    eventDescription: 'Checked Out (Locker #12 returned)',
    timestamp: '05:30 PM',
    isoTime: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'JV',
  },
  {
    id: 'lkr-log-8',
    lockerNumber: 15,
    memberId: 'mem-5',
    memberName: 'Sarah Jenkins',
    regId: 'ARC-7890',
    eventDescription: 'Checked In (Locker #15)',
    timestamp: '04:45 PM',
    isoTime: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'AD',
  },
  {
    id: 'lkr-log-9',
    lockerNumber: 8,
    memberId: 'mem-3',
    memberName: 'Marcus Brody',
    regId: 'ARC-8812',
    eventDescription: 'Checked Out (Locker #08 returned)',
    timestamp: '04:10 PM',
    isoTime: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'ER',
  },
  {
    id: 'lkr-log-10',
    lockerNumber: 18,
    memberName: 'Facility Maintenance',
    regId: 'SYS-OPS',
    eventDescription: 'Lock Mechanism Jammed - Flagged Inactive',
    timestamp: '03:30 PM',
    isoTime: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
    keyStatus: 'MAINTENANCE',
    staffLogged: 'AD',
    notes: 'Lock latch replacement needed.',
  },
  {
    id: 'lkr-log-11',
    lockerNumber: 19,
    memberName: 'Housekeeping Desk',
    regId: 'SYS-OPS',
    eventDescription: 'Sanitization & Deep Clean Required',
    timestamp: '02:40 PM',
    isoTime: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    keyStatus: 'MAINTENANCE',
    staffLogged: 'ER',
    notes: 'Cleaned and disinfected.',
  },
  {
    id: 'lkr-log-12',
    lockerNumber: 3,
    memberId: 'mem-alex',
    memberName: 'Alex Rivera',
    regId: 'ARC-1029',
    eventDescription: 'Checked In (Locker #03)',
    timestamp: '02:15 PM',
    isoTime: new Date(Date.now() - 340 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'JV',
  },
  {
    id: 'lkr-log-13',
    lockerNumber: 5,
    memberId: 'mem-elena',
    memberName: 'Elena Rostova',
    regId: 'ARC-6651',
    eventDescription: 'Checked Out (Locker #05 returned)',
    timestamp: '01:50 PM',
    isoTime: new Date(Date.now() - 370 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'DB',
  },
  {
    id: 'lkr-log-14',
    lockerNumber: 11,
    memberId: 'mem-taylor',
    memberName: 'Taylor Swift',
    regId: 'ARC-9912',
    eventDescription: 'Checked In (Locker #11)',
    timestamp: '01:10 PM',
    isoTime: new Date(Date.now() - 410 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'CC',
  },
  {
    id: 'lkr-log-15',
    lockerNumber: 16,
    memberId: 'mem-james',
    memberName: 'James Wilson',
    regId: 'ARC-5544',
    eventDescription: 'Checked Out (Locker #16 returned)',
    timestamp: '12:45 PM',
    isoTime: new Date(Date.now() - 440 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'DB',
  },
  {
    id: 'lkr-log-16',
    lockerNumber: 22,
    memberId: 'mem-maya',
    memberName: 'Maya Lin',
    regId: 'ARC-3388',
    eventDescription: 'Checked In (Locker #22)',
    timestamp: '12:15 PM',
    isoTime: new Date(Date.now() - 470 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'JV',
  },
  {
    id: 'lkr-log-17',
    lockerNumber: 30,
    memberId: 'mem-lucas',
    memberName: 'Lucas Silva',
    regId: 'ARC-7721',
    eventDescription: 'Checked Out (Locker #30 returned)',
    timestamp: '11:55 AM',
    isoTime: new Date(Date.now() - 500 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'CC',
  },
  {
    id: 'lkr-log-18',
    lockerNumber: 9,
    memberId: 'mem-david',
    memberName: 'David Kim',
    regId: 'ARC-8833',
    eventDescription: 'Checked In (Locker #09)',
    timestamp: '11:30 AM',
    isoTime: new Date(Date.now() - 530 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'DB',
  },
  {
    id: 'lkr-log-19',
    lockerNumber: 4,
    memberId: 'mem-hannah',
    memberName: 'Hannah Schmidt',
    regId: 'ARC-4411',
    eventDescription: 'Checked Out (Locker #04 returned)',
    timestamp: '10:45 AM',
    isoTime: new Date(Date.now() - 570 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'AD',
  },
  {
    id: 'lkr-log-20',
    lockerNumber: 14,
    memberId: 'mem-noah',
    memberName: 'Noah Zhang',
    regId: 'ARC-1199',
    eventDescription: 'Checked In (Locker #14)',
    timestamp: '10:15 AM',
    isoTime: new Date(Date.now() - 600 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'ER',
  },
  {
    id: 'lkr-log-21',
    lockerNumber: 27,
    memberId: 'mem-olivia',
    memberName: 'Olivia Martinez',
    regId: 'ARC-6622',
    eventDescription: 'Checked Out (Locker #27 returned)',
    timestamp: '09:50 AM',
    isoTime: new Date(Date.now() - 630 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'DB',
  },
  {
    id: 'lkr-log-22',
    lockerNumber: 6,
    memberId: 'mem-sam',
    memberName: 'Samira Patel',
    regId: 'ARC-9933',
    eventDescription: 'Checked In (Locker #06)',
    timestamp: '09:20 AM',
    isoTime: new Date(Date.now() - 660 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'JV',
  },
  {
    id: 'lkr-log-23',
    lockerNumber: 20,
    memberId: 'mem-victor',
    memberName: 'Victor Hugo',
    regId: 'ARC-5511',
    eventDescription: 'Checked Out (Locker #20 returned)',
    timestamp: '08:55 AM',
    isoTime: new Date(Date.now() - 690 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'CC',
  },
  {
    id: 'lkr-log-24',
    lockerNumber: 10,
    memberId: 'mem-rachel',
    memberName: 'Rachel Green',
    regId: 'ARC-3311',
    eventDescription: 'Checked In (Locker #10)',
    timestamp: '08:30 AM',
    isoTime: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
    keyStatus: 'ACTIVE_OCCUPANT',
    staffLogged: 'DB',
  },
  {
    id: 'lkr-log-25',
    lockerNumber: 25,
    memberId: 'mem-ben',
    memberName: 'Benjamin Scott',
    regId: 'ARC-7744',
    eventDescription: 'Checked Out (Locker #25 returned)',
    timestamp: '08:05 AM',
    isoTime: new Date(Date.now() - 750 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'AD',
  },
  {
    id: 'lkr-log-26',
    lockerNumber: 17,
    memberId: 'mem-karen',
    memberName: 'Karen Page',
    regId: 'ARC-2299',
    eventDescription: 'Checked In (Locker #17)',
    timestamp: 'Yesterday 09:15 PM',
    isoTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'ER',
  },
  {
    id: 'lkr-log-27',
    lockerNumber: 28,
    memberId: 'mem-frank',
    memberName: 'Frank Castle',
    regId: 'ARC-9988',
    eventDescription: 'Checked Out (Locker #28 returned)',
    timestamp: 'Yesterday 08:40 PM',
    isoTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'DB',
  },
  {
    id: 'lkr-log-28',
    lockerNumber: 31,
    memberId: 'mem-diana',
    memberName: 'Diana Prince',
    regId: 'ARC-1100',
    eventDescription: 'Checked In (Locker #31)',
    timestamp: 'Yesterday 08:00 PM',
    isoTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'JV',
  },
  {
    id: 'lkr-log-29',
    lockerNumber: 33,
    memberId: 'mem-bruce',
    memberName: 'Bruce Wayne',
    regId: 'ARC-4477',
    eventDescription: 'Checked Out (Locker #33 returned)',
    timestamp: 'Yesterday 07:20 PM',
    isoTime: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'CC',
  },
  {
    id: 'lkr-log-30',
    lockerNumber: 13,
    memberId: 'mem-clark',
    memberName: 'Clark Kent',
    regId: 'ARC-6600',
    eventDescription: 'Checked In (Locker #13)',
    timestamp: 'Yesterday 06:45 PM',
    isoTime: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    keyStatus: 'RETURNED',
    staffLogged: 'AD',
  },
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-1',
    title: 'Facility Lease & Floor Rent',
    category: 'Facility Rent',
    amount: 3200,
    date: '2026-08-01',
    paidVia: 'BANK_TRANSFER',
    loggedBy: 'Arche Owner (Admin)',
    notes: 'Monthly commercial floor lease',
  },
  {
    id: 'exp-2',
    title: 'Trainer & Front Desk Payroll',
    category: 'Staff Payroll',
    amount: 2400,
    date: '2026-08-05',
    paidVia: 'BANK_TRANSFER',
    loggedBy: 'Arche Owner (Admin)',
    notes: 'Bi-weekly front desk staff and strength coach stipend',
  },
  {
    id: 'exp-3',
    title: 'Power, Cooling & Commercial HVAC',
    category: 'Utilities & HVAC',
    amount: 680,
    date: '2026-08-10',
    paidVia: 'CARD',
    loggedBy: 'Elena Rostova (Front Desk)',
    notes: 'Monthly electric and ventilation utility bill',
  },
  {
    id: 'exp-4',
    title: 'Cable Machine & Locker Lock Parts',
    category: 'Equipment & Maintenance',
    amount: 340,
    date: '2026-08-12',
    paidVia: 'CARD',
    loggedBy: 'Staff',
    notes: 'Cable pulley replacements and new locker key fobs',
  },
  {
    id: 'exp-5',
    title: 'Sanitization Supplies & Towel Service',
    category: 'Supplies & Sanitization',
    amount: 220,
    date: '2026-08-15',
    paidVia: 'CARD',
    loggedBy: 'Staff',
    notes: 'Disinfectant sprays, paper towels, shower supplies',
  },
];

const initialState: GymState = {
  facility: {
    gymName: 'Arche Gym',
    tagline: 'IRONPULSE MANAGEMENT',
    activeOccupancy: 2,
    maxCapacity: 50,
    turnstileGateStatus: 'ONLINE',
    lockersTotal: 50,
    lockersOccupied: 2,
    autoAssignLocker: true,
  },
  members: initialMembers,
  activeCheckIns: initialActiveCheckIns,
  checkInHistory: initialHistory,
  lockers: initialLockers,
  selectedLockerNumber: null,
  membershipPlans: initialMembershipPlans,
  frontDeskLogs: initialFrontDeskLogs,
  lockerUsageLogs: initialLockerUsageLogs,
  expenses: initialExpenses,
};

export const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    registerMember: (state, action: PayloadAction<RegisteredMember>) => {
      state.members.unshift(action.payload);
      const member = action.payload;
      const initials = `${member.firstName[0] || ''}${member.lastName[0] || ''}`.toUpperCase() || 'MB';
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.frontDeskLogs.unshift({
        id: `log-${Date.now()}`,
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        initials,
        actionEvent: `New Registration (${member.planName})`,
        timestamp: nowTime,
        statusTag: member.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
      });
    },

    updateMemberPaymentStatus: (
      state,
      action: PayloadAction<{
        memberId: string;
        paymentStatus: PaymentStatus;
        paymentMethod: PaymentMethod;
        confirmedByStaffId: string;
        confirmedByStaffName: string;
      }>
    ) => {
      const member = state.members.find((m) => m.id === action.payload.memberId);
      if (member) {
        member.paymentStatus = action.payload.paymentStatus;
        member.paymentMethod = action.payload.paymentMethod;
        if (action.payload.paymentStatus === 'PAID') {
          member.status = 'ACTIVE';
        }
        const initials = `${member.firstName[0] || ''}${member.lastName[0] || ''}`.toUpperCase() || 'MB';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        state.frontDeskLogs.unshift({
          id: `log-${Date.now()}`,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          initials,
          actionEvent: `Duration Extended (${member.planName} via ${action.payload.paymentMethod} - $${member.totalFee})`,
          timestamp: nowTime,
          statusTag: 'ACTIVE',
        });
      }
    },

    checkInMember: (
      state,
      action: PayloadAction<{
        memberId: string;
        lockerNumber: number;
      }>
    ) => {
      const member = state.members.find((m) => m.id === action.payload.memberId);
      if (!member) return;

      const existingCheckIn = state.activeCheckIns.find((c) => c.memberId === member.id);
      if (existingCheckIn) return; // Already on-floor

      const nowTimestamp = Date.now();
      const timeString = new Date(nowTimestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newCheckIn: ActiveCheckIn = {
        id: `chk-${nowTimestamp}`,
        memberId: member.id,
        regId: member.regId,
        memberName: `${member.firstName} ${member.lastName}`,
        planName: member.planName,
        photoUrl: member.photoUrl,
        checkInTime: timeString,
        checkInTimestamp: nowTimestamp,
        lockerNumber: action.payload.lockerNumber,
      };

      state.activeCheckIns.unshift(newCheckIn);

      // Reserve Locker in Locker Matrix
      const lockerIndex = state.lockers.findIndex(
        (l) => l.number === action.payload.lockerNumber
      );
      if (lockerIndex !== -1) {
        state.lockers[lockerIndex].status = 'OCCUPIED';
        state.lockers[lockerIndex].occupiedByMemberId = member.id;
        state.lockers[lockerIndex].occupiedByMemberName = `${member.firstName} ${member.lastName}`;
        state.lockers[lockerIndex].assignedAt = new Date(nowTimestamp).toISOString();
      }

      // Update Facility Occupancy
      state.facility.activeOccupancy = state.activeCheckIns.length;
      state.facility.lockersOccupied = state.lockers.filter((l) => l.status === 'OCCUPIED').length;

      // Add log
      const initials = `${member.firstName[0] || ''}${member.lastName[0] || ''}`.toUpperCase() || 'MB';
      const lockerFormatted = action.payload.lockerNumber < 10 ? `0${action.payload.lockerNumber}` : `${action.payload.lockerNumber}`;
      state.frontDeskLogs.unshift({
        id: `log-${nowTimestamp}`,
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        initials,
        actionEvent: `Checked In (Locker #${lockerFormatted})`,
        timestamp: timeString,
        statusTag: 'ACTIVE',
      });
      state.lockerUsageLogs.unshift({
        id: `lkr-${nowTimestamp}`,
        lockerNumber: action.payload.lockerNumber,
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        regId: member.regId,
        eventDescription: `Checked In (Locker #${lockerFormatted})`,
        timestamp: timeString,
        isoTime: new Date(nowTimestamp).toISOString(),
        keyStatus: 'ACTIVE_OCCUPANT',
        staffLogged: initials,
        notes: 'RFID Key Tag Issued at check-in',
      });
    },

    checkOutMember: (
      state,
      action: PayloadAction<{
        checkInId: string;
      }>
    ) => {
      const checkInIndex = state.activeCheckIns.findIndex((c) => c.id === action.payload.checkInId);
      if (checkInIndex === -1) return;

      const checkIn = state.activeCheckIns[checkInIndex];
      const nowTimestamp = Date.now();
      const checkOutTimeFormatted = new Date(nowTimestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const elapsedMs = Math.max(0, nowTimestamp - checkIn.checkInTimestamp);
      const durationMinutes = Math.max(1, Math.round(elapsedMs / (1000 * 60)));

      // Free Locker in Locker Matrix
      const lockerIndex = state.lockers.findIndex((l) => l.number === checkIn.lockerNumber);
      if (lockerIndex !== -1) {
        state.lockers[lockerIndex].status = 'AVAILABLE';
        state.lockers[lockerIndex].occupiedByMemberId = null;
        state.lockers[lockerIndex].occupiedByMemberName = null;
        state.lockers[lockerIndex].assignedAt = null;
      }

      // Record in Session History for Analytics
      state.checkInHistory.unshift({
        id: `sess-${nowTimestamp}`,
        memberId: checkIn.memberId,
        regId: checkIn.regId,
        memberName: checkIn.memberName,
        checkInTime: checkIn.checkInTime,
        checkOutTime: checkOutTimeFormatted,
        durationMinutes,
        lockerNumber: checkIn.lockerNumber,
      });

      // Add log
      const nameParts = checkIn.memberName.split(' ');
      const initials = `${nameParts[0]?.[0] || ''}${nameParts[1]?.[0] || ''}`.toUpperCase() || 'MB';
      const lockerFormatted = checkIn.lockerNumber < 10 ? `0${checkIn.lockerNumber}` : `${checkIn.lockerNumber}`;
      state.frontDeskLogs.unshift({
        id: `log-${nowTimestamp}`,
        memberId: checkIn.memberId,
        memberName: checkIn.memberName,
        initials,
        actionEvent: `Checked Out (Locker #${lockerFormatted} returned)`,
        timestamp: checkOutTimeFormatted,
        statusTag: 'COMPLETED',
      });
      state.lockerUsageLogs.unshift({
        id: `lkr-${nowTimestamp}`,
        lockerNumber: checkIn.lockerNumber,
        memberId: checkIn.memberId,
        memberName: checkIn.memberName,
        regId: checkIn.regId,
        eventDescription: `Checked Out (Locker #${lockerFormatted})`,
        timestamp: checkOutTimeFormatted,
        isoTime: new Date(nowTimestamp).toISOString(),
        keyStatus: 'RETURNED',
        staffLogged: initials,
        notes: `Session completed (${durationMinutes} mins)`,
      });

      // Remove from active on-floor list
      state.activeCheckIns.splice(checkInIndex, 1);

      // Update Facility Occupancy
      state.facility.activeOccupancy = state.activeCheckIns.length;
      state.facility.lockersOccupied = state.lockers.filter((l) => l.status === 'OCCUPIED').length;
    },

    addMembershipPlan: (state, action: PayloadAction<MembershipPlan>) => {
      state.membershipPlans.push(action.payload);
    },

    updateMembershipPlan: (state, action: PayloadAction<MembershipPlan>) => {
      const idx = state.membershipPlans.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.membershipPlans[idx] = action.payload;
      }
    },

    deleteMembershipPlan: (state, action: PayloadAction<string>) => {
      state.membershipPlans = state.membershipPlans.filter((p) => p.id !== action.payload);
    },

    addFrontDeskLog: (state, action: PayloadAction<FrontDeskLog>) => {
      state.frontDeskLogs.unshift(action.payload);
    },

    setSelectedLockerNumber: (state, action: PayloadAction<number | null>) => {
      state.selectedLockerNumber = action.payload;
    },

    setAutoAssignLocker: (state, action: PayloadAction<boolean>) => {
      state.facility.autoAssignLocker = action.payload;
    },

    setTotalLockers: (state, action: PayloadAction<number>) => {
      const requestedCount = Math.max(10, Math.min(250, action.payload));
      const currentCount = state.lockers.length;

      if (requestedCount > currentCount) {
        // Expand lockers
        for (let i = currentCount + 1; i <= requestedCount; i++) {
          state.lockers.push({
            number: i,
            status: 'AVAILABLE',
          });
        }
      } else if (requestedCount < currentCount) {
        // Shrink lockers: keep unoccupied or up to requested count
        const newLockers: LockerItem[] = [];
        for (let i = 1; i <= requestedCount; i++) {
          const existing = state.lockers.find((l) => l.number === i);
          if (existing) {
            newLockers.push(existing);
          } else {
            newLockers.push({ number: i, status: 'AVAILABLE' });
          }
        }
        state.lockers = newLockers;
      }

      state.facility.lockersTotal = state.lockers.length;
      state.facility.lockersOccupied = state.lockers.filter((l) => l.status === 'OCCUPIED').length;
    },

    setLockerStatus: (
      state,
      action: PayloadAction<{
        lockerNumber: number;
        status: LockerStatus;
      }>
    ) => {
      const locker = state.lockers.find((l) => l.number === action.payload.lockerNumber);
      if (locker && locker.status !== 'OCCUPIED') {
        locker.status = action.payload.status;
      }
    },

    updateLockerState: (
      state,
      action: PayloadAction<{
        lockerNumber: number;
        status: LockerStatus;
        reason?: string;
        notes?: string;
        staffLogged?: string;
      }>
    ) => {
      const { lockerNumber, status, reason, notes, staffLogged = 'ST' } = action.payload;
      const locker = state.lockers.find((l) => l.number === lockerNumber);
      if (!locker) return;

      const nowTimestamp = Date.now();
      const nowTime = new Date(nowTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const lockerFormatted = lockerNumber < 10 ? `0${lockerNumber}` : `${lockerNumber}`;

      locker.status = status;
      locker.lastUpdatedBy = staffLogged;
      locker.lastUpdatedAt = nowTime;

      if (status === 'MAINTENANCE' || status === 'OUT_OF_SERVICE') {
        locker.inactiveReason = reason || 'Flagged by staff';
        locker.inactiveNotes = notes || '';
        if (locker.occupiedByMemberId) {
          state.activeCheckIns = state.activeCheckIns.filter((c) => c.lockerNumber !== lockerNumber);
          locker.occupiedByMemberId = null;
          locker.occupiedByMemberName = null;
          locker.occupiedByRegId = null;
          locker.isOverdue = false;
        }
        state.lockerUsageLogs.unshift({
          id: `lkr-${nowTimestamp}`,
          lockerNumber,
          memberName: 'Staff Operations',
          regId: 'SYS-OPS',
          eventDescription: `Locker Marked Inactive (${reason || 'Maintenance'})`,
          timestamp: nowTime,
          isoTime: new Date(nowTimestamp).toISOString(),
          keyStatus: 'MAINTENANCE',
          staffLogged,
          notes,
        });
        state.frontDeskLogs.unshift({
          id: `log-${nowTimestamp}`,
          memberName: `Locker #${lockerFormatted}`,
          initials: staffLogged,
          actionEvent: `Status changed to ${status}: ${reason || 'Maintenance'}`,
          timestamp: nowTime,
          statusTag: 'PENDING',
        });
      } else if (status === 'AVAILABLE') {
        locker.inactiveReason = null;
        locker.inactiveNotes = null;
        locker.occupiedByMemberId = null;
        locker.occupiedByMemberName = null;
        locker.occupiedByRegId = null;
        locker.isOverdue = false;
        locker.overdueReason = null;

        state.lockerUsageLogs.unshift({
          id: `lkr-${nowTimestamp}`,
          lockerNumber,
          memberName: 'Staff Operations',
          regId: 'SYS-OPS',
          eventDescription: `Locker Restored to Active / Available (${reason || 'Cleaned / Fixed'})`,
          timestamp: nowTime,
          isoTime: new Date(nowTimestamp).toISOString(),
          keyStatus: 'RETURNED',
          staffLogged,
          notes,
        });
        state.frontDeskLogs.unshift({
          id: `log-${nowTimestamp}`,
          memberName: `Locker #${lockerFormatted}`,
          initials: staffLogged,
          actionEvent: `Restored to Active: ${reason || 'Fixed & Cleaned'}`,
          timestamp: nowTime,
          statusTag: 'ACTIVE',
        });
      }

      state.facility.lockersOccupied = state.lockers.filter((l) => l.status === 'OCCUPIED').length;
      state.facility.activeOccupancy = state.activeCheckIns.length;
    },

    resolveOverdueLocker: (
      state,
      action: PayloadAction<{
        lockerNumber: number;
        actionType: 'FORCE_CHECKOUT' | 'FLAG_KEY_LOST' | 'FLAG_DIRTY_CLEAN';
        reason: string;
        notes?: string;
        staffLogged?: string;
      }>
    ) => {
      const { lockerNumber, actionType, reason, notes, staffLogged = 'AD' } = action.payload;
      const locker = state.lockers.find((l) => l.number === lockerNumber);
      if (!locker) return;

      const nowTimestamp = Date.now();
      const nowTime = new Date(nowTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const lockerFormatted = lockerNumber < 10 ? `0${lockerNumber}` : `${lockerNumber}`;

      const memberName = locker.occupiedByMemberName || 'Overdue Member';
      const regId = locker.occupiedByRegId || 'ARC-8812';
      const memberId = locker.occupiedByMemberId || '';

      // Remove from active check-ins if exists
      const checkInIdx = state.activeCheckIns.findIndex((c) => c.lockerNumber === lockerNumber);
      if (checkInIdx !== -1) {
        const checkIn = state.activeCheckIns[checkInIdx];
        state.checkInHistory.unshift({
          id: `sess-${nowTimestamp}`,
          memberId: checkIn.memberId,
          regId: checkIn.regId,
          memberName: checkIn.memberName,
          checkInTime: checkIn.checkInTime,
          checkOutTime: `${nowTime} (Forced / Midnight Close)`,
          durationMinutes: Math.round((nowTimestamp - checkIn.checkInTimestamp) / (1000 * 60)),
          lockerNumber,
        });
        state.activeCheckIns.splice(checkInIdx, 1);
      }

      if (actionType === 'FORCE_CHECKOUT') {
        locker.status = 'AVAILABLE';
        locker.isOverdue = false;
        locker.overdueReason = null;
        locker.occupiedByMemberId = null;
        locker.occupiedByMemberName = null;
        locker.occupiedByRegId = null;
        locker.lastUpdatedBy = staffLogged;
        locker.lastUpdatedAt = nowTime;

        state.lockerUsageLogs.unshift({
          id: `lkr-${nowTimestamp}`,
          lockerNumber,
          memberId,
          memberName,
          regId,
          eventDescription: `Overdue Resolved: Force Checked Out & Locker Freed (${reason})`,
          timestamp: nowTime,
          isoTime: new Date(nowTimestamp).toISOString(),
          keyStatus: 'RETURNED',
          staffLogged,
          notes,
        });

        state.frontDeskLogs.unshift({
          id: `log-${nowTimestamp}`,
          memberId,
          memberName,
          initials: staffLogged,
          actionEvent: `Overdue Locker #${lockerFormatted} released (${reason})`,
          timestamp: nowTime,
          statusTag: 'COMPLETED',
        });
      } else if (actionType === 'FLAG_KEY_LOST') {
        locker.status = 'MAINTENANCE';
        locker.isOverdue = false;
        locker.inactiveReason = `Key Lost: ${reason}`;
        locker.inactiveNotes = notes || 'Key unreturned after midnight. Key replacement required.';
        locker.occupiedByMemberId = null;
        locker.occupiedByMemberName = null;
        locker.occupiedByRegId = null;
        locker.lastUpdatedBy = staffLogged;
        locker.lastUpdatedAt = nowTime;

        state.lockerUsageLogs.unshift({
          id: `lkr-${nowTimestamp}`,
          lockerNumber,
          memberId,
          memberName,
          regId,
          eventDescription: `Overdue Resolved: Key Lost Flagged & Locker Marked Inactive (${reason})`,
          timestamp: nowTime,
          isoTime: new Date(nowTimestamp).toISOString(),
          keyStatus: 'MAINTENANCE',
          staffLogged,
          notes,
        });

        state.frontDeskLogs.unshift({
          id: `log-${nowTimestamp}`,
          memberId,
          memberName,
          initials: staffLogged,
          actionEvent: `Locker #${lockerFormatted} Key Lost flagged (${reason})`,
          timestamp: nowTime,
          statusTag: 'PENDING',
        });
      }

      state.facility.lockersOccupied = state.lockers.filter((l) => l.status === 'OCCUPIED').length;
      state.facility.activeOccupancy = state.activeCheckIns.length;
    },

    addLockerUsageLog: (state, action: PayloadAction<LockerUsageRecord>) => {
      state.lockerUsageLogs.unshift(action.payload);
    },

    addExpense: (state, action: PayloadAction<ExpenseRecord>) => {
      state.expenses.unshift(action.payload);
    },

    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },

    updateOccupancy: (state, action: PayloadAction<number>) => {
      state.facility.activeOccupancy = action.payload;
    },
  },
});

export const {
  registerMember,
  updateMemberPaymentStatus,
  checkInMember,
  checkOutMember,
  setSelectedLockerNumber,
  setAutoAssignLocker,
  setTotalLockers,
  setLockerStatus,
  updateLockerState,
  resolveOverdueLocker,
  addLockerUsageLog,
  addExpense,
  deleteExpense,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  addFrontDeskLog,
  updateOccupancy,
} = gymSlice.actions;

export default gymSlice.reducer;
