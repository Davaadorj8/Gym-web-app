'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRole } from '@/features/auth/authSlice';
import { showToast } from '@/features/ui/uiSlice';
import {
  UserCheck,
  Users,
  KeyRound,
  Dumbbell,
  Package,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  UserPlus,
  Zap,
  ChevronRight,
  UserCog,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'desk', label: 'Front Desk', href: '/desk', icon: UserCheck },
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Members Directory', href: '/clients', icon: Users },
  { id: 'lockers', label: 'Locker Hub', href: '/lockers', icon: KeyRound },
  { id: 'workouts', label: 'Workouts', href: '/workouts', icon: Dumbbell },
  { id: 'registration', label: 'Registration', href: '/registration', icon: UserPlus, badge: 'New' },
  { id: 'inventory', label: 'Inventory & POS', href: '/inventory', icon: Package },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, adminOnly: true },
  { id: 'admin', label: 'Admin & Staff', href: '/admin', icon: ShieldCheck, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER';

  if (!isSidebarOpen) return null;

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const toggleRole = () => {
    const nextRole = isAdmin ? 'STAFF' : 'ADMIN';
    dispatch(setRole(nextRole));
    dispatch(
      showToast({
        message: `Active role switched to: ${nextRole}`,
        type: nextRole === 'ADMIN' ? 'success' : 'info',
      })
    );
  };

  return (
    <aside
      id="arche-sidebar"
      className="w-64 bg-[#050A14] border-r border-[#142644] flex flex-col justify-between shrink-0 select-none min-h-screen z-30 transition-all"
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <Link href="/dashboard" className="p-5 flex items-center gap-3 border-b border-[#142644]/80 hover:bg-slate-900/40 transition">
          <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(163,230,53,0.35)] shrink-0">
            <Zap className="w-6 h-6 fill-black stroke-black" />
          </div>
          <div>
            <div className="font-extrabold text-white tracking-tight text-base leading-tight">
              Arche Gym
            </div>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              IRONPULSE MANAGEMENT
            </div>
          </div>
        </Link>

        {/* Global CTA Check In Member */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/desk"
            className="w-full py-3 px-4 bg-lime-400 hover:bg-lime-300 active:scale-[0.98] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black stroke-black" />
            <span>Check In Member</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-3 flex-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase font-mono">
              Navigation Menu
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                isAdmin
                  ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                  : 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
              }`}
            >
              {role} VIEW
            </span>
          </div>
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0E1E38] text-lime-400 border border-lime-400/40 shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-[#0A1324]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-lime-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300 font-mono">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-lime-400" />}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer User Profile & RBAC Switcher */}
      <div className="p-3 border-t border-[#142644] space-y-2">
        <div className="p-3 bg-[#0A1324] border border-[#142644] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                isAdmin
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {user?.avatarInitials || (isAdmin ? 'AA' : 'AS')}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                {user?.name || (isAdmin ? 'Arche Admin' : 'Arche Staff')}
              </div>
              <div
                className={`text-[10px] flex items-center gap-1 font-medium mt-0.5 ${
                  isAdmin ? 'text-lime-400' : 'text-cyan-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isAdmin ? 'bg-lime-400' : 'bg-cyan-400'
                  }`}
                ></span>
                {isAdmin ? 'Admin (Supervisor)' : 'Staff Member'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleRole}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#142644] transition-colors flex items-center gap-1 cursor-pointer"
            title={`Switch to ${isAdmin ? 'STAFF' : 'ADMIN'} role`}
          >
            <UserCog className="w-4 h-4 text-slate-300 hover:text-lime-400 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
