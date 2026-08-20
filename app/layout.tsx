import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/components/providers/store-provider';
import Toast from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'Arche Gym — Ironpulse Management Portal',
  description: 'Scalable full-stack SaaS platform for gym access management, member registrations, locker bay control, and real-time telemetry.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#050A14] text-slate-100 antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#050A14] text-slate-100" suppressHydrationWarning>
        <StoreProvider>
          {children}
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
