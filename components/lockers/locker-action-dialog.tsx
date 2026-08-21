'use client';

import React, { useState, useEffect } from 'react';
import { X, KeyRound, User, Clock, AlertTriangle, Sparkles, Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';

export type LockerStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';

export interface Locker {
  id: string;
  number: string;
  zone: 'MEN' | 'WOMEN' | 'VIP' | 'STAFF';
  status: LockerStatus;
  occupantName?: string;
  occupantId?: string;
  assignedAt?: string;
  notes?: string;
}

interface LockerActionDialogProps {
  locker: Locker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (lockerId: string, status: LockerStatus, notes?: string) => void;
  onAssignLocker: (lockerId: string, memberName: string, memberId: string) => void;
  onReleaseLocker: (lockerId: string) => void;
}

const LockerActionDialogContent: React.FC<{
  locker: Locker;
  onClose: () => void;
  onUpdateStatus: (lockerId: string, status: LockerStatus, notes?: string) => void;
  onAssignLocker: (lockerId: string, memberName: string, memberId: string) => void;
  onReleaseLocker: (lockerId: string) => void;
}> = ({ locker, onClose, onUpdateStatus, onAssignLocker, onReleaseLocker }) => {
  const [assignName, setAssignName] = useState('');
  const [maintenanceNote, setMaintenanceNote] = useState(locker.notes || '');

  return (
    <div
      id="modal-locker-action-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[#142644] bg-[#0A1324] p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#142644] pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
              {locker.zone} Zone
            </span>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <span>Locker #{locker.number}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Info */}
        <div className="rounded-xl bg-[#070E1C] p-3.5 border border-[#142644]/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Current Status:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                locker.status === 'AVAILABLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : locker.status === 'OCCUPIED'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : locker.status === 'CLEANING'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {locker.status}
            </span>
          </div>

          {locker.status === 'OCCUPIED' && (
            <div className="pt-2 border-t border-[#142644]/50 space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Occupant:</span>
                <strong className="text-white">{locker.occupantName || 'Unknown Athlete'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Assigned:</span>
                <strong className="text-slate-200">{locker.assignedAt || 'Just now'}</strong>
              </div>
            </div>
          )}

          {(locker.status === 'MAINTENANCE' || locker.status === 'CLEANING') && locker.notes && (
            <div className="pt-2 border-t border-[#142644]/50 text-xs text-slate-300">
              <span className="text-slate-400">Note:</span> {locker.notes}
            </div>
          )}
        </div>

        {/* Action Controls based on Status */}
        <div className="space-y-4 pt-1">
          {locker.status === 'AVAILABLE' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign to Athlete
                </label>
                <input
                  type="text"
                  placeholder="Search member name or athlete ID..."
                  value={assignName}
                  onChange={(e) => setAssignName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!assignName.trim()}
                  onClick={() => {
                    onAssignLocker(locker.id, assignName, 'temp-id');
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-xs font-extrabold text-black hover:bg-cyan-400 disabled:opacity-40 transition cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  Confirm Assignment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(locker.id, 'MAINTENANCE', 'Out of service');
                    onClose();
                  }}
                  className="rounded-xl bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-700 border border-amber-500/30 transition cursor-pointer"
                >
                  Flag Issue
                </button>
              </div>
            </div>
          )}

          {locker.status === 'OCCUPIED' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onReleaseLocker(locker.id);
                  onClose();
                }}
                className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-extrabold text-white hover:bg-rose-500 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Release Locker &amp; Free Space</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(locker.id, 'CLEANING');
                  onClose();
                }}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Mark for Disinfection / Cleaning</span>
              </button>
            </div>
          )}

          {(locker.status === 'MAINTENANCE' || locker.status === 'CLEANING') && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Maintenance / Cleaning Notes
                </label>
                <input
                  type="text"
                  value={maintenanceNote}
                  onChange={(e) => setMaintenanceNote(e.target.value)}
                  placeholder="e.g. Sanitized and latch repaired"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(locker.id, 'AVAILABLE', maintenanceNote || 'Ready & Cleaned');
                  onClose();
                }}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-black hover:bg-emerald-400 shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Ready &amp; Available</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const LockerActionDialog: React.FC<LockerActionDialogProps> = (props) => {
  if (!props.isOpen || !props.locker) return null;
  return <LockerActionDialogContent key={props.locker.id} {...props} locker={props.locker} />;
};
