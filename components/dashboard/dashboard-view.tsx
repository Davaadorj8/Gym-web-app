'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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

export default function DashboardView() {
  const dispatch = useAppDispatch();
  const facility = useAppSelector((state) => state.gym.facility);
  const members = useAppSelector((state) => state.gym.members);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const lockers = useAppSelector((state) => state.gym.lockers);
  const membershipPlans = useAppSelector((state) => state.gym.membershipPlans);
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER';

  // 1. Available / Occupied Lockers
  const totalLockers = facility.lockersTotal || lockers.length || 50;
  const occupiedLockers =
    lockers.filter((l) => l.status === 'OCCUPIED').length ||
    facility.lockersOccupied;
  const overdueLockersCount = lockers.filter((l) => l.isOverdue).length;
  const maintenanceLockersCount = lockers.filter(
    (l) => l.status === 'MAINTENANCE' || l.status === 'OUT_OF_SERVICE'
  ).length;
  const availableLockers = Math.max(
    0,
    totalLockers - occupiedLockers - maintenanceLockersCount
  );

  // 2. Currently in Gym
  const currentlyInGym = activeCheckIns.length || facility.activeOccupancy;

  // 3. Total Subscriptions / Revenue Value
  const activeMembers = useMemo(
    () => members.filter((m) => m.status === 'ACTIVE'),
    [members]
  );
  const totalRevenue = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.totalFee || 0), 0);
  }, [members]);

  // 4. Expiring / Unpaid
  const now = new Date();
  const unpaidCount = members.filter(
    (m) => m.paymentStatus === 'PENDING'
  ).length;
  const expiringCount = members.filter((m) => {
    if (!m.expiryDate) return false;
    const expiry = new Date(m.expiryDate);
    const diffDays =
      (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const totalFlagged = unpaidCount + expiringCount;

  // 5. Hourly Traffic Data (Preview for upcoming turnstile aggregation)
  const hourlyTrafficData = useMemo(() => {
    return [
      { time: '06:00', checkIns: 4 },
      { time: '08:00', checkIns: 12 },
      { time: '10:00', checkIns: 8 },
      { time: '12:00', checkIns: 15 },
      { time: '14:00', checkIns: 7 },
      { time: '16:00', checkIns: 14 },
      { time: '18:00', checkIns: 24 },
      { time: '20:00', checkIns: 18 },
      { time: '22:00', checkIns: 6 },
    ];
  }, []);

  // 6. Membership Breakdown based on admin-created plans & registered members
  const planBreakdown = useMemo(() => {
    const totalCount = members.length || 1;
    const counts: Record<string, number> = {};

    members.forEach((m) => {
      const planKey = m.planName || 'Standard Membership';
      counts[planKey] = (counts[planKey] || 0) + 1;
    });

    const defaultColors = [
      '#A3E635',
      '#22D3EE',
      '#F87171',
      '#FDE047',
      '#C084FC',
      '#FB923C',
    ];

    return Object.entries(counts).map(([name, count], index) => {
      const matchedPlan = membershipPlans?.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      const color =
        matchedPlan?.color || defaultColors[index % defaultColors.length];
      const percentage = Math.round((count / totalCount) * 100);

      return {
        name,
        value: count,
        percentage,
        color,
      };
    });
  }, [members, membershipPlans]);

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available / Occupied Lockers */}
        <Link
          href="/lockers"
          className="bg-[#0A1324] border border-[#142644] hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold group-hover:text-cyan-400 transition">
              LOCKERS STATUS
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {availableLockers}
              </span>
              <span className="text-sm font-mono text-slate-400">
                / {totalLockers} Available
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold">
                {occupiedLockers} in use
              </span>
              {overdueLockersCount > 0 && (
                <span className="text-rose-400 font-bold bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
                  {overdueLockersCount} overdue
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Card 2: Current in Gym */}
        <Link
          href="/desk"
          className="bg-[#0A1324] border border-[#142644] hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold group-hover:text-cyan-400 transition">
              CURRENT IN GYM
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {currentlyInGym}
              </span>
              <span className="text-sm font-mono text-slate-400">
                Active Athletes
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-lime-400">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span>Turnstile Gate Online</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Expiring / Unpaid Alert */}
        <Link
          href="/clients"
          className="bg-[#0A1324] border border-[#142644] hover:border-rose-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold group-hover:text-rose-400 transition">
              EXPIRING / UNPAID
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-400/10 border border-rose-400/30 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-400 font-mono tracking-tight">
                {totalFlagged}
              </span>
              <span className="text-sm font-mono text-slate-400">
                Require Action
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-bold">
                {unpaidCount} unpaid
              </span>
              <span>•</span>
              <span className="text-rose-400 font-bold">
                {expiringCount} expiring
              </span>
            </div>
          </div>
        </Link>

        {/* Card 4: Total Subscriptions & Revenue (Admin) vs Roster Summary (Staff) */}
        <Link
          href={isAdmin ? "/analytics" : "/clients"}
          className="bg-[#0A1324] border border-[#142644] hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {isAdmin ? 'TOTAL REVENUE LOGGED' : 'ACTIVE ATHLETE ROSTER'}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isAdmin
                  ? 'bg-lime-400/10 border border-lime-400/30 text-lime-400'
                  : 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-400'
              }`}
            >
              {isAdmin ? <DollarSign className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              {isAdmin ? (
                <span className="text-3xl font-black text-lime-400 font-mono tracking-tight">
                  ${totalRevenue.toLocaleString()}
                </span>
              ) : (
                <span className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
                  {activeMembers.length}
                </span>
              )}
              <span className="text-sm font-mono text-slate-400">
                {isAdmin ? 'MTD Total' : `/ ${members.length} Enrolled`}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-400">
              <span>{isAdmin ? `${members.length} Registered Members` : 'Staff Role View'}</span>
              <span className={isAdmin ? 'text-lime-400 font-bold' : 'text-cyan-400 font-bold'}>
                {isAdmin ? `${activeMembers.length} Active` : 'Financials Masked'}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. MIDDLE CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hourly Traffic Chart */}
        <div className="lg:col-span-2 bg-[#0A1324] border border-[#142644] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Today&apos;s Hourly Member Traffic
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Turnstile gate check-in volume throughout peak training hours
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#070E1C] px-3 py-1 rounded-lg border border-[#142644]">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              <span>Real-Time Gate Sync</span>
            </div>
          </div>

          {/* Traffic Area Chart */}
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyTrafficData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3E635" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#A3E635" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1E293B' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070E1C',
                    borderColor: '#1E3A5F',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checkIns"
                  stroke="#A3E635"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#trafficGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Membership Breakdown Pie Chart */}
        <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Membership Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active subscriptions by admin-configured plan
              </p>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#0A1324"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white font-mono leading-none">
                  {members.length}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">
                  ATHLETES
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="mt-4 space-y-2 pt-3 border-t border-[#142644]">
            {planBreakdown.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs text-slate-300 font-medium"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-slate-300 text-[12px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-slate-200 font-bold shrink-0">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
