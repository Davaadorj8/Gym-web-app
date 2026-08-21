'use client';

import React, { useState, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

type TimeRange = '7D' | '30D' | '90D' | 'YTD';
type AnalyticsTab = 'OVERVIEW' | 'FINANCIAL' | 'ATTENDANCE';

export const AnalyticsHub: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('OVERVIEW');

  // Connect to live store data where available
  const members = useAppSelector((state) => state.gym.members);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const checkInHistory = useAppSelector((state) => state.gym.checkInHistory);

  // Dynamic metrics calculated based on timeRange & store state
  const kpis = useMemo(() => {
    const totalMemberRevenue = members.reduce((sum, m) => sum + (m.totalFee || 0), 0);
    const activeCount = members.filter((m) => m.status === 'ACTIVE').length || 842;
    const is30D = timeRange === '30D';
    const is7D = timeRange === '7D';
    const is90D = timeRange === '90D';

    let revenueVal = '$24,850';
    let revGrowth = '+12.4%';
    let checkInsVal = '4,120';
    let checkInGrowth = '+8.2%';

    if (is7D) {
      revenueVal = '$6,420';
      revGrowth = '+9.1%';
      checkInsVal = '980';
      checkInGrowth = '+4.5%';
    } else if (is90D) {
      revenueVal = '$68,400';
      revGrowth = '+15.2%';
      checkInsVal = '12,480';
      checkInGrowth = '+11.0%';
    } else if (timeRange === 'YTD') {
      revenueVal = '$142,600';
      revGrowth = '+22.8%';
      checkInsVal = '38,900';
      checkInGrowth = '+18.4%';
    }

    if (totalMemberRevenue > 0) {
      const multiplier = is7D ? 0.25 : is30D ? 1 : is90D ? 2.8 : 5.8;
      revenueVal = `$${Math.round(totalMemberRevenue * multiplier).toLocaleString()}`;
    }

    return {
      revenue: revenueVal,
      revenueGrowth: revGrowth,
      activeMembers: activeCount.toString(),
      memberGrowth: '+5.8%',
      totalCheckIns: checkInsVal,
      checkInGrowth: checkInGrowth,
      avgVisitDuration: '68 min',
      retentionRate: '94.2%',
    };
  }, [timeRange, members]);

  // Hourly Peak Traffic Data
  const hourlyTraffic = [
    { hour: '6 AM', count: 32 },
    { hour: '8 AM', count: 78 },
    { hour: '10 AM', count: 45 },
    { hour: '12 PM', count: 62 },
    { hour: '2 PM', count: 38 },
    { hour: '4 PM', count: 85 },
    { hour: '6 PM', count: 120 }, // Peak
    { hour: '8 PM', count: 92 },
    { hour: '10 PM', count: 24 },
  ];

  // Revenue Breakdown by Tier
  const tierBreakdown = [
    { tier: 'Standard Monthly', percentage: 52, revenue: '$12,920', color: 'bg-cyan-500' },
    { tier: 'Premium / All-Access', percentage: 34, revenue: '$8,450', color: 'bg-blue-500' },
    { tier: 'VIP Athlete', percentage: 10, revenue: '$2,480', color: 'bg-purple-500' },
    { tier: 'Day Passes', percentage: 4, revenue: '$1,000', color: 'bg-slate-500' },
  ];

  return (
    <div id="analytics-performance-hub" className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Global Controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0A1324] p-5 shadow-lg md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Performance &amp; Analytics Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Business health, revenue trajectory, attendance patterns, and member retention.
          </p>
        </div>

        {/* Global Timeframe Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-[#142644] bg-[#070E1C] p-1">
          {(['7D', '30D', '90D', 'YTD'] as TimeRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold font-mono transition cursor-pointer ${
                timeRange === range
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Unified KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-4 shadow-md flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400">Total Revenue</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{kpis.revenue}</span>
            <span className="text-xs font-bold font-mono text-emerald-400">{kpis.revenueGrowth}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">vs. previous period</span>
        </div>

        {/* Active Members */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-4 shadow-md flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400">Active Members</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{kpis.activeMembers}</span>
            <span className="text-xs font-bold font-mono text-emerald-400">{kpis.memberGrowth}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">{kpis.retentionRate} retention rate</span>
        </div>

        {/* Total Check-Ins */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-4 shadow-md flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400">Total Check-Ins</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{kpis.totalCheckIns}</span>
            <span className="text-xs font-bold font-mono text-cyan-400">{kpis.checkInGrowth}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Avg {kpis.avgVisitDuration} / session</span>
        </div>

        {/* Facility Utilization */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-4 shadow-md flex flex-col justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400">Peak Occupancy</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">88%</span>
            <span className="text-xs font-bold font-mono text-amber-400">6:00 PM Peak</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">120 Concurrent Athletes</span>
        </div>
      </div>

      {/* 3. Tabbed Analytics Sections */}
      <div className="flex border-b border-[#142644] text-xs font-medium text-slate-400">
        {[
          { id: 'OVERVIEW', label: 'Executive Overview' },
          { id: 'FINANCIAL', label: 'Revenue & Membership Tiers' },
          { id: 'ATTENDANCE', label: 'Peak Hours & Traffic' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AnalyticsTab)}
            className={`border-b-2 px-4 py-3 font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Chart Views */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Peak Hours Traffic Heatmap / Bar Chart (Span 2) */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-5 lg:col-span-2 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Hourly Facility Attendance</h3>
              <p className="text-xs text-slate-400">Average check-in distribution throughout the day</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#070E1C] text-cyan-300 border border-[#142644]">
              {timeRange} Window
            </span>
          </div>

          <div className="flex h-52 items-end justify-between gap-2 pt-6">
            {hourlyTraffic.map((item) => {
              const heightPercent = (item.count / 120) * 100;
              const isPeak = item.count >= 100;
              return (
                <div key={item.hour} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">{item.count}</span>
                  <div className="relative flex h-36 w-full items-end justify-center rounded-lg bg-[#070E1C] p-1 border border-[#142644]/40">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-md transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-t from-cyan-600 to-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-gradient-to-t from-slate-700 to-cyan-500'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Membership Tier Distribution (Span 1) */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Revenue by Membership Plan</h3>
            <p className="text-xs text-slate-400">Distribution across active subscription plans</p>

            <div className="mt-6 space-y-4">
              {tierBreakdown.map((item) => (
                <div key={item.tier} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-medium text-slate-300">{item.tier}</span>
                    <span className="font-bold text-white">
                      {item.revenue} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#070E1C] border border-[#142644]/60">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#142644] bg-[#070E1C] p-3 text-center">
            <span className="text-xs text-slate-400 font-mono">Average Revenue Per User (ARPU)</span>
            <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">$29.50 / month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub;
