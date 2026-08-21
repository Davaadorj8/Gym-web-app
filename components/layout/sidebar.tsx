'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTab, NavigationTab, showToast } from '@/features/ui/uiSlice';
import { setRole } from '@/features/auth/authSlice';
import {
  LayoutDashboard,
  UserPlus,
  UserCheck,
  BarChart3,
  Package,
  ShieldCheck,
  Zap,
  ChevronRight,
  Shield,
  UserCog,
} from 'lucide-react';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER';

  const allNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    adminOnly?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registration', label: 'Registration', icon: UserPlus, badge: 'New' },
    { id: 'check-in-desk', label: 'Check-in Desk', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'admin-panel', label: 'Admin Panel', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNavItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  if (!isSidebarOpen) return null;

  const handleCheckInQuick = () => {
    dispatch(setActiveTab('check-in-desk'));
    dispatch(showToast({ message: 'Opened Check-in Desk terminal', type: 'info' }));
  };

  const toggleRole = () => {
    const nextRole = isAdmin ? 'STAFF' : 'ADMIN';
    dispatch(setRole(nextRole));
    if (nextRole === 'STAFF' && (activeTab === 'admin-panel' || activeTab === 'analytics')) {
      dispatch(setActiveTab('dashboard'));
    }
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
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-[#142644]/80">
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
        </div>

        {/* Global CTA Check In Member */}
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={handleCheckInQuick}
            className="w-full py-3 px-4 bg-lime-400 hover:bg-lime-300 active:scale-[0.98] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black stroke-black" />
            <span>Check In Member</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-3">
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
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => dispatch(setActiveTab(item.id))}
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
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-lime-400" />}
                </button>
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
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#142644] transition-colors flex items-center gap-1"
            title={`Switch to ${isAdmin ? 'STAFF' : 'ADMIN'} role`}
          >
            <UserCog className="w-4 h-4 text-slate-300 hover:text-lime-400 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}

