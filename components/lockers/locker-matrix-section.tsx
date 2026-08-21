'use client';

import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { LockerItem } from '@/features/gym/gymSlice';
import {
  KeyRound,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  User,
  Clock,
  Sparkles,
  Sliders,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import LockerEditorModal from './locker-editor-modal';

export default function LockerMatrixSection() {
  const dispatch = useAppDispatch();
  const lockers = useAppSelector((state) => state.gym.lockers);
  const facility = useAppSelector((state) => state.gym.facility);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'OVERDUE' | 'MAINTENANCE'
  >('ALL');

  const [selectedLocker, setSelectedLocker] = useState<LockerItem | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

  // Metrics calculations
  const totalCount = facility.lockersTotal || lockers.length || 50;
  const occupiedList = useMemo(
    () => lockers.filter((l) => l.status === 'OCCUPIED'),
    [lockers]
  );
  const occupiedCount = occupiedList.length;

  const overdueList = useMemo(() => {
    return lockers.filter((l) => l.isOverdue);
  }, [lockers]);

  const overdueCount = overdueList.length;

  const maintenanceList = useMemo(
    () =>
      lockers.filter(
        (l) => l.status === 'MAINTENANCE' || l.status === 'OUT_OF_SERVICE'
      ),
    [lockers]
  );
  const maintenanceCount = maintenanceList.length;

  const availableCount = Math.max(
    0,
    totalCount - occupiedCount - maintenanceCount
  );

  // Filtered Lockers for Matrix Grid
  const filteredLockers = useMemo(() => {
    return lockers.filter((l) => {
      const isLockerOverdue = !!l.isOverdue;

      if (statusFilter === 'AVAILABLE' && l.status !== 'AVAILABLE') return false;
      if (statusFilter === 'OCCUPIED' && l.status !== 'OCCUPIED') return false;
      if (statusFilter === 'OVERDUE' && !isLockerOverdue) return false;
      if (
        statusFilter === 'MAINTENANCE' &&
        l.status !== 'MAINTENANCE' &&
        l.status !== 'OUT_OF_SERVICE'
      )
        return false;

      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      const numMatch = String(l.number).includes(q);
      const nameMatch = (l.occupiedByMemberName || '').toLowerCase().includes(q);
      const regMatch = (l.occupiedByRegId || '').toLowerCase().includes(q);
      const reasonMatch = (l.inactiveReason || '').toLowerCase().includes(q);

      return numMatch || nameMatch || regMatch || reasonMatch;
    });
  }, [lockers, statusFilter, searchFilter]);

  const handleOpenEditor = (locker: LockerItem) => {
    setSelectedLocker(locker);
    setIsEditorModalOpen(true);
  };

  return (
    <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 shadow-xl space-y-6">
      {/* 1. TOP SECTION: High-Level Locker Metrics */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-lime-400" />
              <span>Facility Locker Management &amp; Staff Control</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live key availability, occupancy monitoring &amp; inactive status controls
            </p>
          </div>
          <span className="text-xs font-mono text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            {availableCount} of {totalCount} Lockers Ready
          </span>
        </div>

        {/* 5-Column Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Capacity */}
          <div className="bg-[#070E1C] border border-[#142644] rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              TOTAL CAPACITY
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">
                {totalCount}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Lockers</span>
            </div>
          </div>

          {/* Available Units */}
          <div className="bg-[#070E1C] border border-lime-500/30 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-lime-400/5 rounded-full blur-xl pointer-events-none" />
            <span className="text-[10px] font-mono uppercase text-lime-400 tracking-wider font-bold">
              AVAILABLE FREE
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-lime-400 font-mono">
                {availableCount}
              </span>
              <span className="text-[11px] font-mono text-lime-400/80">
                {Math.round((availableCount / totalCount) * 100)}%
              </span>
            </div>
          </div>

          {/* Occupied In-Gym */}
          <div className="bg-[#070E1C] border border-cyan-500/30 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-bold">
              ACTIVE OCCUPANTS
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {occupiedCount}
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80">In-Gym</span>
            </div>
          </div>

          {/* Inactive / Maintenance */}
          <div className="bg-[#070E1C] border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-bold">
              INACTIVE / REPAIR
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {maintenanceCount}
              </span>
              <span className="text-[11px] font-mono text-amber-400/80">
                Broken/Dirty
              </span>
            </div>
          </div>

          {/* Overdue Past Midnight Alerts */}
          <div
            className={`rounded-xl p-3.5 flex flex-col justify-between border ${
              overdueCount > 0
                ? 'bg-rose-950/20 border-rose-500/50 text-rose-300'
                : 'bg-[#070E1C] border-[#142644] text-slate-400'
            }`}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                overdueCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              OVERDUE (00:00)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl font-black font-mono ${
                  overdueCount > 0 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {overdueCount}
              </span>
              <span
                className={`text-[11px] font-mono ${
                  overdueCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'
                }`}
              >
                {overdueCount > 0 ? 'Action Needed' : 'All Clear'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROMINENT OVERDUE ALERT BANNER (If overdue exists) */}
      {overdueList.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Attention: {overdueList.length} Locker Key(s) Unreturned Past
                00:00 Midnight
              </h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Lockers: {overdueList.map((l) => `#${l.number}`).join(', ')} —
                Occupant did not check out before shift closure. Staff action
                required.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenEditor(overdueList[0])}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-black rounded-lg transition-colors shrink-0 shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Resolve Locker #{overdueList[0].number}</span>
          </button>
        </div>
      )}

      {/* 3. LOCKER MATRIX & STAFF CONTROLS */}
      <div className="space-y-4 pt-2">
        {/* Matrix Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070E1C] p-3 rounded-xl border border-[#142644]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-lime-400 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({lockers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-lime-400 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OCCUPIED')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                statusFilter === 'OCCUPIED'
                  ? 'bg-lime-400 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Occupied ({occupiedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OVERDUE')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                statusFilter === 'OVERDUE'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('MAINTENANCE')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                statusFilter === 'MAINTENANCE'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Maintenance ({maintenanceCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search locker or member"
              className="w-full bg-[#0A1324] border border-[#142644] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 font-medium"
            />
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 max-h-[380px] overflow-y-auto p-1">
          {filteredLockers.map((locker) => {
            const isLockerOverdue = !!locker.isOverdue;

            const isOccupied = locker.status === 'OCCUPIED';
            const isMaint =
              locker.status === 'MAINTENANCE' ||
              locker.status === 'OUT_OF_SERVICE';

            return (
              <button
                key={locker.number}
                type="button"
                onClick={() => handleOpenEditor(locker)}
                className={`relative rounded-xl p-2.5 flex flex-col items-center justify-between border text-center transition-all group cursor-pointer min-h-[76px] ${
                  isLockerOverdue
                    ? 'bg-rose-950/40 border-rose-500 text-rose-200 hover:bg-rose-900/50 shadow-lg shadow-rose-950/40'
                    : isOccupied
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40'
                    : isMaint
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 hover:border-amber-400'
                    : 'bg-[#070E1C] border-[#142644] text-slate-300 hover:border-lime-400/60 hover:bg-[#0E1A30]'
                }`}
                title={`Locker #${locker.number} - Click to change status or resolve`}
              >
                {/* Top Number */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[10px] text-slate-500 group-hover:text-slate-400">
                    KEY
                  </span>
                  <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                </div>

                <div className="font-mono font-black text-sm my-0.5">
                  #{locker.number < 10 ? `0${locker.number}` : locker.number}
                </div>

                {/* Status Indicator */}
                {isLockerOverdue ? (
                  <span className="text-[9px] font-mono font-bold text-rose-400 flex items-center gap-0.5 truncate max-w-full">
                    <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                    <span>00:00</span>
                  </span>
                ) : isOccupied ? (
                  <span className="text-[9px] font-mono text-cyan-400 truncate max-w-full font-semibold">
                    {locker.occupiedByMemberName?.split(' ')[0] || 'In-Use'}
                  </span>
                ) : isMaint ? (
                  <span className="text-[9px] font-mono text-amber-400 truncate max-w-full">
                    Maint.
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-lime-400">Free</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#142644] text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-lime-400 border border-lime-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400 border border-cyan-300" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-400" />
              <span>Overdue (&gt; 00:00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-300" />
              <span>Inactive / Maint.</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            Tip: Click any locker card to toggle Active/Inactive with reason or resolve overdue key
          </span>
        </div>
      </div>

      {/* Modal */}
      <LockerEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setSelectedLocker(null);
        }}
        locker={selectedLocker}
      />
    </div>
  );
}
