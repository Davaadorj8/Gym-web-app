'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast, setActiveTab } from '@/features/ui/uiSlice';
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  KeyRound,
  Sliders,
  DollarSign,
  Users,
  Settings,
  Database,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

interface StaffApproval {
  id: string;
  type: 'Discount Override' | 'Master Key Release' | 'Refund Request';
  member: string;
  staffName: string;
  details: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const INITIAL_REQUESTS: StaffApproval[] = [
  {
    id: '1',
    type: 'Discount Override',
    member: 'Sarah Jenkins',
    staffName: 'Staff Mike (Desk 1)',
    details: '20% Student/Teacher discount voucher applied to 3-Month Plan',
    time: '10 mins ago',
    status: 'Pending',
  },
  {
    id: '2',
    type: 'Master Key Release',
    member: 'David Miller',
    staffName: 'Staff Alex (Floor)',
    details: 'Locker #42 mechanical latch stuck with athlete bag inside',
    time: '25 mins ago',
    status: 'Pending',
  },
  {
    id: '3',
    type: 'Refund Request',
    member: 'Robert Hall',
    staffName: 'Staff Mike (Desk 1)',
    details: 'Accidental duplicate charge for Pro Shop Protein Tub ($49.99)',
    time: '1 hour ago',
    status: 'Approved',
  },
];

export default function AdminPanelView() {
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<StaffApproval[]>(INITIAL_REQUESTS);
  const [autoLockers, setAutoLockers] = useState(true);
  const [guestPassLimit, setGuestPassLimit] = useState(2);

  const handleApprove = (id: string, member: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    dispatch(showToast({ message: `Approved authorization for ${member}`, type: 'success' }));
  };

  const handleReject = (id: string, member: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    dispatch(showToast({ message: `Rejected request for ${member}`, type: 'info' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Admin &amp; Owner Control Panel
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Staff override authorizations, club settings, and system architecture console
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setActiveTab('tech-stack'))}
          className="py-2 px-3.5 bg-[#0E1E38] hover:bg-[#152B4E] border border-lime-400/40 text-lime-400 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>Inspect Architecture &amp; DB</span>
        </button>
      </div>

      {/* Staff Override Requests Queue */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white tracking-wide">
            Staff Action Authorizations &amp; Overrides
          </h3>
          <span className="text-xs text-slate-400">
            {requests.filter((r) => r.status === 'Pending').length} pending approval
          </span>
        </div>

        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 bg-[#070E1C] border border-[#142644] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-lime-400/10 text-lime-400 border border-lime-400/30 uppercase font-mono">
                    {req.type}
                  </span>
                  <span className="text-xs font-bold text-white">Member: {req.member}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({req.time})</span>
                </div>
                <p className="text-xs text-slate-300">{req.details}</p>
                <p className="text-[11px] text-slate-400">
                  Requested by: <span className="text-slate-300 font-semibold">{req.staffName}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'Pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(req.id, req.member)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id, req.member)}
                      className="px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-black rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-[0_0_10px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Approve</span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Approved'
                        ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Club Operational Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-lime-400" />
            <span>Turnstile &amp; Locker Automation</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-[#070E1C] border border-[#142644] rounded-xl cursor-pointer">
              <span className="text-slate-300 font-medium">
                Auto-assign next available locker on entry
              </span>
              <input
                type="checkbox"
                checked={autoLockers}
                onChange={(e) => setAutoLockers(e.target.checked)}
                className="w-4 h-4 accent-lime-400"
              />
            </label>

            <div className="p-3 bg-[#070E1C] border border-[#142644] rounded-xl flex items-center justify-between">
              <span className="text-slate-300 font-medium">Monthly guest pass limit</span>
              <select
                value={guestPassLimit}
                onChange={(e) => setGuestPassLimit(Number(e.target.value))}
                className="px-2.5 py-1 bg-[#0A1324] border border-[#142644] rounded-lg text-white font-bold"
              >
                <option value={1}>1 Pass</option>
                <option value={2}>2 Passes</option>
                <option value={4}>4 Passes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <DollarSign className="w-4 h-4 text-lime-400" />
            <span>Billing &amp; Merchant Integration</span>
          </div>

          <div className="p-3.5 bg-[#070E1C] border border-[#142644] rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Merchant Terminal:</span>
              <span className="text-lime-400 font-bold">Stripe / Terminal POS Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Auto-Renewal Notice:</span>
              <span className="text-white font-bold">3 days before expiry</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Currency:</span>
              <span className="text-white font-bold">USD ($)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
