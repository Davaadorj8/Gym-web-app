'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  LockerItem,
  updateLockerState,
  resolveOverdueLocker,
  LockerStatus,
} from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import {
  KeyRound,
  X,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Sparkles,
  User,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface LockerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  locker: LockerItem | null;
}

export default function LockerEditorModal({
  isOpen,
  onClose,
  locker,
}: LockerEditorModalProps) {
  const dispatch = useAppDispatch();
  const loggedInStaff = useAppSelector((state) => state.auth.user);
  const staffInitials = loggedInStaff
    ? `${loggedInStaff.name.split(' ')[0]?.[0] || ''}${loggedInStaff.name.split(' ')[1]?.[0] || ''}`.toUpperCase()
    : 'AD';

  const defaultActionTab = locker?.isOverdue ? 'OVERDUE' : 'STATUS';
  const defaultTargetStatus: LockerStatus =
    locker?.status === 'MAINTENANCE' || locker?.status === 'OUT_OF_SERVICE'
      ? 'AVAILABLE'
      : 'MAINTENANCE';

  const [activeActionTab, setActiveActionTab] = useState<'STATUS' | 'OVERDUE'>(
    defaultActionTab
  );

  // Status Change State
  const [targetStatus, setTargetStatus] = useState<LockerStatus>(defaultTargetStatus);
  const [inactiveReason, setInactiveReason] = useState<string>('Key not returned');
  const [activeReason, setActiveReason] = useState<string>('Fixed / Repaired');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Overdue Resolution State
  const [overdueActionType, setOverdueActionType] = useState<
    'FORCE_CHECKOUT' | 'FLAG_KEY_LOST'
  >('FORCE_CHECKOUT');
  const [overdueReason, setOverdueReason] = useState<string>(
    'Member left without checking out - key recovered by staff'
  );
  const [overdueNotes, setOverdueNotes] = useState<string>('');

  if (!isOpen || !locker) return null;

  const isCurrentlyOccupied = locker.status === 'OCCUPIED';
  const isOverdue = !!locker.isOverdue;

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonToUse =
      targetStatus === 'AVAILABLE' ? activeReason : inactiveReason;

    dispatch(
      updateLockerState({
        lockerNumber: locker.number,
        status: targetStatus,
        reason: reasonToUse,
        notes: customNotes.trim() || undefined,
        staffLogged: staffInitials,
      })
    );

    dispatch(
      showToast({
        message: `Locker #${locker.number < 10 ? '0' : ''}${locker.number} status updated to ${targetStatus} (${reasonToUse})`,
        type: 'success',
      })
    );
    onClose();
  };

  const handleResolveOverdue = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      resolveOverdueLocker({
        lockerNumber: locker.number,
        actionType: overdueActionType,
        reason: overdueReason,
        notes: overdueNotes.trim() || undefined,
        staffLogged: staffInitials,
      })
    );

    dispatch(
      showToast({
        message: `Overdue Locker #${locker.number < 10 ? '0' : ''}${locker.number} resolved successfully.`,
        type: 'success',
      })
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0A1324] border border-[#1E3A5F] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#070E1C] border-b border-[#142644] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-mono tracking-tight">
                  LOCKER #{locker.number < 10 ? `0${locker.number}` : locker.number}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    locker.status === 'AVAILABLE'
                      ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                      : locker.status === 'OCCUPIED'
                      ? isOverdue
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                      : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                  }`}
                >
                  {isOverdue ? 'OVERDUE (PAST 00:00)' : locker.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff Control &amp; Key Lifecycle Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#142644] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Current Occupant Details (if occupied) */}
          {isCurrentlyOccupied && (
            <div
              className={`p-4 rounded-xl border ${
                isOverdue
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : 'bg-[#070E1C] border-[#142644] text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    CURRENT ATHLETE OCCUPANT
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-lime-400" />
                    <span className="font-extrabold text-white text-sm">
                      {locker.occupiedByMemberName || 'Registered Member'}
                    </span>
                    {locker.occupiedByRegId && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-slate-300 rounded">
                        {locker.occupiedByRegId}
                      </span>
                    )}
                  </div>
                  {locker.assignedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Issued:{' '}
                        {new Date(locker.assignedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {isOverdue && (
                  <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    PAST 00:00
                  </span>
                )}
              </div>

              {locker.overdueReason && (
                <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-xs text-rose-300">
                  <span className="font-bold">Overdue Alert:</span> {locker.overdueReason}
                </div>
              )}
            </div>
          )}

          {/* Current Inactive Reason if in maintenance */}
          {locker.status === 'MAINTENANCE' && locker.inactiveReason && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold font-mono">
                <Wrench className="w-4 h-4" />
                <span>INACTIVE REASON RECORDED</span>
              </div>
              <p className="text-slate-300">{locker.inactiveReason}</p>
              {locker.inactiveNotes && (
                <p className="text-[11px] text-slate-400 italic">
                  Notes: {locker.inactiveNotes}
                </p>
              )}
            </div>
          )}

          {/* Tab Selection if Overdue */}
          {isOverdue && (
            <div className="flex gap-2 p-1 bg-[#070E1C] rounded-xl border border-[#142644]">
              <button
                type="button"
                onClick={() => setActiveActionTab('OVERDUE')}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'OVERDUE'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Resolve Overdue Key (00:00)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveActionTab('STATUS')}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'STATUS'
                    ? 'bg-lime-400 text-black shadow-lg font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Manual Status Edit</span>
              </button>
            </div>
          )}

          {/* OVERDUE RESOLUTION FORM */}
          {activeActionTab === 'OVERDUE' && isOverdue ? (
            <form onSubmit={handleResolveOverdue} className="space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Overdue Member Intervention</p>
                  <p className="mt-0.5 text-slate-300">
                    This locker remained occupied past the 00:00 midnight shift. Staff
                    must input a resolution reason to update all occupation, check-in,
                    and key logs.
                  </p>
                </div>
              </div>

              {/* Action Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Action Taken by Reception
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverdueActionType('FORCE_CHECKOUT')}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      overdueActionType === 'FORCE_CHECKOUT'
                        ? 'bg-lime-400/15 border-lime-400 text-lime-300 shadow-md ring-1 ring-lime-400/30'
                        : 'bg-[#070E1C] border-[#142644] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-lime-400" />
                      <span>Reclaim &amp; Make Available</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Check out member &amp; return key to rack
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverdueActionType('FLAG_KEY_LOST')}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      overdueActionType === 'FLAG_KEY_LOST'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-[#070E1C] border-[#142644] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Flag Key Lost / Inactive</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Lock marked maintenance until replaced
                    </span>
                  </button>
                </div>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Select Reason for Action
                </label>
                <select
                  value={overdueReason}
                  onChange={(e) => setOverdueReason(e.target.value)}
                  className="w-full bg-[#070E1C] border border-[#1E3A5F] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400 font-medium"
                >
                  <option value="Member left without checking out - key recovered by staff">
                    Member left without checking out - key recovered by staff
                  </option>
                  <option value="Key kept overnight - return confirmed with athlete">
                    Key kept overnight - return confirmed with athlete
                  </option>
                  <option value="Key lost by athlete - replacement lock in progress">
                    Key lost by athlete - replacement lock in progress
                  </option>
                  <option value="Locker cleared by reception - contents placed in Lost & Found">
                    Locker cleared by reception - contents placed in Lost &amp; Found
                  </option>
                  <option value="Athlete checked out via phone / verified departure">
                    Athlete checked out via phone / verified departure
                  </option>
                </select>
              </div>

              {/* Staff Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Staff Notes &amp; Observations (Optional)
                </label>
                <textarea
                  value={overdueNotes}
                  onChange={(e) => setOverdueNotes(e.target.value)}
                  placeholder="e.g. Locker inspected at 00:30 by night supervisor. Free of personal items."
                  rows={2}
                  className="w-full bg-[#070E1C] border border-[#1E3A5F] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2 border-t border-[#142644]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-mono font-bold text-slate-400 hover:text-white rounded-xl bg-[#070E1C] border border-[#142644] hover:bg-[#142644] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-mono font-black text-black bg-rose-500 hover:bg-rose-400 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Submit Action &amp; Update Roster</span>
                </button>
              </div>
            </form>
          ) : (
            /* MANUAL STATUS EDIT FORM */
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Target Status Choice */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Change Locker Status To:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('AVAILABLE')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      targetStatus === 'AVAILABLE'
                        ? 'bg-lime-400/15 border-lime-400 text-lime-300 shadow-md ring-1 ring-lime-400/30'
                        : 'bg-[#070E1C] border-[#142644] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-lime-400" />
                      <span>Active / Available</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Ready for athlete assignment
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus('MAINTENANCE')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      targetStatus === 'MAINTENANCE'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-[#070E1C] border-[#142644] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Inactive / Maintenance</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Blocked from auto assignment
                    </span>
                  </button>
                </div>
              </div>

              {/* Status Reason Selector */}
              {targetStatus === 'MAINTENANCE' ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Reason for Inactive / Maintenance
                  </label>
                  <select
                    value={inactiveReason}
                    onChange={(e) => setInactiveReason(e.target.value)}
                    className="w-full bg-[#070E1C] border border-[#1E3A5F] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400 font-medium"
                  >
                    <option value="Key not returned">Key not returned</option>
                    <option value="Key lost">Key lost</option>
                    <option value="Broken lock / door latch jammed">
                      Broken lock / door latch jammed
                    </option>
                    <option value="Dirty / Needs cleaning & sanitization">
                      Dirty / Needs cleaning &amp; sanitization
                    </option>
                    <option value="Routine inspection flagged">
                      Routine inspection flagged
                    </option>
                    <option value="Electronic RFID sensor failure">
                      Electronic RFID sensor failure
                    </option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Reason for Restoring to Active
                  </label>
                  <select
                    value={activeReason}
                    onChange={(e) => setActiveReason(e.target.value)}
                    className="w-full bg-[#070E1C] border border-[#1E3A5F] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400 font-medium"
                  >
                    <option value="Fixed / Repaired">Fixed / Repaired</option>
                    <option value="Cleaned & Sanitized">Cleaned &amp; Sanitized</option>
                    <option value="Key replaced with spare">
                      Key replaced with spare
                    </option>
                    <option value="Key returned by athlete">
                      Key returned by athlete
                    </option>
                    <option value="Routine safety inspection passed">
                      Routine safety inspection passed
                    </option>
                  </select>
                </div>
              )}

              {/* Custom Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Staff Notes &amp; Action Log (Optional)
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Lock mechanism replaced by technician. Tested 3 times."
                  rows={2}
                  className="w-full bg-[#070E1C] border border-[#1E3A5F] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-[#142644]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-mono font-bold text-slate-400 hover:text-white rounded-xl bg-[#070E1C] border border-[#142644] hover:bg-[#142644] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-mono font-black text-black bg-lime-400 hover:bg-lime-300 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Locker Status</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
