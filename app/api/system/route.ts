import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/prisma';

export async function GET() {
  const isDbReady = isDatabaseConfigured();
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
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
