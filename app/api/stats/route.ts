import { NextResponse } from 'next/server';
import { StatsService } from '@/modules/analytics/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const userRole = session?.user?.role || 'ADMIN';

    const stats = await StatsService.getDashboardStats(userRole);
    return NextResponse.json({ stats, userRole, success: true });
  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

