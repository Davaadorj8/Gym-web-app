'use client';

import React, { useState } from 'react';
import { useLockerHub } from '../hooks/useLockerHub';
import { LockerGrid } from './locker-grid';
import { LockerUsageTable } from './locker-usage-table';
import { LockerActionDialog } from './locker-action-dialog';
import {
  Lock,
  Unlock,
  Wrench,
  AlertTriangle,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';

export const LockerHubView: React.FC = () => {
  const {
    lockers,
    allLockers,
    stats,
    registeredMembers,
    activeCheckIns,
    lockerUsageLogs,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    genderFilter,
    setGenderFilter,
    zoneFilter,
    setZoneFilter,
    selectedLocker,
    isActionDialogOpen,
    viewMode,
    setViewMode,
    handleOpenLockerAction,
    handleOpenLockerByNumber,
    handleCloseLockerAction,
    handleAssignLocker,
    handleReleaseLocker,
    handleToggleMaintenance,
  } = useLockerHub();

  const [activeTabMode, setActiveTabMode] = useState<'logs' | 'matrix'>('logs');

  return (
    <div id="locker-hub-container" className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Lockers */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-4 shadow-md">
          <span className="text-xs font-mono font-semibold text-slate-400">Total Lockers</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
            <span className="text-xs font-mono text-cyan-400">{stats.occupancyRate}% Load</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Available */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-4 shadow-md">
          <span className="text-xs font-mono font-semibold text-slate-400">Available</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">{stats.available}</span>
            <Unlock className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Ready for check-in</span>
        </div>

        {/* Occupied */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-4 shadow-md">
          <span className="text-xs font-mono font-semibold text-slate-400">Occupied</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">{stats.occupied}</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Athletes training</span>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-4 shadow-md">
          <span className="text-xs font-mono font-semibold text-slate-400">Overdue</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono">{stats.overdue}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Time exceeded</span>
        </div>

        {/* Maintenance */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-4 shadow-md col-span-2 sm:col-span-1">
          <span className="text-xs font-mono font-semibold text-slate-400">Maintenance</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.maintenance}</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">Out of service</span>
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-[#0A1324]">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by locker number, athlete name, or PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#070E1C] border border-[#142644] text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
          />
        </div>

        {/* Filter & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
            {(['ALL', 'AVAILABLE', 'OCCUPIED', 'OVERDUE', 'MAINTENANCE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Gender Zone */}
          <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
            {(['ALL', 'MALE', 'FEMALE'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  genderFilter === g
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g === 'ALL' ? 'All Zones' : g === 'MALE' ? "Men's" : "Women's"}
              </button>
            ))}
          </div>

          {/* Display Mode: Logs Table vs Matrix View */}
          <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
            <button
              type="button"
              onClick={() => setActiveTabMode('logs')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                activeTabMode === 'logs'
                  ? 'bg-[#D4F938] text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Database Usage Logs View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Logs View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('matrix')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                activeTabMode === 'matrix'
                  ? 'bg-[#D4F938] text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Lockers Matrix View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cubicles</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Visual Content: Tabular Locker Usage Log (Child 3 of locker-hub-container) */}
      <div id="locker-hub-main-content">
        {activeTabMode === 'logs' ? (
          <LockerUsageTable
            logs={lockerUsageLogs}
            allLockers={allLockers}
            onSelectLockerByNumber={handleOpenLockerByNumber}
          />
        ) : (
          <LockerGrid lockers={lockers} onSelectLocker={handleOpenLockerAction} />
        )}
      </div>

      {/* 4. Locker Action Modal */}
      <LockerActionDialog
        isOpen={isActionDialogOpen}
        locker={selectedLocker}
        registeredMembers={registeredMembers}
        activeCheckIns={activeCheckIns}
        onClose={handleCloseLockerAction}
        onAssign={handleAssignLocker}
        onRelease={handleReleaseLocker}
        onToggleMaintenance={handleToggleMaintenance}
      />
    </div>
  );
};

export default LockerHubView;

