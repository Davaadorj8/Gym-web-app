'use client';

import React, { useState, useMemo } from 'react';
import { LockerUsageRecord } from '@/features/gym/gymSlice';
import { Locker } from '../types/locker.types';
import {
  Database,
  Search,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface LockerUsageTableProps {
  logs: LockerUsageRecord[];
  allLockers: Locker[];
  onSelectLockerByNumber: (lockerNumber: number) => void;
}

export const LockerUsageTable: React.FC<LockerUsageTableProps> = ({
  logs,
  allLockers,
  onSelectLockerByNumber,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'OCCUPIED' | 'RETURNS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25; // 25 logs per page

  // Filter logs based on search query & active tab filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Tab Filter
      if (tabFilter === 'OCCUPIED') {
        if (log.keyStatus !== 'ACTIVE_OCCUPANT' && !log.eventDescription.toLowerCase().includes('checked in')) {
          return false;
        }
      } else if (tabFilter === 'RETURNS') {
        if (log.keyStatus !== 'RETURNED' && !log.eventDescription.toLowerCase().includes('checked out')) {
          return false;
        }
      }

      // 2. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numStr = log.lockerNumber ? log.lockerNumber.toString() : '';
        const lockerStr = `locker #${log.lockerNumber}`.toLowerCase();
        const lockerNoPad = `locker ${log.lockerNumber}`.toLowerCase();
        const lockerPad = `locker #${numStr.padStart(2, '0')}`.toLowerCase();
        const memberMatch = log.memberName?.toLowerCase().includes(q);
        const regMatch = log.regId?.toLowerCase().includes(q);
        const descMatch = log.eventDescription?.toLowerCase().includes(q);
        const staffMatch = log.staffLogged?.toLowerCase().includes(q);

        const match =
          numStr === q ||
          lockerStr.includes(q) ||
          lockerNoPad.includes(q) ||
          lockerPad.includes(q) ||
          memberMatch ||
          regMatch ||
          descMatch ||
          staffMatch;

        if (!match) return false;
      }

      return true;
    });
  }, [logs, tabFilter, searchQuery]);

  // Pagination logic: load last 25 logs in page 1 and so on
  const totalLogs = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));

  // Reset to page 1 if current page exceeds total pages
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentLogs = useMemo(() => {
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, startIndex, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper to get status badge styling
  const renderStatusBadge = (keyStatus: LockerUsageRecord['keyStatus'], eventDescription: string) => {
    const isCheckedIn =
      keyStatus === 'ACTIVE_OCCUPANT' ||
      eventDescription.toLowerCase().includes('checked in') ||
      eventDescription.toLowerCase().includes('duration extended');

    const isReturned =
      keyStatus === 'RETURNED' || eventDescription.toLowerCase().includes('checked out') || eventDescription.toLowerCase().includes('returned');

    const isOverdue = keyStatus === 'OVERDUE' || eventDescription.toLowerCase().includes('overdue');
    const isMaint = keyStatus === 'MAINTENANCE' || eventDescription.toLowerCase().includes('maintenance');

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-950/50 text-rose-400 border border-rose-500/40">
          Overdue
        </span>
      );
    }

    if (isMaint) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-950/40 text-amber-400 border border-amber-500/40">
          Maintenance
        </span>
      );
    }

    if (isReturned) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#141E2F] text-slate-400 border border-slate-700/60">
          Key Returned
        </span>
      );
    }

    if (isCheckedIn) {
      if (eventDescription.toLowerCase().includes('duration extended') && keyStatus !== 'ACTIVE_OCCUPANT') {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#0A263B] text-cyan-400 border border-cyan-500/40">
            Check-In Logged
          </span>
        );
      }
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#0B2A1E] text-emerald-400 border border-emerald-500/40">
          Active Occupant
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#0A263B] text-cyan-400 border border-cyan-500/40">
        Check-In Logged
      </span>
    );
  };

  return (
    <div
      id="database-locker-usage-log-container"
      className="w-full rounded-2xl border border-slate-800 bg-[#070E1C] p-5 sm:p-6 shadow-xl space-y-5"
    >
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#D4F938] shrink-0" />
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
              Database Locker Usage Log
            </h3>
          </div>
          <p className="text-xs font-mono text-emerald-400/90 tracking-tight">
            Historical record of every locker key issued & returned by reception staff
          </p>
        </div>

        {/* Right Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Locker #, Member, or Reg"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#040912] border border-[#142644] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#040912] p-1 rounded-xl border border-[#142644]">
            <button
              type="button"
              onClick={() => {
                setTabFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                tabFilter === 'ALL'
                  ? 'bg-[#D4F938] text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setTabFilter('OCCUPIED');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                tabFilter === 'OCCUPIED'
                  ? 'bg-[#D4F938] text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Occupied
            </button>
            <button
              type="button"
              onClick={() => {
                setTabFilter('RETURNS');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                tabFilter === 'RETURNS'
                  ? 'bg-[#D4F938] text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Returns
            </button>
          </div>
        </div>
      </div>

      {/* Tabular Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[#142644]/70">
              <th className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                LOCKER KEY #
              </th>
              <th className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ATHLETE / MEMBER
              </th>
              <th className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                EVENT DESCRIPTION
              </th>
              <th className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                TIMESTAMP
              </th>
              <th className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                KEY STATUS
              </th>
              <th className="py-3 px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 text-right">
                STAFF LOGGED
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#142644]/40">
            {currentLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ShieldAlert className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">No logs found</p>
                    <p className="text-xs text-slate-500">
                      Try adjusting your search query or tab filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentLogs.map((log) => {
                const formattedNum = log.lockerNumber
                  ? log.lockerNumber < 10
                    ? `0${log.lockerNumber}`
                    : `${log.lockerNumber}`
                  : null;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-[#0B1527]/70 transition-colors group cursor-default"
                  >
                    {/* Locker Key # */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => log.lockerNumber && onSelectLockerByNumber(log.lockerNumber)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/50 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-bold hover:bg-cyan-500/20 hover:border-cyan-400 transition cursor-pointer shadow-sm group-hover:border-cyan-300"
                        title={
                          log.lockerNumber
                            ? `Click to view / manage Locker #${formattedNum}`
                            : 'Key event'
                        }
                      >
                        <span className="text-cyan-400 text-[13px] leading-none">⚦</span>
                        <span>{formattedNum ? `Locker #${formattedNum}` : 'Key Issued'}</span>
                      </button>
                    </td>

                    {/* Athlete / Member */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm tracking-tight">
                          {log.memberName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {log.regId || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Event Description */}
                    <td className="py-3.5 px-3">
                      <span className="text-xs sm:text-sm font-medium text-slate-200">
                        {log.eventDescription}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-400">{log.timestamp}</span>
                    </td>

                    {/* Key Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderStatusBadge(log.keyStatus, log.eventDescription)}
                    </td>

                    {/* Staff Logged */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-[#D4F938] text-xs sm:text-sm">
                        {log.staffLogged || 'DB'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#142644]/70">
        {/* Total Summary */}
        <div className="text-xs font-mono text-slate-400">
          Showing{' '}
          <span className="text-white font-bold">
            {totalLogs > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + pageSize, totalLogs)}
          </span>{' '}
          of <span className="text-white font-bold">{totalLogs}</span> logs (Page{' '}
          <span className="text-cyan-400 font-bold">{safeCurrentPage}</span> of{' '}
          <span className="text-cyan-400 font-bold">{totalPages}</span>)
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#142644] bg-[#040912] text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Numeric Page Buttons */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Only show surrounding pages if many pages
              if (totalPages > 6 && Math.abs(p - safeCurrentPage) > 2 && p !== 1 && p !== totalPages) {
                if (p === safeCurrentPage - 3 || p === safeCurrentPage + 3) {
                  return (
                    <span key={p} className="px-1 text-slate-600 font-mono text-xs">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    p === safeCurrentPage
                      ? 'bg-cyan-500 text-black shadow'
                      : 'bg-[#040912] border border-[#142644] text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#142644] bg-[#040912] text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerUsageTable;
