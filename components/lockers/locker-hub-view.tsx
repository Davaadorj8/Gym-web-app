'use client';

import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateLockerState, LockerStatus as GymLockerStatus } from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import { Locker, LockerStatus, LockerActionDialog } from './locker-action-dialog';
import {
  KeyRound,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  ShieldCheck,
  Grid,
  List,
  Wrench,
} from 'lucide-react';

export const LockerHubView: React.FC = () => {
  const dispatch = useAppDispatch();
  const reduxLockers = useAppSelector((state) => state.gym.lockers);
  const facility = useAppSelector((state) => state.gym.facility);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const loggedInStaff = useAppSelector((state) => state.auth.user);

  // Derive lockers from Redux store, or fallback to standard 48 lockers
  const lockers: Locker[] = useMemo(() => {
    if (reduxLockers && reduxLockers.length > 0) {
      return reduxLockers.map((l) => {
        const num = l.number;
        const numStr = num.toString().padStart(2, '0');
        let zone: Locker['zone'] = 'MEN';
        if (num > 35) zone = 'VIP';
        else if (num > 20) zone = 'WOMEN';
        else if (num > 45) zone = 'STAFF';

        let mappedStatus: LockerStatus = 'AVAILABLE';
        if (l.status === 'OCCUPIED') mappedStatus = 'OCCUPIED';
        else if (l.status === 'MAINTENANCE' || l.status === 'OUT_OF_SERVICE') mappedStatus = 'MAINTENANCE';

        return {
          id: `loc-${l.number}`,
          number: numStr,
          zone,
          status: mappedStatus,
          occupantName: l.occupiedByMemberName || undefined,
          occupantId: l.occupiedByMemberId || undefined,
          assignedAt: l.assignedAt || (l.status === 'OCCUPIED' ? 'Active' : undefined),
          notes: l.inactiveNotes || undefined,
        };
      });
    }

    // Default fallback
    return Array.from({ length: 48 }, (_, i) => {
      const num = (i + 1).toString().padStart(2, '0');
      const zone: Locker['zone'] = i < 20 ? 'MEN' : i < 38 ? 'WOMEN' : 'VIP';
      const status: LockerStatus =
        i % 5 === 0 ? 'OCCUPIED' : i % 11 === 0 ? 'MAINTENANCE' : 'AVAILABLE';
      return {
        id: `loc-${i + 1}`,
        number: num,
        zone,
        status,
        occupantName: status === 'OCCUPIED' ? `Athlete #${100 + i}` : undefined,
        assignedAt: status === 'OCCUPIED' ? '10:15 AM' : undefined,
      };
    });
  }, [reduxLockers]);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeLocker, setActiveLocker] = useState<Locker | null>(null);

  // Metrics
  const stats = useMemo(() => {
    const total = lockers.length;
    const available = lockers.filter((l) => l.status === 'AVAILABLE').length;
    const occupied = lockers.filter((l) => l.status === 'OCCUPIED').length;
    const maintenance = lockers.filter(
      (l) => l.status === 'MAINTENANCE' || l.status === 'CLEANING'
    ).length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, maintenance, occupancyRate };
  }, [lockers]);

  // Filtered Lockers
  const filteredLockers = useMemo(() => {
    return lockers.filter((locker) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        locker.number.includes(q) ||
        `locker #${locker.number}`.toLowerCase().includes(q) ||
        (locker.occupantName && locker.occupantName.toLowerCase().includes(q));
      const matchesZone = selectedZone === 'ALL' || locker.zone === selectedZone;
      const matchesStatus = selectedStatus === 'ALL' || locker.status === selectedStatus;
      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [lockers, searchQuery, selectedZone, selectedStatus]);

  // Handlers
  const handleUpdateStatus = (lockerId: string, status: LockerStatus, notes?: string) => {
    const lockerNum = parseInt(lockerId.replace('loc-', ''), 10);

    // Sync to Redux
    if (!isNaN(lockerNum)) {
      const reduxStatus: GymLockerStatus =
        status === 'AVAILABLE' ? 'AVAILABLE' : status === 'OCCUPIED' ? 'OCCUPIED' : 'MAINTENANCE';
      dispatch(
        updateLockerState({
          lockerNumber: lockerNum,
          status: reduxStatus,
          reason: notes || (status === 'CLEANING' ? 'Disinfection / Cleaning' : 'Status Update'),
          notes: notes || '',
          staffLogged: loggedInStaff?.name || 'Front Desk',
        })
      );
      dispatch(
        showToast({
          message: `Locker #${lockerNum} marked as ${status}`,
          type: status === 'AVAILABLE' ? 'success' : 'info',
        })
      );
    }
  };

  const handleAssignLocker = (lockerId: string, memberName: string) => {
    const lockerNum = parseInt(lockerId.replace('loc-', ''), 10);

    // Sync to Redux
    if (!isNaN(lockerNum)) {
      dispatch(
        updateLockerState({
          lockerNumber: lockerNum,
          status: 'OCCUPIED',
          reason: `Assigned to ${memberName}`,
          staffLogged: loggedInStaff?.name || 'Front Desk',
        })
      );
      dispatch(
        showToast({
          message: `Locker #${lockerNum} assigned to ${memberName}`,
          type: 'success',
        })
      );
    }
  };

  const handleReleaseLocker = (lockerId: string) => {
    const lockerNum = parseInt(lockerId.replace('loc-', ''), 10);

    // Sync to Redux
    if (!isNaN(lockerNum)) {
      dispatch(
        updateLockerState({
          lockerNumber: lockerNum,
          status: 'AVAILABLE',
          reason: 'Locker released and checked out',
          staffLogged: loggedInStaff?.name || 'Front Desk',
        })
      );
      dispatch(
        showToast({
          message: `Locker #${lockerNum} successfully released`,
          type: 'success',
        })
      );
    }
  };

  return (
    <div id="unified-locker-hub" className="space-y-6">
      {/* 1. Header & KPI Occupancy Bar */}
      <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.35)] shrink-0">
              <KeyRound className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Facility Lockers Hub
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live floor matrix, instant assignment, and single-click maintenance audit
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-xl border border-slate-700/80 bg-[#070E1C] px-3.5 py-1.5 text-center min-w-[70px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total</div>
              <div className="text-sm font-black text-white font-mono">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-center min-w-[80px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Available</div>
              <div className="text-sm font-black text-emerald-400 font-mono">{stats.available}</div>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Occupied</div>
              <div className="text-sm font-black text-cyan-400 font-mono">
                {stats.occupied} <span className="text-[10px] text-cyan-300 font-normal">({stats.occupancyRate}%)</span>
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-center min-w-[80px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Maintenance</div>
              <div className="text-sm font-black text-amber-400 font-mono">{stats.maintenance}</div>
            </div>
          </div>
        </div>

        {/* Occupancy Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5 font-semibold">
            <span>Floor Occupancy Rate</span>
            <span className="text-cyan-400">{stats.occupancyRate}% Capacity In-Use</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#070E1C] border border-[#142644]">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Unified Filter & Control Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#142644] bg-[#0A1324] p-4 md:flex-row md:items-center md:justify-between shadow-lg">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locker # or athlete..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
            />
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none transition"
          >
            <option value="ALL">All Zones (Men, Women, VIP)</option>
            <option value="MEN">Men&apos;s Locker Area</option>
            <option value="WOMEN">Women&apos;s Locker Area</option>
            <option value="VIP">VIP Executive Lounge</option>
            <option value="STAFF">Staff Lockers</option>
          </select>

          {/* Status Filter Tabs */}
          <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1">
            {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 p-1 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-white shadow border border-slate-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grid Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-800 text-white shadow border border-slate-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Table</span>
          </button>
        </div>
      </div>

      {/* 3. Main Display Area */}
      {viewMode === 'grid' ? (
        /* Visual Matrix */
        filteredLockers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredLockers.map((locker) => {
              const isAvailable = locker.status === 'AVAILABLE';
              const isOccupied = locker.status === 'OCCUPIED';
              const isCleaning = locker.status === 'CLEANING';

              return (
                <button
                  key={locker.id}
                  type="button"
                  onClick={() => setActiveLocker(locker)}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all hover:scale-105 hover:shadow-xl cursor-pointer ${
                    isAvailable
                      ? 'border-emerald-500/30 bg-[#071714] hover:border-emerald-400'
                      : isOccupied
                      ? 'border-cyan-500/30 bg-[#071324] hover:border-cyan-400'
                      : isCleaning
                      ? 'border-purple-500/30 bg-[#160824] hover:border-purple-400'
                      : 'border-amber-500/30 bg-[#1e1307] hover:border-amber-400'
                  }`}
                >
                  <div className="text-base sm:text-lg font-black text-white font-mono">
                    #{locker.number}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {locker.zone}
                  </div>

                  <div
                    className={`mt-2.5 h-1.5 w-6 rounded-full ${
                      isAvailable
                        ? 'bg-emerald-400'
                        : isOccupied
                        ? 'bg-cyan-400'
                        : isCleaning
                        ? 'bg-purple-400'
                        : 'bg-amber-400'
                    }`}
                  />

                  {isOccupied && locker.occupantName ? (
                    <div className="mt-2 max-w-[95%] truncate text-[10px] font-semibold text-slate-200 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                      {locker.occupantName}
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      {isAvailable ? 'Free' : locker.status}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0A1324] border border-[#142644] rounded-2xl">
            <KeyRound className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No lockers match your active filters.</p>
          </div>
        )
      ) : (
        /* Audit Table View */
        <div className="overflow-hidden rounded-2xl border border-[#142644] bg-[#0A1324] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-[#142644] bg-[#070E1C] uppercase font-mono text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Locker #</th>
                  <th className="px-5 py-3.5">Zone</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Occupant / Assignee</th>
                  <th className="px-5 py-3.5">Assigned Time</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142644]">
                {filteredLockers.map((locker) => (
                  <tr key={locker.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono font-black text-white">#{locker.number}</td>
                    <td className="px-5 py-3 font-semibold text-slate-300">{locker.zone}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
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
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-200">
                      {locker.occupantName || '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono">{locker.assignedAt || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveLocker(locker)}
                        className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Quick Action Dialog */}
      <LockerActionDialog
        locker={activeLocker}
        isOpen={Boolean(activeLocker)}
        onClose={() => setActiveLocker(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignLocker={handleAssignLocker}
        onReleaseLocker={handleReleaseLocker}
      />
    </div>
  );
};

export default LockerHubView;
