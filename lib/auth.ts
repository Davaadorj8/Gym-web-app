import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import type { UserRole } from '@/types/next-auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || 'admin@archegym.com';
        const requestedRole = (credentials?.role as UserRole) || 'ADMIN';

        if (isDatabaseConfigured()) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });
            if (user) {
              return {
                id: user.id,
                name: user.name || 'Arche Staff Member',
                email: user.email,
                role: (user.role as UserRole) || requestedRole,
              };
            }
          } catch (err) {
            console.warn('Prisma auth lookup fallback:', err);
          }
        }

        // Demo user fallback matching requested role
        return {
          id: requestedRole === 'ADMIN' ? 'usr-admin-1' : 'usr-staff-1',
          name: requestedRole === 'ADMIN' ? 'Arche Admin (Supervisor)' : 'Arche Desk Staff',
          email,
          role: requestedRole,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) || 'STAFF';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || 'usr-1';
        session.user.role = (token.role as UserRole) || 'STAFF';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'arche-gym-ironpulse-secure-secret-2026',
});
