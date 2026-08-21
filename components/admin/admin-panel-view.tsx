'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showToast, setActiveTab } from '@/features/ui/uiSlice';
import {
  setTotalLockers,
  setAutoAssignLocker,
  setLockerStatus,
  LockerStatus,
} from '@/features/gym/gymSlice';
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
  Wrench,
  Layers,
  Sparkles,
  Zap,
  Bell,
} from 'lucide-react';
import StaffNotificationsSection from '@/components/staff/staff-notifications-section';

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
  const facility = useAppSelector((state) => state.gym.facility);
  const lockers = useAppSelector((state) => state.gym.lockers);
  const membershipPlans = useAppSelector((state) => state.gym.membershipPlans);

  const [requests, setRequests] = useState<StaffApproval[]>(INITIAL_REQUESTS);
  const [activeAdminSection, setActiveAdminSection] = useState<'LOCKERS' | 'STAFF_ACTION'>('LOCKERS');
  const [customLockerInput, setCustomLockerInput] = useState<string>(String(facility.lockersTotal));
  const [guestPassLimit, setGuestPassLimit] = useState(2);
  const [selectedMaintLocker, setSelectedMaintLocker] = useState<number | null>(null);

  const availableCount = lockers.filter((l) => l.status === 'AVAILABLE').length;
  const occupiedCount = lockers.filter((l) => l.status === 'OCCUPIED').length;
  const maintenanceCount = lockers.filter((l) => l.status === 'MAINTENANCE').length;

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

  const handleApplyLockerCapacity = (newTotal: number) => {
    const validCount = Math.max(10, Math.min(250, newTotal));
    dispatch(setTotalLockers(validCount));
    setCustomLockerInput(String(validCount));
    dispatch(
      showToast({
        message: `Admin updated facility locker capacity to ${validCount} locker keys!`,
        type: 'success',
      })
    );
  };

  const handleToggleMaintenance = (lockerNum: number) => {
    const locker = lockers.find((l) => l.number === lockerNum);
    if (!locker) return;
    if (locker.status === 'OCCUPIED') {
      dispatch(
        showToast({
          message: `Cannot place Locker #${lockerNum} under maintenance while occupied by ${locker.occupiedByMemberName}.`,
          type: 'error',
        })
      );
      return;
    }
    const newStatus: LockerStatus = locker.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    dispatch(setLockerStatus({ lockerNumber: lockerNum, status: newStatus }));
    dispatch(
      showToast({
        message: `Locker #${lockerNum} is now ${newStatus === 'MAINTENANCE' ? 'marked Under Maintenance' : 'Available for Check-in'}.`,
        type: newStatus === 'MAINTENANCE' ? 'info' : 'success',
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(163,230,53,0.35)]">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Admin &amp; Facility Control Panel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Configure locker key inventory capacity, turnstile rules, and staff authorizations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveAdminSection('LOCKERS')}
            className={`py-2 px-3.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              activeAdminSection === 'LOCKERS'
                ? 'bg-lime-400 text-black shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                : 'bg-[#070E1C] border border-[#142644] text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Facility Controls</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminSection('STAFF_ACTION')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
              activeAdminSection === 'STAFF_ACTION'
                ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.3)] font-extrabold'
                : 'bg-[#0E1E38] hover:bg-[#152B4E] border-lime-400/40 text-lime-400'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Staff Action</span>
            {requests.filter((r) => r.status === 'Pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: Facility Controls vs Staff Action Switcher                       */}
      {/* ========================================================================= */}
      {activeAdminSection === 'LOCKERS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Locker Key Inventory & Capacity Admin Controller */}
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142644] pb-4">
          <div>
            <div className="flex items-center gap-2 text-lime-400 font-extrabold text-sm uppercase tracking-wider font-mono">
              <KeyRound className="w-5 h-5" />
              <span>Locker Key Number &amp; Capacity Setting</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Admin-controlled physical key inventory. Changes immediately sync to the Front Desk Terminal matrix.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-lime-400/10 border border-lime-400/30 rounded-xl text-xs font-mono font-bold text-lime-400">
              Current: {facility.lockersTotal} Keys
            </span>
          </div>
        </div>

        {/* Custom Locker Key Capacity Input */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#070E1C] border border-[#142644] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-1">
                Custom Locker Count (10 &ndash; 250 Keys)
              </label>
              <p className="text-xs text-slate-400">
                Configure total physical key units assigned to this facility. Locker matrix will dynamically scale and initialize numbered slots.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                type="number"
                min={10}
                max={250}
                value={customLockerInput}
                onChange={(e) => setCustomLockerInput(e.target.value)}
                placeholder="e.g. 96"
                className="w-36 py-2.5 px-3.5 bg-[#0A1324] border border-[#1E3A66] rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-lime-400"
              />
              <button
                type="button"
                onClick={() => {
                  const parsed = parseInt(customLockerInput, 10);
                  if (!isNaN(parsed)) handleApplyLockerCapacity(parsed);
                }}
                className="py-2.5 px-5 bg-lime-400 hover:bg-lime-300 text-black font-mono font-black text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(163,230,53,0.3)]"
              >
                Set Locker Capacity
              </button>
            </div>
          </div>

          {/* Real-time Inventory Snapshot */}
          <div className="lg:col-span-6 bg-[#070E1C] border border-[#142644] rounded-2xl p-4 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Key Matrix Status
              </span>
              <span className="text-[10px] text-lime-400 font-mono font-bold">
                SYNCED LIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#0A1324] border border-emerald-500/30 rounded-xl">
                <span className="text-lg font-black text-emerald-400 font-mono block">
                  {availableCount}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Available</span>
              </div>
              <div className="p-3 bg-[#0A1324] border border-indigo-500/30 rounded-xl">
                <span className="text-lg font-black text-indigo-400 font-mono block">
                  {occupiedCount}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</span>
              </div>
              <div className="p-3 bg-[#0A1324] border border-amber-500/30 rounded-xl">
                <span className="text-lg font-black text-amber-400 font-mono block">
                  {maintenanceCount}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Maintenance</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#142644]">
              <span className="text-slate-400">Front Desk Auto-Assignment:</span>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !facility.autoAssignLocker;
                  dispatch(setAutoAssignLocker(nextVal));
                  dispatch(
                    showToast({
                      message: `Locker auto-assignment ${nextVal ? 'Enabled' : 'Disabled'}`,
                      type: 'info',
                    })
                  );
                }}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  facility.autoAssignLocker
                    ? 'bg-lime-400 text-black shadow-[0_0_10px_rgba(163,230,53,0.3)]'
                    : 'bg-[#142644] text-slate-400 hover:text-white'
                }`}
              >
                {facility.autoAssignLocker ? 'ENABLED (Auto-Select Next)' : 'DISABLED (Manual Pop-Up)'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Locker Maintenance Grid Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Click any available locker below to toggle <span className="text-amber-400 font-bold">Maintenance</span> status:
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Showing 1 &ndash; {facility.lockersTotal} Lockers
            </span>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#070E1C] rounded-xl border border-[#142644]">
            {lockers.map((locker) => {
              const isAvailable = locker.status === 'AVAILABLE';
              const isOccupied = locker.status === 'OCCUPIED';
              const isMaintenance = locker.status === 'MAINTENANCE';

              return (
                <button
                  key={locker.number}
                  type="button"
                  onClick={() => handleToggleMaintenance(locker.number)}
                  title={
                    isOccupied
                      ? `Locker #${locker.number} - Occupied by ${locker.occupiedByMemberName}`
                      : isMaintenance
                      ? `Locker #${locker.number} - Under Maintenance (Click to mark available)`
                      : `Locker #${locker.number} - Available (Click to mark maintenance)`
                  }
                  className={`h-9 rounded-lg text-[10px] font-mono font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isAvailable
                      ? 'bg-[#0A1324] border border-emerald-500/30 text-emerald-300 hover:border-amber-400'
                      : isOccupied
                      ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 cursor-not-allowed opacity-80'
                      : 'bg-amber-950/60 border border-amber-500/60 text-amber-300 hover:border-emerald-400'
                  }`}
                >
                  <span>{locker.number < 10 ? `0${locker.number}` : locker.number}</span>
                  <span className="text-[7px] font-sans leading-none mt-0.5 opacity-80">
                    {isAvailable ? 'FREE' : isOccupied ? 'BUSY' : 'MAINT'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Override Requests Queue - Quick Portal */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime-400" />
              <span>Staff Action Authorizations &amp; Overrides</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live authorization requests and terminal notifications are managed under the inventory &amp; operations hub.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('inventory'))}
            className="px-3.5 py-1.5 bg-[#0E1E38] hover:bg-[#152B4E] border border-lime-400/40 text-lime-400 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>Open Staff Notification Hub</span>
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          </button>
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

      {/* SECTION: Membership Plans (Admin Configuration) */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142644] pb-4">
          <div>
            <div className="flex items-center gap-2 text-lime-400 font-extrabold text-sm uppercase tracking-wider font-mono">
              <Layers className="w-5 h-5" />
              <span>Membership Plans &amp; Subscriptions Config</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Admin-created membership tiers. Automatically populates athlete registration options and dashboard analytics breakdown.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-lime-400/10 border border-lime-400/30 rounded-xl text-xs font-mono font-bold text-lime-400">
              {membershipPlans?.length || 5} Active Plans
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {membershipPlans?.map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-xl border border-[#142644] bg-[#070E1C] hover:border-[#1E3A66] transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="font-extrabold text-white text-sm">{plan.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#0A1324] border border-[#142644] text-[10px] font-mono text-slate-400">
                  {plan.category}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-[#142644]">
                <div>
                  <span className="text-xl font-black text-white font-mono">${plan.price}</span>
                  <span className="text-xs text-slate-500 font-mono"> / {plan.durationMonths} Mo</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-lime-400">Active</span>
              </div>
              {plan.description && (
                <p className="text-[11px] text-slate-400 leading-snug">{plan.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Club Operational Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-lime-400" />
            <span>Turnstile &amp; Access Automation</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#070E1C] border border-[#142644] rounded-xl flex items-center justify-between">
              <span className="text-slate-300 font-medium">Turnstile Gate Hardware:</span>
              <span className="text-lime-400 font-bold font-mono">ONLINE (Relay 1 Active)</span>
            </div>

            <div className="p-3 bg-[#070E1C] border border-[#142644] rounded-xl flex items-center justify-between">
              <span className="text-slate-300 font-medium">Monthly guest pass limit</span>
              <select
                value={guestPassLimit}
                onChange={(e) => setGuestPassLimit(Number(e.target.value))}
                className="px-2.5 py-1 bg-[#0A1324] border border-[#142644] rounded-lg text-white font-bold cursor-pointer"
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
  )}

  {/* ========================================================================= */}
  {/* SECTION: Staff Action Authorizations & Override Notifications             */}
  {/* ========================================================================= */}
  {activeAdminSection === 'STAFF_ACTION' && (
    <StaffNotificationsSection />
  )}
</div>
  );
}

