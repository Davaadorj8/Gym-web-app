'use client';

import React from 'react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import {
  Users,
  DollarSign,
  AlertTriangle,
  KeyRound,
  TrendingUp,
  ArrowUpRight,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    facility,
    members,
    activeCheckIns,
    lockers,
    membershipPlans,
    user,
    role,
    isAdmin,
    totalLockers,
    occupiedLockers,
    overdueLockersCount,
    maintenanceLockersCount,
    availableLockers,
    currentlyInGym,
    activeMembers,
    totalRevenue,
    unpaidCount,
    expiringCount,
    totalFlagged,
    hourlyTrafficData,
    planBreakdown,
    navigateTab,
  } = useAnalyticsData();

  return (
    <div id="dashboard-view-container" className="space-y-6">
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Currently In Gym */}
        <div
          id="stat-card-in-gym"
          onClick={() => navigateTab('desk')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl transition-all duration-200 hover:border-cyan-500/50 hover:bg-[#0E1A30]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live In Gym
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {currentlyInGym}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {facility.maxCapacity || 120} Max
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400 font-medium font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Real-time check-in desk
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
          </div>
        </div>

        {/* Card 2: Active Subscriptions & Revenue */}
        <div
          id="stat-card-revenue"
          onClick={() => navigateTab('analytics')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl transition-all duration-200 hover:border-emerald-500/50 hover:bg-[#0E1A30]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Subscriptions
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {activeMembers.length}
            </span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">
              ${totalRevenue.toLocaleString()} MTD
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-slate-400 font-mono">
              {members.length} registered total
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-400" />
          </div>
        </div>

        {/* Card 3: Locker Hub Allocation */}
        <div
          id="stat-card-lockers"
          onClick={() => navigateTab('lockers')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl transition-all duration-200 hover:border-cyan-500/50 hover:bg-[#0E1A30]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Locker Allocation
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <KeyRound className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {occupiedLockers}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {totalLockers} ({availableLockers} Free)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-cyan-400 font-mono">
              {overdueLockersCount > 0
                ? `${overdueLockersCount} Overdue Keys`
                : 'All slots cleared & synced'}
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-400" />
          </div>
        </div>

        {/* Card 4: Action Required (Unpaid / Expiring) */}
        <div
          id="stat-card-flagged"
          onClick={() => navigateTab('desk')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl transition-all duration-200 hover:border-amber-500/50 hover:bg-[#0E1A30]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Action Required
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-400 font-mono">
              {totalFlagged}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({unpaidCount} unpaid, {expiringCount} exp.)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-amber-400/90 font-mono">
              Requires desk follow-up
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-400" />
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hourly Turnstile Flow Chart */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Hourly Peak Attendance &amp; Turnstile Traffic
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated daily check-in volume throughout operating hours
              </p>
            </div>
            <span className="rounded-lg bg-[#0E1E38] px-2.5 py-1 text-[11px] font-bold font-mono text-cyan-400 border border-[#18315B]">
              Today: {currentlyInGym} Athletes
            </span>
          </div>

          <div className="mt-4 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrafficData}>
                <defs>
                  <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070E1C',
                    borderColor: '#142644',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area
                  type="monotone"
                  dataKey="checkIns"
                  name="Check-Ins"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCheckIns)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Tier Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Membership Plan Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Active registered athlete breakdown
            </p>
          </div>

          <div className="my-auto flex items-center justify-center py-2">
            <div className="h-[170px] w-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planBreakdown}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            {planBreakdown.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white">
                  {item.value} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY & PERSISTENCE BANNER */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Real-time active athletes in facility */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-sm font-bold text-white">
                Live Gym Floor Roster ({activeCheckIns.length} Checked In)
              </h3>
            </div>
            <button
              onClick={() => navigateTab('desk')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Desk</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-800/60">
            {activeCheckIns.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No athletes currently checked in. Tap &quot;Check-In Desk&quot; above to swipe or scan member IDs.
              </div>
            ) : (
              activeCheckIns.slice(0, 5).map((ci) => (
                <div
                  key={ci.id}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[11px] border border-cyan-500/20">
                      {ci.regId.slice(-3)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{ci.memberName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {ci.planName} • Check-in: {ci.checkInTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    {ci.lockerNumber ? (
                      <span className="flex items-center gap-1 text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800">
                        <KeyRound className="h-3 w-3" />
                        Locker #{ci.lockerNumber}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No locker</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      On Floor
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Database & System Architecture Status */}
        <div className="rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Database className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Full-Stack Architecture
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              PostgreSQL • Prisma ORM • Redux
            </h4>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Complete full-stack synchronization between server endpoints and client-side Redux store.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#070E1C] p-2.5 border border-slate-800">
                <span className="text-slate-400">Active User Role:</span>
                <span className="font-mono font-bold text-cyan-400">{role}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#070E1C] p-2.5 border border-slate-800">
                <span className="text-slate-400">Total Registered Members:</span>
                <span className="font-mono font-bold text-emerald-400">{members.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#070E1C] p-2.5 border border-slate-800">
                <span className="text-slate-400">Available Plans:</span>
                <span className="font-mono font-bold text-slate-200">
                  {membershipPlans.length} active tiers
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Systems Operational
            </span>
            <button
              onClick={() => navigateTab('admin')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs cursor-pointer"
            >
              Admin Panel &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
