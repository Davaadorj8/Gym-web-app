import React from 'react';
import Link from 'next/link';
import {
  User,
  ArrowLeft,
  Dumbbell,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  Award,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ClientProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = await params;

  return (
    <div id="member-profile-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Back Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-mono">ID: {id}</span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xl font-black text-white shadow-lg border border-cyan-400/30">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">Athlete Profile</h1>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                System Record UUID: <span className="text-cyan-300">{id}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/workouts?assignTo=${id}`}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-extrabold text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
              <span>Assign Workout Plan</span>
            </Link>
            <Link
              href="/desk"
              className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Front Desk Check-In</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#142644]">
          <div className="rounded-xl border border-slate-800/80 bg-[#070E1C] p-3.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Workouts</span>
            </div>
            <div className="mt-1 text-lg font-black text-white font-mono">24 Sessions</div>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#070E1C] p-3.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Membership Tier</span>
            </div>
            <div className="mt-1 text-lg font-black text-amber-400 font-mono">VIP Black Card</div>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#070E1C] p-3.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Assigned Locker</span>
            </div>
            <div className="mt-1 text-lg font-black text-purple-400 font-mono">#12 (VIP Zone)</div>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#070E1C] p-3.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Last Check-In</span>
            </div>
            <div className="mt-1 text-lg font-black text-emerald-400 font-mono">Today, 08:30 AM</div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Bio Info */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-5 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Athlete Overview &amp; Contact</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070E1C] border border-[#142644]/60">
              <span className="text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" /> Email Address
              </span>
              <span className="font-semibold text-slate-200">athlete.{id.slice(0, 6)}@gym.titan</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070E1C] border border-[#142644]/60">
              <span className="text-slate-400 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" /> Phone Number
              </span>
              <span className="font-semibold text-slate-200 font-mono">+1 (555) 019-2834</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070E1C] border border-[#142644]/60">
              <span className="text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" /> Member Since
              </span>
              <span className="font-semibold text-slate-200">March 2024</span>
            </div>
          </div>
        </div>

        {/* Training Goals & Notes */}
        <div className="rounded-2xl border border-[#142644] bg-[#0A1324] p-5 space-y-4 shadow-lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>Training Goals &amp; Preferences</span>
          </h2>
          <div className="p-4 rounded-xl bg-[#070E1C] border border-[#142644]/60 space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Primary Goal</span>
              <p className="text-sm font-bold text-white mt-0.5">Hypertrophy &amp; Athletic Power Conditioning</p>
            </div>
            <div className="border-t border-[#142644]/60 pt-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">Coach Notes</span>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Prefers morning sessions. Focused on deadlift technique and metabolic conditioning blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
