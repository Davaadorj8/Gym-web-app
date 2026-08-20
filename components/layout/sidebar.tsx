'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTab, NavigationTab, showToast } from '@/features/ui/uiSlice';
import {
  LayoutDashboard,
  UserPlus,
  UserCheck,
  BarChart3,
  Package,
  ShieldCheck,
  Zap,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'registration', label: 'Registration', icon: UserPlus, badge: 'New' },
    { id: 'check-in-desk', label: 'Check-in Desk', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'admin-panel', label: 'Admin Panel', icon: ShieldCheck },
  ];

  if (!isSidebarOpen) return null;

  const handleCheckInQuick = () => {
    dispatch(setActiveTab('check-in-desk'));
    dispatch(showToast({ message: 'Opened Check-in Desk terminal', type: 'info' }));
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
          <div className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase px-3 mb-2 font-mono">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
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

      {/* Footer User Profile & System Status */}
      <div className="p-3 border-t border-[#142644] space-y-2">
        <div className="p-3 bg-[#0A1324] border border-[#142644] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              AO
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                Arche Owner (Admin)
              </div>
              <div className="text-[10px] text-lime-400 flex items-center gap-1 font-medium mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                Owner (Admin)
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch(showToast({ message: 'Session active', type: 'info' }))}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#142644] transition-colors"
            title="Account Menu"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
