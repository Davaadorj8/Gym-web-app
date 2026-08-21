import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/components/providers/store-provider';
import Toast from '@/components/ui/toast';
import { auth } from '@/lib/auth';
import type { UserProfile } from '@/features/auth/authSlice';

export const metadata: Metadata = {
  title: 'Arche Gym — Ironpulse Management Portal',
  description: 'Scalable full-stack SaaS platform for gym access management, member registrations, locker bay control, and real-time telemetry.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser: UserProfile | null = null;

  try {
    const session = await auth();
    if (session?.user) {
      const role = (session.user.role as UserProfile['role']) || 'ADMIN';
      initialUser = {
        id: session.user.id || 'usr-1',
        name: session.user.name || (role === 'ADMIN' ? 'Arche Admin (Supervisor)' : 'Arche Desk Staff'),
        email: session.user.email || 'admin@archegym.com',
        role,
        avatarInitials: role === 'ADMIN' ? 'AA' : 'AS',
      };
    }
  } catch (err) {
    console.warn('Session retrieval in RootLayout:', err);
  }

  return (
    <html lang="en" className="h-full bg-[#050A14] text-slate-100 antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#050A14] text-slate-100" suppressHydrationWarning>
        <StoreProvider initialUser={initialUser}>
          {children}
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}

