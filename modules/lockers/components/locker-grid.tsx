'use client';

import React from 'react';
import { Locker } from '../types/locker.types';
import {
  Lock,
  Unlock,
  Wrench,
  AlertTriangle,
  User,
  Clock,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export interface LockerGridProps {
  lockers: Locker[];
  onSelectLocker: (locker: Locker) => void;
}

export const LockerGrid: React.FC<LockerGridProps> = ({ lockers, onSelectLocker }) => {
  const getStatusVisuals = (status: Locker['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-slate-900/60 hover:bg-emerald-950/30',
          border: 'border-slate-800 hover:border-emerald-500/50',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: Unlock,
          iconColor: 'text-emerald-400',
          label: 'Available',
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-[#0A1324] hover:bg-cyan-950/40',
          border: 'border-cyan-500/40 hover:border-cyan-400',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          icon: Lock,
          iconColor: 'text-cyan-400',
          label: 'Occupied',
        };
      case 'OVERDUE':
        return {
          bg: 'bg-rose-950/20 hover:bg-rose-950/40',
          border: 'border-rose-500/60 hover:border-rose-400 animate-pulse',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: AlertTriangle,
          iconColor: 'text-rose-400',
          label: 'Overdue',
        };
      case 'MAINTENANCE':
        return {
          bg: 'bg-amber-950/20 hover:bg-amber-950/30',
          border: 'border-amber-500/40 hover:border-amber-400',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: Wrench,
          iconColor: 'text-amber-400',
          label: 'Maintenance',
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-800',
          badge: 'bg-slate-800 text-slate-400',
          icon: Lock,
          iconColor: 'text-slate-400',
          label: status,
        };
    }
  };

  if (lockers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-800 bg-[#0A1324] text-center">
        <ShieldAlert className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="text-sm font-bold text-white">No Lockers Match Filter</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Try clearing your search query or switching zone/status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {lockers.map((locker) => {
        const visual = getStatusVisuals(locker.status);
        const IconComponent = visual.icon;

        return (
          <button
            key={locker.id}
            type="button"
            onClick={() => onSelectLocker(locker)}
            className={`flex flex-col justify-between p-3.5 rounded-2xl border ${visual.border} ${visual.bg} transition-all duration-150 text-left group cursor-pointer shadow-md hover:shadow-cyan-950/20 hover:-translate-y-0.5`}
          >
            {/* Header: Locker Number + Icon */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  {locker.gender === 'MALE'
                    ? 'M-ZONE'
                    : locker.gender === 'FEMALE'
                    ? 'W-ZONE'
                    : 'UNISEX'}
                </span>
                <div className="text-xl font-black font-mono text-white tracking-tight group-hover:text-cyan-300">
                  #{locker.number.toString().padStart(2, '0')}
                </div>
              </div>

              <div className={`p-1.5 rounded-lg bg-slate-950/60 ${visual.iconColor} border border-slate-800`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Details / Member Name */}
            <div className="my-2.5 min-h-[32px] flex flex-col justify-center">
              {locker.status === 'OCCUPIED' || locker.status === 'OVERDUE' ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-200 truncate">
                    <User className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{locker.assignedMemberName || 'Athlete'}</span>
                  </div>
                  {locker.expiresAt && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{new Date(locker.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>
              ) : locker.status === 'MAINTENANCE' ? (
                <span className="text-[10px] font-mono text-amber-400/90 italic truncate">
                  {locker.notes || 'Service in progress'}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500">
                  Ready for assignment
                </span>
              )}
            </div>

            {/* Footer: Status Badge + Pin info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${visual.badge}`}>
                {visual.label}
              </span>
              {locker.pinCode && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <KeyRound className="w-2.5 h-2.5 text-cyan-400" />
                  <span>PIN</span>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LockerGrid;
