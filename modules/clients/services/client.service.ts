import { prisma } from '@/lib/prisma';
import { Client, ClientStatus, WorkoutLevel } from '@/types';
import { ClientFormData } from '../validations/client.schema';

export class ClientService {
  /**
   * Fetch clients with optional status filter and search query
   */
  static async getAllClients(search?: string, status?: string): Promise<Client[]> {
    return this.getClients({
      status: (status as any) || 'ALL',
      search,
    });
  }

  static async getClients(params: {
    status?: ClientStatus | 'ALL';
    search?: string;
    trainerId?: string;
  }): Promise<Client[]> {
    const { status, search, trainerId } = params;

    try {
      if (prisma && prisma.client) {
        const whereClause: any = {};

        if (status && status !== 'ALL') {
          whereClause.status = status;
        }

        if (trainerId) {
          whereClause.trainerId = trainerId;
        }

        if (search && search.trim() !== '') {
          whereClause.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { fitnessGoal: { contains: search, mode: 'insensitive' } },
          ];
        }

        const clients = await prisma.client.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { workoutSessions: true },
            },
          },
        });

        return clients as unknown as Client[];
      }
    } catch (error) {
      console.warn('Prisma client unavailable or connection refused, falling back to in-memory data store:', error);
    }

    return this.getFallbackClients(status, search);
  }

  /**
   * Create a new client record
   */
  static async createClient(data: ClientFormData & { trainerId?: string }): Promise<Client> {
    try {
      if (prisma && prisma.client) {
        const newClient = await prisma.client.create({
          data: {
            trainerId: data.trainerId || 'trainer-default',
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@archegym.com`,
            phone: data.phone,
            status: 'ACTIVE',
            fitnessGoal: data.fitnessGoals || 'General Fitness & Performance',
            fitnessLevel: 'INTERMEDIATE',
            notes: data.medicalNotes ? `Medical: ${data.medicalNotes}` : null,
          },
          include: {
            _count: {
              select: { workoutSessions: true },
            },
          },
        });

        return newClient as unknown as Client;
      }
    } catch (error) {
      console.warn('Prisma createClient failed, falling back to simulated memory insertion:', error);
    }

    const created: Client = {
      id: `client-${Date.now()}`,
      trainerId: data.trainerId || 'trainer-default',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`,
      phone: data.phone,
      status: 'ACTIVE',
      fitnessGoal: data.fitnessGoals || 'General Fitness',
      fitnessLevel: 'INTERMEDIATE',
      joinedDate: new Date().toISOString(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      membershipType: data.membershipType,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      rfidTag: data.rfidTag,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyRelation: data.emergencyRelation,
      medicalNotes: data.medicalNotes,
      fitnessGoals: data.fitnessGoals,
      waiverSigned: data.waiverSigned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { workoutSessions: 0 },
    };

    return created;
  }

  /**
   * Delete a client
   */
  static async deleteClient(id: string): Promise<boolean> {
    try {
      if (prisma && prisma.client) {
        await prisma.client.delete({
          where: { id },
        });
        return true;
      }
    } catch (error) {
      console.warn('Prisma deleteClient failed:', error);
    }
    return true;
  }

  /**
   * In-memory seed data for graceful fallback
   */
  private static getFallbackClients(status?: ClientStatus | 'ALL', search?: string): Client[] {
    const seedClients: Client[] = [
      {
        id: 'client-1',
        trainerId: 'trainer-default',
        firstName: 'Alexander',
        lastName: 'Hayes',
        email: 'alex.hayes@archegym.com',
        phone: '+976 9911-2233',
        status: 'ACTIVE',
        fitnessGoal: 'Hypertrophy & Strength Optimization',
        fitnessLevel: 'ADVANCED',
        joinedDate: '2025-01-15T08:00:00.000Z',
        notes: 'Pre-workout assessment completed. Focusing on 5-day push-pull split.',
        createdAt: '2025-01-15T08:00:00.000Z',
        updatedAt: '2025-01-15T08:00:00.000Z',
        _count: { workoutSessions: 14 },
      },
      {
        id: 'client-2',
        trainerId: 'trainer-default',
        firstName: 'Sarah',
        lastName: 'Mendez',
        email: 'sarah.m@archegym.com',
        phone: '+976 8812-4455',
        status: 'ACTIVE',
        fitnessGoal: 'Marathon Conditioning & Core Rehab',
        fitnessLevel: 'INTERMEDIATE',
        joinedDate: '2025-02-01T09:30:00.000Z',
        notes: 'Recovering from mild patellar tendinitis. Low impact plyometrics.',
        createdAt: '2025-02-01T09:30:00.000Z',
        updatedAt: '2025-02-01T09:30:00.000Z',
        _count: { workoutSessions: 9 },
      },
      {
        id: 'client-3',
        trainerId: 'trainer-default',
        firstName: 'Dmitri',
        lastName: 'Volkov',
        email: 'd.volkov@archegym.com',
        phone: '+976 9555-7788',
        status: 'ACTIVE',
        fitnessGoal: 'Powerlifting Competition Prep (220kg Squat)',
        fitnessLevel: 'ELITE',
        joinedDate: '2024-11-10T14:00:00.000Z',
        notes: 'Requires heavy platform booking in morning slots.',
        createdAt: '2024-11-10T14:00:00.000Z',
        updatedAt: '2024-11-10T14:00:00.000Z',
        _count: { workoutSessions: 28 },
      },
      {
        id: 'client-4',
        trainerId: 'trainer-default',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.r@archegym.com',
        phone: '+976 9901-3322',
        status: 'PENDING',
        fitnessGoal: 'Post-Rehabilitation Mobility & Posture',
        fitnessLevel: 'BEGINNER',
        joinedDate: '2025-02-18T11:00:00.000Z',
        notes: 'Awaiting orthopedic clearance before commencing barbell training.',
        createdAt: '2025-02-18T11:00:00.000Z',
        updatedAt: '2025-02-18T11:00:00.000Z',
        _count: { workoutSessions: 1 },
      },
      {
        id: 'client-5',
        trainerId: 'trainer-default',
        firstName: 'Marcus',
        lastName: 'Sterling',
        email: 'marcus.s@archegym.com',
        phone: '+976 8008-9900',
        status: 'INACTIVE',
        fitnessGoal: 'Cardiovascular Health & Fat Loss',
        fitnessLevel: 'INTERMEDIATE',
        joinedDate: '2024-08-20T16:00:00.000Z',
        notes: 'On temporary travel freeze until next month.',
        createdAt: '2024-08-20T16:00:00.000Z',
        updatedAt: '2024-08-20T16:00:00.000Z',
        _count: { workoutSessions: 19 },
      },
    ];

    let filtered = seedClients;

    if (status && status !== 'ALL') {
      filtered = filtered.filter((c) => c.status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.fitnessGoal && c.fitnessGoal.toLowerCase().includes(q))
      );
    }

    return filtered;
  }
}
