'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast } from '@/features/ui/uiSlice';
import {
  Bell,
  Check,
  X,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  Send,
  Filter,
  CheckCircle2,
  Lock,
  DollarSign,
  Plus,
} from 'lucide-react';

export interface StaffApproval {
  id: string;
  type: 'Discount Override' | 'Master Key Release' | 'Refund Request' | 'Access Exception';
  member: string;
  staffName: string;
  details: string;
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority?: 'High' | 'Normal' | 'Urgent';
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
    priority: 'Normal',
  },
  {
    id: '2',
    type: 'Master Key Release',
    member: 'David Miller',
    staffName: 'Staff Alex (Floor)',
    details: 'Locker #42 mechanical latch stuck with athlete bag inside',
    time: '25 mins ago',
    status: 'Pending',
    priority: 'Urgent',
  },
  {
    id: '3',
    type: 'Refund Request',
    member: 'Robert Hall',
    staffName: 'Staff Mike (Desk 1)',
    details: 'Accidental duplicate charge for Pro Shop Protein Tub ($49.99)',
    time: '1 hour ago',
    status: 'Approved',
    priority: 'Normal',
  },
  {
    id: '4',
    type: 'Access Exception',
    member: 'Elena Rostova',
    staffName: 'Staff Sarah (Desk 2)',
    details: 'Guest day pass granted ahead of system subscription activation',
    time: '2 hours ago',
    status: 'Pending',
    priority: 'High',
  },
];

export default function StaffNotificationsSection() {
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<StaffApproval[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

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

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const newReq: StaffApproval = {
      id: `bc-${Date.now()}`,
      type: 'Access Exception',
      member: 'Floor Shift Notice',
      staffName: 'Duty Manager (Admin)',
      details: broadcastMessage.trim(),
      time: 'Just now',
      status: 'Pending',
      priority: 'Urgent',
    };

    setRequests((prev) => [newReq, ...prev]);
    dispatch(
      showToast({
        message: 'Staff notification dispatch sent to active front-desk terminals.',
        type: 'success',
      })
    );
    setBroadcastMessage('');
    setIsBroadcastOpen(false);
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'PENDING') return r.status === 'Pending';
    if (filterStatus === 'APPROVED') return r.status === 'Approved';
    if (filterStatus === 'REJECTED') return r.status === 'Rejected';
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Quick Action */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center relative">
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-mono font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Staff Action Authorizations &amp; Overrides
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
                {pendingCount} Pending Approvals
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live authorization requests, supervisor overrides, master key releases &amp; front-desk shift notifications
            </p>
          </div>
        </div>

        {/* Filter and Broadcast Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-lime-400 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsBroadcastOpen((prev) => !prev)}
            className="px-3.5 py-1.5 bg-[#0E1E38] hover:bg-[#152B4E] border border-lime-400/40 text-lime-400 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Alert</span>
          </button>
        </div>
      </div>

      {/* Broadcast Form (Collapsible) */}
      {isBroadcastOpen && (
        <form
          onSubmit={handleSendBroadcast}
          className="bg-[#0A1324] border border-[#1E3A66] rounded-2xl p-5 shadow-xl space-y-3 animate-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-lime-400" />
              <span>Broadcast Staff Directive / Floor Alert</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Pushes to all active desk screens</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. Free weights zone sanitization check required before 18:00 rush..."
              className="flex-1 px-3.5 py-2 bg-[#070E1C] border border-[#142644] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black font-mono font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(163,230,53,0.3)]"
            >
              Post Notification
            </button>
          </div>
        </form>
      )}

      {/* Requests Stream */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#142644] pb-3">
          <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>Active Authorization Requests &amp; Notification Feed</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredRequests.length} of {requests.length} records
          </span>
        </div>

        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-[#070E1C] rounded-xl border border-[#142644] text-slate-500 font-mono text-xs">
              No staff notifications or authorization requests matching the selected filter.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-[#070E1C] border border-[#142644] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#1E3A66] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase font-mono border ${
                        req.type === 'Discount Override'
                          ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                          : req.type === 'Master Key Release'
                          ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30'
                          : req.type === 'Refund Request'
                          ? 'bg-purple-400/10 text-purple-300 border-purple-400/30'
                          : 'bg-lime-400/10 text-lime-300 border-lime-400/30'
                      }`}
                    >
                      {req.type}
                    </span>
                    <span className="text-xs font-bold text-white">Subject: {req.member}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({req.time})</span>
                    {req.priority === 'Urgent' && (
                      <span className="text-[9px] font-mono font-extrabold px-2 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{req.details}</p>
                  <p className="text-[11px] text-slate-400">
                    Logged by: <span className="text-slate-300 font-semibold">{req.staffName}</span>
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
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
