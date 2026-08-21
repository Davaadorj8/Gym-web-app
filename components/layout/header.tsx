'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/features/ui/uiSlice';
import {
  Menu,
  Database,
  LogOut,
  UserPlus,
  Zap,
} from 'lucide-react';
import QuickCheckOutModal from '@/components/desk/quick-checkout-modal';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const user = useAppSelector((state) => state.auth.user);
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState(false);

  // Dynamic route title
  const getPageTitle = () => {
    if (pathname.startsWith('/desk')) return 'Front Desk & Express Check-In Terminal';
    if (pathname.startsWith('/dashboard')) return 'Dashboard & Operations Overview';
    if (pathname.startsWith('/registration')) return 'Athlete Registration & Plan Selection';
    if (pathname.startsWith('/clients/')) return 'Athlete Profile & Training Record';
    if (pathname.startsWith('/clients')) return 'Member Directory & Profiles';
    if (pathname.startsWith('/lockers')) return 'Facility Locker Hub';
    if (pathname.startsWith('/workouts')) return 'Workout Routine Builder';
    if (pathname.startsWith('/inventory')) return 'Inventory & Point of Sale';
    if (pathname.startsWith('/analytics')) return 'Performance & Revenue Analytics';
    if (pathname.startsWith('/admin')) return 'Admin Governance & Authorizations';
    return 'Titan Arche Gym Suite';
  };

  return (
    <>
      <header
        id="arche-header"
        className="h-16 border-b border-[#142644] bg-[#050A14]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0A1324] transition-colors cursor-pointer"
            title="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Register / Add Member Button */}
          <button
            type="button"
            onClick={() => router.push('/registration')}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Athlete</span>
          </button>

          {/* Database Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold font-mono">
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL</span>
          </div>

          {/* Quick Check Out Button */}
          <button
            id="btn-quick-check-out"
            type="button"
            onClick={() => setIsQuickCheckoutOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 text-xs font-extrabold transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)] cursor-pointer"
            title="Quick Member Check-Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Check Out</span>
            {activeCheckIns.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500/30 text-white text-[10px] font-mono font-bold">
                {activeCheckIns.length}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-xs font-bold text-white shadow">
              {user?.avatarInitials || 'AD'}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Check Out Modal */}
      <QuickCheckOutModal
        isOpen={isQuickCheckoutOpen}
        onClose={() => setIsQuickCheckoutOpen(false)}
      />
    </>
  );
};

export default Header;
