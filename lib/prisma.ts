// Safe, resilient Prisma initialization with dynamic loading and fallback proxy
// Prevents startup crashes when .prisma/client is not yet generated or DB is offline

let _prismaInstance: any = null;
let _isPrismaAvailable: boolean | null = null;

export const isDatabaseConfigured = (): boolean => {
  const url = process.env.DATABASE_URL;
  const isUrlValid = Boolean(
    url &&
    url.length > 10 &&
    !url.includes('MY_') &&
    !url.includes('ep-sample-123456')
  );
  if (!isUrlValid) return false;
  return getPrismaClient() !== null;
};

export function getPrismaClient(): any {
  if (_prismaInstance) return _prismaInstance;
  if (_isPrismaAvailable === false) return null;

  try {
    // Dynamically require to avoid breaking compilation if .prisma/client default is not generated
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      _isPrismaAvailable = false;
      return null;
    }

    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
    });

    const adapter = new PrismaPg(pool);
    _prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    _isPrismaAvailable = true;
    return _prismaInstance;
  } catch {
    _isPrismaAvailable = false;
    return null;
  }
}

// Resilient proxy that forwards calls to the instance if available, or throws safely inside service try/catch
export const prisma: any = new Proxy({} as any, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (client && prop in client) {
      const val = client[prop];
      return typeof val === 'function' ? val.bind(client) : val;
    }
    return new Proxy({}, {
      get(_modelTarget, method) {
        return async () => {
          throw new Error(`PrismaClient not initialized or offline for ${String(prop)}.${String(method)}`);
        };
      },
    });
  },
});

