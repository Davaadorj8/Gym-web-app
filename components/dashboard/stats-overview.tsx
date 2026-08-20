'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setActiveTab } from '@/features/ui/uiSlice';
import { DashboardStats } from '@/types';
import { Users, Dumbbell, TrendingUp, DollarSign, ArrowUpRight, CheckCircle2, ChevronRight, UserPlus } from 'lucide-react';

export default function StatsOverview() {
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error('Failed to load stats', err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      id: 'stat-active-clients',
      label: 'Active Athletes',
      value: stats ? stats.activeClients : '—',
      subtext: `${stats ? stats.pendingClients : 0} onboarding pending`,
      change: '+12% this month',
      icon: Users,
      actionTab: 'registration' as const,
    },
    {
      id: 'stat-programs',
      label: 'Active Programs',
      value: stats ? stats.totalPlans : '—',
      subtext: 'Hypertrophy, Mobility, Strength',
      change: '+3 new splits',
      icon: Dumbbell,
      actionTab: 'workouts' as const,
    },
    {
      id: 'stat-retention',
      label: 'Retention Rate',
      value: stats ? `${stats.avgRetentionRate}%` : '—',
      subtext: 'Front-desk check-in adherence',
      change: 'High engagement',
      icon: TrendingUp,
      actionTab: 'analytics' as const,
    },
    {
      id: 'stat-revenue',
      label: 'Monthly Run Rate',
      value: stats ? `$${stats.revenueMtd.toLocaleString()}` : '—',
      subtext: 'Passes, memberships & pro shop',
      change: '+18.4% vs last mo',
      icon: DollarSign,
      actionTab: 'analytics' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={() => dispatch(setActiveTab(card.actionTab))}
              className="p-5 rounded-2xl border border-[#142644] bg-[#0A1324] shadow-lg hover:border-[#1E3A66] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div className="p-2 rounded-xl bg-[#0E1E38] text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mb-1 font-mono">
                {loading ? <span className="animate-pulse text-slate-600">...</span> : card.value}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#142644]">
                <span>{card.subtext}</span>
                <span className="text-lime-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Readiness & Quick Status Banner */}
      <div className="p-6 rounded-2xl border border-[#142644] bg-linear-to-r from-[#0A1324] to-[#070E1C] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-lime-400/10 text-lime-400 text-xs font-bold tracking-wide border border-lime-400/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ironpulse Engine Online
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Athlete Registration &amp; Front-Desk Terminal Active
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Configure member plans, capture webcam profile photos, assign RFID/lockers, and track automated subscription expirations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('registration'))}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:bg-lime-300 transition-all shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Athlete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
