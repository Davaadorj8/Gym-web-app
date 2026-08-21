import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import { WorkoutPlanInput } from '@/lib/validations/workout';
import { WorkoutPlan } from '@/types';

let fallbackWorkouts: WorkoutPlan[] = [
  {
    id: 'wp-1',
    trainerId: 'u-1',
    title: 'Functional Hypertrophy 4-Day Split',
    description: 'High-density hypertrophy program focusing on compound lifts, progressive overload, and eccentric control.',
    level: 'INTERMEDIATE',
    category: 'Hypertrophy',
    durationWeeks: 8,
    isPublished: true,
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-1', planId: 'wp-1', name: 'Barbell Back Squat', targetMuscle: 'Quadriceps / Glutes', sets: 4, reps: 8, restSeconds: 90, orderIndex: 1, notes: 'RPE 8' },
      { id: 'ex-2', planId: 'wp-1', name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 3, reps: 10, restSeconds: 75, orderIndex: 2, notes: 'Focus on hip hinge' },
      { id: 'ex-3', planId: 'wp-1', name: 'Incline Dumbbell Press', targetMuscle: 'Upper Chest', sets: 4, reps: 10, restSeconds: 60, orderIndex: 3, notes: '30 degree bench angle' },
      { id: 'ex-4', planId: 'wp-1', name: 'Chest-Supported Row', targetMuscle: 'Upper Back / Lats', sets: 4, reps: 12, restSeconds: 60, orderIndex: 4, notes: 'Hold 1s at peak contraction' },
    ],
    _count: { exercises: 4, sessions: 38 }
  },
  {
    id: 'wp-2',
    trainerId: 'u-1',
    title: 'Aerobic Power & Threshold Conditioning',
    description: 'Zone 2 & Zone 4 intervals for endurance athletes, hybrid trainees, and metabolic capacity development.',
    level: 'ADVANCED',
    category: 'Endurance',
    durationWeeks: 6,
    isPublished: true,
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-5', planId: 'wp-2', name: 'Row Ergometer Intervals', targetMuscle: 'Full Body', sets: 6, reps: 500, restSeconds: 60, orderIndex: 1, notes: '500m per split at 1:45 pace' },
      { id: 'ex-6', planId: 'wp-2', name: 'Kettlebell Clean & Press', targetMuscle: 'Shoulders / Core', sets: 5, reps: 12, restSeconds: 45, orderIndex: 2, notes: 'Unbroken sets' },
      { id: 'ex-7', planId: 'wp-2', name: 'Farmer Carry Walk', targetMuscle: 'Grip / Traps / Core', sets: 4, reps: 50, restSeconds: 60, orderIndex: 3, notes: '50m distance per set' }
    ],
    _count: { exercises: 3, sessions: 22 }
  },
  {
    id: 'wp-3',
    trainerId: 'u-1',
    title: 'Spinal Mobility & Joint Restoration',
    description: 'Low-impact movement protocol for clients returning from injury or sedentary desk work.',
    level: 'BEGINNER',
    category: 'Mobility',
    durationWeeks: 4,
    isPublished: true,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: 'ex-8', planId: 'wp-3', name: 'Cat-Cow Flow & Thoracic Rotations', targetMuscle: 'Thoracic Spine', sets: 3, reps: 12, restSeconds: 30, orderIndex: 1, notes: 'Smooth diaphragmatic breathing' },
      { id: 'ex-9', planId: 'wp-3', name: '90/90 Hip Switch & Lift', targetMuscle: 'Hip Capsule', sets: 3, reps: 10, restSeconds: 30, orderIndex: 2, notes: 'Controlled tempo' },
      { id: 'ex-10', planId: 'wp-3', name: 'Deadbug Core Activation', targetMuscle: 'Transverse Abdominis', sets: 3, reps: 15, restSeconds: 45, orderIndex: 3, notes: 'Lower back glued to floor' }
    ],
    _count: { exercises: 3, sessions: 14 }
  }
];

export class WorkoutService {
  static async getAllPlans(category?: string): Promise<WorkoutPlan[]> {
    if (isDatabaseConfigured()) {
      try {
        const whereClause: Record<string, unknown> = {};
        if (category && category !== 'ALL') {
          whereClause.category = category;
        }

        const plans = await prisma.workoutPlan.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: {
            exercises: { orderBy: { orderIndex: 'asc' } },
            _count: { select: { exercises: true, sessions: true } }
          }
        });

        return (plans as any[]).map((p: any) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })) as unknown as WorkoutPlan[];
      } catch (err) {
        console.warn('Prisma query failed, falling back to local memory state:', err);
      }
    }

    let results = [...fallbackWorkouts];
    if (category && category !== 'ALL') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return results;
  }

  static async getPlanById(id: string): Promise<WorkoutPlan | null> {
    if (isDatabaseConfigured()) {
      try {
        const plan = await prisma.workoutPlan.findUnique({
          where: { id },
          include: {
            exercises: { orderBy: { orderIndex: 'asc' } },
            _count: { select: { exercises: true, sessions: true } }
          }
        });
        if (plan) {
          return {
            ...plan,
            createdAt: plan.createdAt.toISOString(),
            updatedAt: plan.updatedAt.toISOString(),
          } as unknown as WorkoutPlan;
        }
      } catch (err) {
        console.warn('Prisma findUnique failed, falling back to local memory state:', err);
      }
    }

    const found = fallbackWorkouts.find((p) => p.id === id);
    return found || null;
  }

  static async createPlan(data: WorkoutPlanInput, trainerId = 'u-1'): Promise<WorkoutPlan> {
    if (isDatabaseConfigured()) {
      try {
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

        const created = await prisma.workoutPlan.create({
          data: {
            trainerId,
            title: data.title,
            description: data.description || null,
            level: data.level,
            category: data.category,
            durationWeeks: data.durationWeeks,
            isPublished: data.isPublished,
            exercises: {
              create: (data.exercises || []).map((ex, idx) => ({
                name: ex.name,
                targetMuscle: ex.targetMuscle,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
                orderIndex: ex.orderIndex ?? idx + 1,
                notes: ex.notes || null,
              }))
            }
          },
          include: {
            exercises: true,
            _count: { select: { exercises: true, sessions: true } }
          }
        });

        return {
          ...created,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        } as unknown as WorkoutPlan;
      } catch (err) {
        console.warn('Prisma create failed, creating in fallback memory state:', err);
      }
    }

    const newPlan: WorkoutPlan = {
      id: `wp-${Date.now()}`,
      trainerId,
      title: data.title,
      description: data.description || null,
      level: data.level,
      category: data.category,
      durationWeeks: data.durationWeeks,
      isPublished: data.isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: (data.exercises || []).map((ex, idx) => ({
        id: `ex-${Date.now()}-${idx}`,
        planId: `wp-${Date.now()}`,
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        orderIndex: ex.orderIndex ?? idx + 1,
        notes: ex.notes || null,
      })),
      _count: {
        exercises: (data.exercises || []).length,
        sessions: 0
      }
    };
    fallbackWorkouts.unshift(newPlan);
    return newPlan;
  }

  static async deletePlan(id: string): Promise<boolean> {
    if (isDatabaseConfigured()) {
      try {
        await prisma.workoutPlan.delete({ where: { id } });
        return true;
      } catch (err) {
        console.warn('Prisma delete failed, deleting from fallback memory state:', err);
      }
    }

    const index = fallbackWorkouts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    fallbackWorkouts.splice(index, 1);
    return true;
  }
}
