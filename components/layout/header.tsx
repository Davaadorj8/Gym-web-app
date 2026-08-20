'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setActiveTab } from '@/features/ui/uiSlice';
import {
  Menu,
  Database,
  GitBranch,
  Zap,
  Activity,
  Clock,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export default function Header() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard & Operations Overview';
      case 'registration':
        return 'Athlete Registration & Plan Selection';
      case 'check-in-desk':
        return 'Front Desk & Express Check-In Terminal';
      case 'analytics':
        return 'Performance & Revenue Analytics';
      case 'inventory':
        return 'Pro Shop & Gym Supplies Inventory';
      case 'admin-panel':
        return 'Admin Governance & Authorizations';
      case 'clients':
        return 'Client Management';
      case 'workouts':
        return 'Program Library & Builder';
      case 'tech-stack':
        return 'Tech Stack & Architecture Console';
      default:
        return 'Arche Gym';
    }
  };

  return (
    <header
      id="arche-header"
      className="h-16 border-b border-[#142644] bg-[#050A14]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20"
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
        {/* Real-Time Sync Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#142644] bg-[#0A1324] text-[11px] text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="font-mono">Live Sync (RFID &amp; Web)</span>
        </div>

        {/* Database Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-xs font-bold">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Quick New Registration Shortcut */}
        {activeTab !== 'registration' && (
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('registration'))}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:bg-lime-300 transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Enroll Athlete</span>
          </button>
        )}
      </div>
    </header>
  );
}
