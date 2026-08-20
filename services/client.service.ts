import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { ClientInput } from '@/lib/validations/client';
import { Client } from '@/types';

// In-memory fallback state to ensure flawless developer preview when database is booting or URL is being configured
let fallbackClients: Client[] = [
  {
    id: 'c-1',
    trainerId: 'u-1',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 234-5678',
    status: 'ACTIVE',
    fitnessGoal: 'Hypertrophy & Lean Bulk (Target: +5kg muscle)',
    fitnessLevel: 'ADVANCED',
    joinedDate: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    notes: 'Prior shoulder dislocation, avoid overhead barbell presses.',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { workoutSessions: 24 }
  },
  {
    id: 'c-2',
    trainerId: 'u-1',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@example.com',
    phone: '+1 (555) 890-1234',
    status: 'ACTIVE',
    fitnessGoal: 'Half Marathon Preparation & Core Endurance',
    fitnessLevel: 'INTERMEDIATE',
    joinedDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    notes: 'Heart rate zones monitored via Garmin integration.',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { workoutSessions: 16 }
  },
  {
    id: 'c-3',
    trainerId: 'u-1',
    firstName: 'David',
    lastName: 'Chen',
    email: 'd.chen@example.com',
    phone: '+1 (555) 345-6789',
    status: 'PENDING',
    fitnessGoal: 'Functional Posture & Lower Back Rehabilitation',
    fitnessLevel: 'BEGINNER',
    joinedDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    notes: 'Consultation scheduled for Thursday 10:00 AM.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { workoutSessions: 1 }
  },
  {
    id: 'c-4',
    trainerId: 'u-1',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@example.com',
    phone: '+1 (555) 789-0123',
    status: 'ACTIVE',
    fitnessGoal: 'Weight Loss & High Intensity Metabolic Conditioning',
    fitnessLevel: 'INTERMEDIATE',
    joinedDate: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    notes: 'Prefers morning sessions between 07:00 - 08:30.',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { workoutSessions: 19 }
  },
  {
    id: 'c-5',
    trainerId: 'u-1',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    email: 'liam.oc@example.com',
    phone: '+1 (555) 456-7890',
    status: 'INACTIVE',
    fitnessGoal: 'Powerlifting Base Program',
    fitnessLevel: 'ADVANCED',
    joinedDate: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    notes: 'Traveling for work during Q3, resuming next month.',
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { workoutSessions: 42 }
  }
];

export class ClientService {
  static async getAllClients(searchQuery?: string, statusFilter?: string): Promise<Client[]> {
    if (isDatabaseConfigured()) {
      try {
        const whereClause: Record<string, unknown> = {};
        if (statusFilter && statusFilter !== 'ALL') {
          whereClause.status = statusFilter;
        }
        if (searchQuery) {
          whereClause.OR = [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
          ];
        }

        const clients = await prisma.client.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { workoutSessions: true }
            }
          }
        });

        return clients.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          joinedDate: c.joinedDate.toISOString(),
        })) as unknown as Client[];
      } catch (err) {
        console.warn('Prisma query failed, falling back to local service memory state:', err);
      }
    }

    let results = [...fallbackClients];
    if (statusFilter && statusFilter !== 'ALL') {
      results = results.filter((c) => c.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.fitnessGoal && c.fitnessGoal.toLowerCase().includes(q))
      );
    }
    return results;
  }

  static async getClientById(id: string): Promise<Client | null> {
    if (isDatabaseConfigured()) {
      try {
        const client = await prisma.client.findUnique({
          where: { id },
          include: {
            _count: { select: { workoutSessions: true } },
            workoutSessions: {
              take: 5,
              orderBy: { completedAt: 'desc' }
            }
          }
        });
        if (client) {
          return {
            ...client,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
            joinedDate: client.joinedDate.toISOString(),
          } as unknown as Client;
        }
      } catch (err) {
        console.warn('Prisma findUnique failed, falling back to local service memory state:', err);
      }
    }

    const found = fallbackClients.find((c) => c.id === id);
    return found || null;
  }

  static async createClient(data: ClientInput, trainerId = 'u-1'): Promise<Client> {
    if (isDatabaseConfigured()) {
      try {
        // Ensure default trainer exists if needed
        await prisma.user.upsert({
          where: { id: trainerId },
          update: {},
          create: {
            id: trainerId,
            email: 'headcoach@arche.fitness',
            name: 'Head Coach',
            role: 'TRAINER'
          }
        });

        const created = await prisma.client.create({
          data: {
            trainerId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            status: data.status,
            fitnessGoal: data.fitnessGoal || null,
            fitnessLevel: data.fitnessLevel,
            notes: data.notes || null,
          }
        });

        return {
          ...created,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          joinedDate: created.joinedDate.toISOString(),
          _count: { workoutSessions: 0 }
        } as unknown as Client;
      } catch (err) {
        console.warn('Prisma create failed, storing in fallback state:', err);
      }
    }

    const newClient: Client = {
      id: `c-${Date.now()}`,
      trainerId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      status: data.status,
      fitnessGoal: data.fitnessGoal || null,
      fitnessLevel: data.fitnessLevel,
      joinedDate: new Date().toISOString(),
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { workoutSessions: 0 }
    };
    fallbackClients.unshift(newClient);
    return newClient;
  }

  static async updateClient(id: string, data: Partial<ClientInput>): Promise<Client | null> {
    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.client.update({
          where: { id },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.email && { email: data.email }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.status && { status: data.status }),
            ...(data.fitnessGoal !== undefined && { fitnessGoal: data.fitnessGoal }),
            ...(data.fitnessLevel && { fitnessLevel: data.fitnessLevel }),
            ...(data.notes !== undefined && { notes: data.notes }),
          }
        });
        return {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          joinedDate: updated.joinedDate.toISOString(),
        } as unknown as Client;
      } catch (err) {
        console.warn('Prisma update failed, updating in fallback memory state:', err);
      }
    }

    const index = fallbackClients.findIndex((c) => c.id === id);
    if (index === -1) return null;
    fallbackClients[index] = {
      ...fallbackClients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return fallbackClients[index];
  }

  static async deleteClient(id: string): Promise<boolean> {
    if (isDatabaseConfigured()) {
      try {
        await prisma.client.delete({ where: { id } });
        return true;
      } catch (err) {
        console.warn('Prisma delete failed, removing from fallback memory state:', err);
      }
    }

    const index = fallbackClients.findIndex((c) => c.id === id);
    if (index === -1) return false;
    fallbackClients.splice(index, 1);
    return true;
  }
}
