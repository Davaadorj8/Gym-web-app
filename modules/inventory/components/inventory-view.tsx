'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast } from '@/features/ui/uiSlice';
import {
  Package,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Layers,
  Sparkles,
  Bell,
} from 'lucide-react';
import LockerHubView from '@/components/lockers/locker-hub-view';
import StaffNotificationsSection from '@/components/staff/staff-notifications-section';

export default function InventoryView() {
  const dispatch = useAppDispatch();
  const [activeSection, setActiveSection] = useState<'LOCKERS' | 'NOTIFICATIONS'>('LOCKERS');

  return (
    <div className="space-y-6">
      {/* View Header with Section Switcher */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Facility Inventory &amp; Locker Asset Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time locker key matrix tracking, staff action authorizations &amp; notifications
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-[#070E1C] p-1.5 rounded-xl border border-[#142644] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSection('LOCKERS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeSection === 'LOCKERS'
                ? 'bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Unified Locker Hub</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('NOTIFICATIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeSection === 'NOTIFICATIONS'
                ? 'bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Staff Notification</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: UNIFIED LOCKER HUB */}
      {activeSection === 'LOCKERS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <LockerHubView />
        </div>
      )}

      {/* SECTION 2: STAFF NOTIFICATIONS & ACTION AUTHORIZATIONS */}
      {activeSection === 'NOTIFICATIONS' && (
        <StaffNotificationsSection />
      )}
    </div>
  );
}
