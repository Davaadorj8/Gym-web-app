'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast, setActiveTab } from '@/features/ui/uiSlice';
import {
  UserCheck,
  Search,
  Zap,
  Clock,
  KeyRound,
  CheckCircle2,
  XCircle,
  UserPlus,
  Shield,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

interface CheckedInMember {
  id: string;
  regId: string;
  name: string;
  plan: string;
  checkInTime: string;
  lockerNumber: number;
  status: 'In Gym' | 'Checked Out';
  avatarInitials: string;
}

const INITIAL_MEMBERS: CheckedInMember[] = [
  {
    id: '1',
    regId: 'ARC-4921',
    name: 'Jordan Vance',
    plan: '1 Month - Starter Pass',
    checkInTime: '18:42 PM',
    lockerNumber: 12,
    status: 'In Gym',
    avatarInitials: 'JV',
  },
  {
    id: '2',
    regId: 'ARC-3024',
    name: 'Chloe Chen',
    plan: '3 Months - Pro Athlete',
    checkInTime: '19:15 PM',
    lockerNumber: 7,
    status: 'In Gym',
    avatarInitials: 'CC',
  },
  {
    id: '3',
    regId: 'ARC-8812',
    name: 'Marcus Brody',
    plan: '1 Year - Elite Unlimited',
    checkInTime: '17:30 PM',
    lockerNumber: 24,
    status: 'In Gym',
    avatarInitials: 'MB',
  },
];

export default function CheckInDeskView() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<CheckedInMember[]>(INITIAL_MEMBERS);
  const [selectedLocker, setSelectedLocker] = useState<number>(18);

  const activeInGymCount = members.filter((m) => m.status === 'In Gym').length;

  const handleCheckout = (id: string, name: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Checked Out' } : m))
    );
    dispatch(
      showToast({
        message: `${name} checked out. Locker freed.`,
        type: 'info',
      })
    );
  };

  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const newEntry: CheckedInMember = {
      id: Date.now().toString(),
      regId: `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: searchQuery,
      plan: '1 Month - Starter Pass',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lockerNumber: selectedLocker,
      status: 'In Gym',
      avatarInitials: searchQuery
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AT',
    };

    setMembers([newEntry, ...members]);
    setSearchQuery('');
    dispatch(
      showToast({
        message: `Athlete ${newEntry.name} checked in! Locker #${newEntry.lockerNumber} assigned.`,
        type: 'success',
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Front Desk Check-in Terminal
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Barcode/ID scan, live locker assignment, and active on-floor athlete roster
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-[#0E1E38] border border-lime-400/30 rounded-xl text-xs font-bold text-lime-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            <span>{activeInGymCount} Athletes On-Site</span>
          </div>

          <button
            type="button"
            onClick={() => dispatch(setActiveTab('registration'))}
            className="py-2 px-3.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Member</span>
          </button>
        </div>
      </div>

      {/* Express Check In Form */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-extrabold text-lime-400 uppercase tracking-wider font-mono">
          Fast Barcode / Member Check-In
        </h3>
        <form onSubmit={handleQuickCheckin} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan Barcode ID or Type Athlete Name..."
              className="w-full pl-10 pr-4 py-3 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedLocker}
              onChange={(e) => setSelectedLocker(Number(e.target.value))}
              className="w-full px-3 py-3 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400"
            >
              {[1, 4, 8, 11, 15, 18, 22, 27, 33, 40].map((num) => (
                <option key={num} value={num}>
                  Assign Locker #{num < 10 ? `0${num}` : num} (Available)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black stroke-black" />
              <span>Check In</span>
            </button>
          </div>
        </form>
      </div>

      {/* Real-Time On Floor Roster */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white tracking-wide">
            Live Athlete Floor Status
          </h3>
          <span className="text-xs text-slate-400">
            Real-time synchronization with RFID entry gate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#142644] text-[10px] font-mono uppercase text-slate-400">
                <th className="pb-3 font-extrabold">Athlete</th>
                <th className="pb-3 font-extrabold">Reg ID</th>
                <th className="pb-3 font-extrabold">Plan</th>
                <th className="pb-3 font-extrabold">Check-In Time</th>
                <th className="pb-3 font-extrabold">Locker Bay</th>
                <th className="pb-3 font-extrabold">Status</th>
                <th className="pb-3 text-right font-extrabold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101F38]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#070E1C]/60 transition-colors">
                  <td className="py-3.5 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0E203C] border border-[#1D3B6C] text-lime-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {member.avatarInitials}
                    </div>
                    <span>{member.name}</span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-400">{member.regId}</td>
                  <td className="py-3.5 font-semibold text-lime-300">{member.plan}</td>
                  <td className="py-3.5 font-mono text-slate-300">{member.checkInTime}</td>
                  <td className="py-3.5 font-mono text-cyan-400 font-bold">
                    Locker #{member.lockerNumber < 10 ? `0${member.lockerNumber}` : member.lockerNumber}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        member.status === 'In Gym'
                          ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {member.status === 'In Gym' ? (
                      <button
                        type="button"
                        onClick={() => handleCheckout(member.id, member.name)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
