'use client';

import React, { useState } from 'react';
import { Locker } from '../types/locker.types';
import { RegisteredMember, ActiveCheckIn } from '@/features/gym/gymSlice';
import {
  Lock,
  Unlock,
  Wrench,
  X,
  User,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface LockerActionDialogProps {
  isOpen: boolean;
  locker: Locker | null;
  registeredMembers: RegisteredMember[];
  activeCheckIns: ActiveCheckIn[];
  onClose: () => void;
  onAssign: (lockerId: string, memberId: string, memberName: string, durationMinutes: number) => void;
  onRelease: (lockerId: string) => void;
  onToggleMaintenance: (lockerId: string, reason?: string) => void;
}

export const LockerActionDialog: React.FC<LockerActionDialogProps> = ({
  isOpen,
  locker,
  registeredMembers,
  activeCheckIns,
  onClose,
  onAssign,
  onRelease,
  onToggleMaintenance,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [maintReason, setMaintReason] = useState('');

  if (!isOpen || !locker) return null;

  const isOccupied = locker.status === 'OCCUPIED' || locker.status === 'OVERDUE';
  const isMaintenance = locker.status === 'MAINTENANCE';

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const member = registeredMembers.find((m) => m.id === selectedMemberId);
    const memberName = member ? `${member.firstName} ${member.lastName}` : 'Athlete';
    onAssign(locker.id, selectedMemberId, memberName, durationMinutes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0A1324] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {isOccupied ? <Lock className="w-5 h-5" /> : isMaintenance ? <Wrench className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-mono">
                  Locker #{locker.number.toString().padStart(2, '0')}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {locker.gender} ZONE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Status: <span className="font-bold text-white uppercase">{locker.status}</span> • Size: {locker.size}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on state */}
        <div className="py-5 space-y-4">
          {isOccupied ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#070E1C] p-4 space-y-2">
                <div className="text-xs text-slate-400">Currently Assigned To:</div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>{locker.assignedMemberName}</span>
                  </div>
                  {locker.pinCode && (
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>PIN: {locker.pinCode}</span>
                    </div>
                  )}
                </div>

                {locker.expiresAt && (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Assigned Expiry: {new Date(locker.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onRelease(locker.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Release / Free Locker</span>
                </button>
              </div>
            </div>
          ) : isMaintenance ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Locker Under Maintenance</span>
                </div>
                <p className="text-slate-300">
                  {locker.notes || 'This locker has been temporarily flagged for mechanical inspection or cleaning.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleMaintenance(locker.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Return Locker to Available Service</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Athlete / Member to Assign <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Choose from Checked-In / Registered Athletes --</option>
                  {/* Prioritize active check-ins */}
                  {activeCheckIns.map((ci) => (
                    <option key={ci.id} value={ci.memberId}>
                      ⚡ [Active Floor] {ci.memberName} ({ci.regId})
                    </option>
                  ))}
                  {/* Other registered members */}
                  {registeredMembers
                    .filter((m) => !activeCheckIns.some((ci) => ci.memberId === m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.regId})
                      </option>
                    ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Usage Time Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '2 Hours (120m)', val: 120 },
                    { label: '3 Hours (180m)', val: 180 },
                    { label: 'Full Day (480m)', val: 480 },
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      type="button"
                      onClick={() => setDurationMinutes(dur.val)}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition border cursor-pointer ${
                        durationMinutes === dur.val
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                          : 'bg-[#070E1C] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maintenance toggle option */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onToggleMaintenance(locker.id, 'Routine maintenance inspection')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Flag for Maintenance</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedMemberId}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Assign Locker</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockerActionDialog;
