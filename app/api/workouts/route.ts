import { NextRequest, NextResponse } from 'next/server';
import { WorkoutService, workoutPlanSchema } from '@/modules/workouts/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const plans = await WorkoutService.getAllPlans(category);
    return NextResponse.json({ plans, count: plans.length });
  } catch (error: unknown) {
    console.error('Error fetching workout plans:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workout plans' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = workoutPlanSchema.parse(body);

    const plan = await WorkoutService.createPlan(validatedData);
    return NextResponse.json({ plan, success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to create workout plan' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const deleted = await WorkoutService.deletePlan(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    console.error('Error deleting workout plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout plan' },
      { status: 500 }
    );
  }
}
