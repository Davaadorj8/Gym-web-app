'use client';

import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { LockerUsageRecord, LockerItem } from '@/features/gym/gymSlice';
import {
  Database,
  Search,
  KeyRound,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wrench,
  User,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import LockerEditorModal from './locker-editor-modal';

export default function DatabaseLockerUsageSection() {
  const lockerUsageLogs = useAppSelector((state) => state.gym.lockerUsageLogs);
  const lockers = useAppSelector((state) => state.gym.lockers);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'OCCUPIED' | 'RETURNS' | 'OVERDUE_MAINTENANCE'
  >('ALL');

  // Selected locker for modal editing
  const [selectedLocker, setSelectedLocker] = useState<LockerItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return lockerUsageLogs.filter((log) => {
      // Tab filter
      if (activeFilter === 'OCCUPIED' && log.keyStatus !== 'ACTIVE_OCCUPANT') {
        return false;
      }
      if (activeFilter === 'RETURNS' && log.keyStatus !== 'RETURNED') {
        return false;
      }
      if (
        activeFilter === 'OVERDUE_MAINTENANCE' &&
        log.keyStatus !== 'OVERDUE' &&
        log.keyStatus !== 'MAINTENANCE' &&
        log.keyStatus !== 'OUT_OF_SERVICE'
      ) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const lockerNumStr = `locker #${log.lockerNumber < 10 ? '0' : ''}${log.lockerNumber}`.toLowerCase();
      const memberNameStr = log.memberName.toLowerCase();
      const regIdStr = log.regId.toLowerCase();
      const eventStr = log.eventDescription.toLowerCase();

      return (
        lockerNumStr.includes(q) ||
        memberNameStr.includes(q) ||
        regIdStr.includes(q) ||
        eventStr.includes(q) ||
        String(log.lockerNumber).includes(q)
      );
    });
  }, [lockerUsageLogs, activeFilter, searchQuery]);

  const handleOpenLockerEditor = (lockerNum: number) => {
    const foundLocker = lockers.find((l) => l.number === lockerNum);
    if (foundLocker) {
      setSelectedLocker(foundLocker);
      setIsEditorOpen(true);
    } else {
      setSelectedLocker({
        number: lockerNum,
        status: 'AVAILABLE',
      });
      setIsEditorOpen(true);
    }
  };

  return (
    <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 shadow-xl space-y-5">
      {/* Section Header matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#142644] pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Database Locker Usage Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical record of every locker key issued &amp; returned by reception staff
            </p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({lockerUsageLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('OCCUPIED')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeFilter === 'OCCUPIED'
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Occupied
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('RETURNS')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeFilter === 'RETURNS'
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Returns
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('OVERDUE_MAINTENANCE')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeFilter === 'OVERDUE_MAINTENANCE'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overdue / Alerts
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Locker #, Member, or Reg"
              className="w-full bg-[#070E1C] border border-[#142644] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition-colors font-medium"
            />
          </div>
        </div>
      </div>

      {/* Table matching provided screenshot */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#142644] text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="pb-3.5 font-bold pl-2">LOCKER KEY #</th>
              <th className="pb-3.5 font-bold">ATHLETE / MEMBER</th>
              <th className="pb-3.5 font-bold">EVENT DESCRIPTION</th>
              <th className="pb-3.5 font-bold">TIMESTAMP</th>
              <th className="pb-3.5 font-bold text-center">KEY STATUS</th>
              <th className="pb-3.5 font-bold text-right pr-2">STAFF LOGGED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#142644]/70">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const lockerFormatted =
                  log.lockerNumber < 10
                    ? `0${log.lockerNumber}`
                    : `${log.lockerNumber}`;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-[#070E1C]/80 transition-colors group"
                  >
                    {/* LOCKER KEY # */}
                    <td className="py-3.5 pl-2">
                      <button
                        type="button"
                        onClick={() => handleOpenLockerEditor(log.lockerNumber)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-900/40 font-mono font-black text-xs transition-colors cursor-pointer group/btn"
                        title="Click to Edit Locker Status"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Locker #{lockerFormatted}</span>
                        <Edit3 className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 text-slate-300 transition-opacity ml-0.5" />
                      </button>
                    </td>

                    {/* ATHLETE / MEMBER */}
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-white text-xs">
                          {log.memberName}
                        </span>
                        {log.regId && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {log.regId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* EVENT DESCRIPTION */}
                    <td className="py-3.5 text-slate-300 font-medium max-w-xs">
                      <div>
                        <span>{log.eventDescription}</span>
                        {log.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5">
                            Note: {log.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* TIMESTAMP */}
                    <td className="py-3.5 font-mono text-slate-300 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* KEY STATUS PILL */}
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                          log.keyStatus === 'ACTIVE_OCCUPANT'
                            ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
                            : log.keyStatus === 'RETURNED'
                            ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                            : log.keyStatus === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            : 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                        }`}
                      >
                        {log.keyStatus === 'ACTIVE_OCCUPANT' && (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                            <span>Active Occupant</span>
                          </>
                        )}
                        {log.keyStatus === 'RETURNED' && (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            <span>Returned / Cleared</span>
                          </>
                        )}
                        {log.keyStatus === 'OVERDUE' && (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>Overdue Alert</span>
                          </>
                        )}
                        {(log.keyStatus === 'MAINTENANCE' ||
                          log.keyStatus === 'OUT_OF_SERVICE') && (
                          <>
                            <Wrench className="w-3 h-3 text-amber-400" />
                            <span>Maintenance</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* STAFF LOGGED */}
                    <td className="py-3.5 text-right pr-2 font-mono">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/10 text-slate-200 font-bold text-[11px] border border-white/15">
                        {log.staffLogged}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No locker usage events found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono">
        <span>Showing {filteredLogs.length} total recorded operations</span>
        <span className="text-[11px] text-slate-500 mt-1 sm:mt-0">
          Synced with Front Desk Turnstile &amp; Key Rack
        </span>
      </div>

      {/* Locker Editor Modal */}
      <LockerEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedLocker(null);
        }}
        locker={selectedLocker}
      />
    </div>
  );
}
