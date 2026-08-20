import { NextResponse } from 'next/server';
import { StatsService } from '@/services/stats.service';

export async function GET() {
  try {
    const stats = await StatsService.getDashboardStats();
    return NextResponse.json({ stats, success: true });
  } catch (error: unknown) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
