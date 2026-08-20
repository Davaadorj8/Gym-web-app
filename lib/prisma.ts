import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const isDatabaseConfigured = (): boolean => {
  const url = process.env.DATABASE_URL;
  return Boolean(
    url &&
    url.length > 10 &&
    !url.includes('MY_') &&
    !url.includes('ep-sample-123456')
  );
};

function getPrismaClient(): PrismaClient {
  const connectionString = isDatabaseConfigured()
    ? process.env.DATABASE_URL!
    : 'postgresql://postgres:postgres@localhost:5432/arche_preview';

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
