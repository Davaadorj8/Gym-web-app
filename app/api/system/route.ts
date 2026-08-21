import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  const userRole = session?.user?.role || 'ADMIN';

  if (userRole === 'STAFF') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required for core system telemetry' },
      { status: 403 }
    );
  }

  const isDbReady = isDatabaseConfigured();
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    callerRole: userRole,
    stack: {
      framework: 'Next.js 15+ (App Router)',
      ui: 'React 19, Tailwind CSS v4, Lucide Icons',
      stateManagement: 'Redux Toolkit + React-Redux',
      orm: 'Prisma ORM 7',
      database: 'Neon PostgreSQL',
      validation: 'Zod v3',
      deployment: 'Vercel / Cloud Run',
      repository: 'https://github.com/Davaadorj8/arche.fitness-web-app.git'
    },
    databaseStatus: {
      configured: isDbReady,
      provider: 'postgresql',
      connectionMode: isDbReady ? 'Live Neon Instance' : 'Ready for DATABASE_URL'
    }
  });
}

