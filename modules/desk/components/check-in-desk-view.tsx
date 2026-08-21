'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showToast, setActiveTab } from '@/features/ui/uiSlice';
import { ClientRegistrationModal } from '@/modules/clients';
import {
  checkInMember,
  checkOutMember,
  updateMemberPaymentStatus,
  setAutoAssignLocker,
  setLockerStatus,
  PaymentMethod,
  RegisteredMember,
} from '@/features/gym/gymSlice';
import { getDaysPending } from '@/lib/utils';
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
  AlertTriangle,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  X,
  User,
  Sparkles,
  Layers,
  Activity,
  Check,
  Grid,
  Sliders,
  Settings,
  ChevronRight,
} from 'lucide-react';

export default function CheckInDeskView() {
  const dispatch = useAppDispatch();
  const members = useAppSelector((state) => state.gym.members);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const checkInHistory = useAppSelector((state) => state.gym.checkInHistory);
  const lockers = useAppSelector((state) => state.gym.lockers);
  const facility = useAppSelector((state) => state.gym.facility);
  const loggedInStaff = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<RegisteredMember | null>(null);
  const [assignedLockerNumber, setAssignedLockerNumber] = useState<number | null>(null);
  
  // Matrix pop-up modal state
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [lockerFilter, setLockerFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'>('AVAILABLE');
  
  // Payment resolution modal state
  const [paymentModalMember, setPaymentModalMember] = useState<RegisteredMember | null>(null);
  const [resolveMethod, setResolveMethod] = useState<PaymentMethod>('CARD');

  // Walk-in Registration Modal state (preserving desk context)
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  const isAutoSelectLocker = facility.autoAssignLocker;

  // Available lockers
  const availableLockers = useMemo(() => {
    return lockers.filter((l) => l.status === 'AVAILABLE');
  }, [lockers]);

  const firstAvailableLocker = availableLockers[0]?.number ?? null;

  // Filtered members matching search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.regId.toLowerCase().includes(query) ||
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query)
    );
  }, [searchQuery, members]);

  // Check if a member is currently checked-in on the floor
  const isMemberOnFloor = (memberId: string) => {
    return activeCheckIns.some((c) => c.memberId === memberId);
  };

  // 3-Day Rule Calculation
  const getPendingPaymentInfo = (member: RegisteredMember) => {
    if (member.paymentStatus === 'PAID') {
      return { isPending: false, daysPending: 0, isBlocked: false };
    }
    const { daysPending, isBlocked } = getDaysPending(member.registeredAt);
    return { isPending: true, daysPending, isBlocked };
  };

  // Handle member selection
  const handleSelectMember = (member: RegisteredMember) => {
    setSelectedMember(member);
    if (isAutoSelectLocker) {
      if (firstAvailableLocker) {
        setAssignedLockerNumber(firstAvailableLocker);
      }
    } else {
      // If auto select is unchecked, let user select from matrix or open modal
      if (!assignedLockerNumber && firstAvailableLocker) {
        setAssignedLockerNumber(firstAvailableLocker);
      }
    }
  };

  // Select locker from matrix modal
  const handleSelectLockerFromMatrix = (lockerNum: number) => {
    const locker = lockers.find((l) => l.number === lockerNum);
    if (locker?.status !== 'AVAILABLE') {
      dispatch(
        showToast({
          message: `Locker #${lockerNum} is not available (${locker?.status}).`,
          type: 'error',
        })
      );
      return;
    }
    setAssignedLockerNumber(lockerNum);
    dispatch(setAutoAssignLocker(false));
    setIsMatrixModalOpen(false);
    dispatch(
      showToast({
        message: `Selected Locker #${lockerNum < 10 ? `0${lockerNum}` : lockerNum} for ${selectedMember ? selectedMember.firstName : 'athlete'}.`,
        type: 'success',
      })
    );
  };

  // Perform Check In
  const handlePerformCheckIn = (member: RegisteredMember) => {
    const pendingInfo = getPendingPaymentInfo(member);
    if (pendingInfo.isBlocked) {
      dispatch(
        showToast({
          message: `Access Denied: ${member.firstName}'s payment is pending for > 3 days. Please update payment first.`,
          type: 'error',
        })
      );
      setPaymentModalMember(member);
      return;
    }

    if (isMemberOnFloor(member.id)) {
      dispatch(
        showToast({
          message: `${member.firstName} is already checked in on the floor!`,
          type: 'error',
        })
      );
      return;
    }

    const targetLocker = isAutoSelectLocker
      ? firstAvailableLocker
      : (assignedLockerNumber || firstAvailableLocker);

    if (!targetLocker) {
      dispatch(
        showToast({
          message: 'No available lockers found! Please check out an athlete or expand capacity in Admin Panel.',
          type: 'error',
        })
      );
      setIsMatrixModalOpen(true);
      return;
    }

    const lockerObj = lockers.find((l) => l.number === targetLocker);
    if (lockerObj?.status !== 'AVAILABLE') {
      dispatch(
        showToast({
          message: `Locker #${targetLocker} is currently ${lockerObj?.status}. Please select another locker.`,
          type: 'error',
        })
      );
      setIsMatrixModalOpen(true);
      return;
    }

    // Dispatch Redux check-in
    dispatch(
      checkInMember({
        memberId: member.id,
        lockerNumber: targetLocker,
      })
    );

    dispatch(
      showToast({
        message: `Checked in ${member.firstName} ${member.lastName}! Assigned Locker #${
          targetLocker < 10 ? `0${targetLocker}` : targetLocker
        }.`,
        type: 'success',
      })
    );

    // Reset selection & search
    setSelectedMember(null);
    setAssignedLockerNumber(null);
    setSearchQuery('');
  };

  // Perform Check Out
  const handlePerformCheckOut = (checkInId: string, memberName: string, lockerNum: number) => {
    dispatch(checkOutMember({ checkInId }));
    dispatch(
      showToast({
        message: `${memberName} checked out. Locker #${lockerNum < 10 ? `0${lockerNum}` : lockerNum} is now available!`,
        type: 'info',
      })
    );
  };

  // Confirm Payment at Check-in Desk
  const handleConfirmPaymentReceived = () => {
    if (!paymentModalMember) return;
    dispatch(
      updateMemberPaymentStatus({
        memberId: paymentModalMember.id,
        paymentStatus: 'PAID',
        paymentMethod: resolveMethod,
        confirmedByStaffId: loggedInStaff?.id || 'usr-1',
        confirmedByStaffName: loggedInStaff?.name || 'Staff Reception',
      })
    );

    dispatch(
      showToast({
        message: `Payment confirmed for ${paymentModalMember.firstName} ${paymentModalMember.lastName} via ${resolveMethod}!`,
        type: 'success',
      })
    );

    if (selectedMember && selectedMember.id === paymentModalMember.id) {
      setSelectedMember({
        ...selectedMember,
        paymentStatus: 'PAID',
        paymentMethod: resolveMethod,
        status: 'ACTIVE',
      });
    }

    setPaymentModalMember(null);
  };

  const filteredLockers = useMemo(() => {
    if (lockerFilter === 'ALL') return lockers;
    return lockers.filter((l) => l.status === lockerFilter);
  }, [lockers, lockerFilter]);

  const activeTargetLocker = isAutoSelectLocker
    ? firstAvailableLocker
    : (assignedLockerNumber || null);

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* TOP BANNER                                                                */}
      {/* ========================================================================= */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(163,230,53,0.35)] shrink-0">
            <UserCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Front Desk Check-in Terminal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Photo identity verification, 3-day payment grace tracking, and locker key matrix
            </p>
          </div>
        </div>

        {/* Top Controls: Register Walk-in, Matrix Modal & Occupancy Counter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Register Walk-in Button (Context Preserving) */}
          <button
            type="button"
            id="btn-desk-register-walkin"
            onClick={() => setIsWalkInModalOpen(true)}
            className="py-2 px-3.5 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)]"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Register Walk-in</span>
          </button>

          {/* Quick Matrix Modal Button */}
          <button
            type="button"
            onClick={() => setIsMatrixModalOpen(true)}
            className="py-2 px-3.5 bg-[#0E1E38] hover:bg-[#152B4E] border border-cyan-400/40 text-cyan-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            <span>Locker Matrix ({facility.lockersTotal})</span>
          </button>

          {/* Active Occupancy Counter */}
          <div className="px-3.5 py-2 bg-[#070E1C] border border-lime-400/30 rounded-xl text-xs font-bold text-lime-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
            <span>
              {facility.activeOccupancy} / {facility.maxCapacity} On-Site
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Search Member & Photo Verification (5 cols)                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Member Search Input */}
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-lime-400 uppercase tracking-wider font-mono flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search Athlete / Barcode Scan</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {members.length} ATHLETES
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedMember && e.target.value.trim() === '') {
                    setSelectedMember(null);
                  }
                }}
                placeholder="Scan Barcode (ARC-XXXX), Name, or Phone..."
                className="w-full pl-10 pr-4 py-3 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Results Dropdown / List */}
            {searchQuery.trim() !== '' && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {searchResults.length > 0 ? (
                  searchResults.map((m) => {
                    const onFloor = isMemberOnFloor(m.id);
                    const pendingInfo = getPendingPaymentInfo(m);
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          selectedMember?.id === m.id
                            ? 'bg-[#0E1E38] border-lime-400 shadow-md ring-1 ring-lime-400/50'
                            : 'bg-[#070E1C] border-[#142644] hover:border-[#1E3A66] hover:bg-[#0A1529]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Member Photo Thumbnail */}
                          <div className="w-10 h-10 rounded-xl bg-[#0A1324] border border-[#1E3A66] overflow-hidden flex items-center justify-center shrink-0">
                            {m.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.photoUrl}
                                alt={m.firstName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-extrabold text-xs text-lime-400">
                                {m.firstName[0]}
                                {m.lastName[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {m.firstName} {m.lastName}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">
                                ({m.regId})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">{m.planName}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {onFloor ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
                              On Floor
                            </span>
                          ) : pendingInfo.isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              Payment Overdue
                            </span>
                          ) : pendingInfo.isPending ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Grace (Day {pendingInfo.daysPending}/3)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 bg-[#070E1C] rounded-xl text-center space-y-2.5">
                    <p className="text-xs text-slate-400">No athlete found matching &ldquo;{searchQuery}&rdquo;.</p>
                    <button
                      type="button"
                      onClick={() => setIsWalkInModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register as Walk-In Member</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Member Card & Visual Identity Verification */}
          {selectedMember ? (
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-5 shadow-xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#142644] pb-4">
                <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                  <User className="w-4 h-4" />
                  <span>Visual Identity Verification</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setAssignedLockerNumber(null);
                  }}
                  className="text-slate-500 hover:text-white text-xs cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              {/* Photo & Identity Display */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl bg-[#070E1C] border-2 border-[#1E3A66] overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                  {selectedMember.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-center">
                      <User className="w-8 h-8 opacity-60 text-slate-400" />
                      <span className="text-[9px] text-slate-500">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h3>
                    <span className="text-xs font-mono font-bold text-lime-400 px-2 py-0.5 rounded-md bg-[#070E1C] border border-[#142644]">
                      {selectedMember.regId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {selectedMember.planName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {selectedMember.phone} &bull; {selectedMember.email}
                  </div>
                </div>
              </div>

              {/* 3-Day Rule Warning / Status Box */}
              {(() => {
                const pending = getPendingPaymentInfo(selectedMember);
                if (pending.isBlocked) {
                  return (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-red-400 font-extrabold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>ENTRY DENIED &bull; PAYMENT PENDING &gt; 3 DAYS</span>
                      </div>
                      <p className="text-[11px] text-red-300 leading-relaxed">
                        This athlete registered {pending.daysPending} days ago without payment confirmation. Locker keys cannot be assigned until payment is received.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPaymentModalMember(selectedMember)}
                        className="mt-2 py-2 px-3 bg-red-500 hover:bg-red-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Update Payment Received Now</span>
                      </button>
                    </div>
                  );
                }
                if (pending.isPending) {
                  return (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Pending Payment Grace Period (Day {pending.daysPending}/3)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentModalMember(selectedMember)}
                          className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
                        >
                          Confirm Payment
                        </button>
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        Athlete is permitted temporary entry today under the 3-day grace period.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Payment Verified ({selectedMember.paymentMethod})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Expiry: {selectedMember.expiryDate.split('T')[0]}
                    </span>
                  </div>
                );
              })()}

              {/* Assigned Locker Key Selector Card */}
              <div className="p-3.5 bg-[#070E1C] border border-[#142644] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-lime-400" />
                    <span>Selected Locker Key</span>
                  </span>
                  
                  {/* Auto Select Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-[#0A1324] px-2.5 py-1 rounded-lg border border-[#142644] hover:border-lime-400/40 transition-colors">
                    <input
                      type="checkbox"
                      id="auto-select-locker-checkbox"
                      checked={isAutoSelectLocker}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        dispatch(setAutoAssignLocker(checked));
                        if (checked) {
                          if (firstAvailableLocker) {
                            setAssignedLockerNumber(firstAvailableLocker);
                          }
                        } else {
                          // When unchecked, open the matrix table so staff can choose manually
                          setIsMatrixModalOpen(true);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-700 bg-[#070E1C] text-lime-400 focus:ring-lime-400 focus:ring-offset-0 cursor-pointer accent-lime-400"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      Auto Select
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-black text-lime-400">
                      {activeTargetLocker ? `#${activeTargetLocker < 10 ? `0${activeTargetLocker}` : activeTargetLocker}` : 'None Selected'}
                    </span>
                    {activeTargetLocker ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        {isAutoSelectLocker ? 'Auto-Selected' : 'Manually Chosen'}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                        Choose from Matrix
                      </span>
                    )}
                  </div>

                  {!isAutoSelectLocker && (
                    <button
                      type="button"
                      id="open-matrix-table-btn"
                      onClick={() => setIsMatrixModalOpen(true)}
                      className="py-1.5 px-3 bg-lime-400 hover:bg-lime-300 text-black text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Open Matrix Table</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Member Details Mini Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-[#070E1C] rounded-xl border border-[#142644]">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Emergency</span>
                  <div className="text-slate-300 text-[11px] font-medium truncate">
                    {selectedMember.emergencyContact || 'Not provided'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Staff Tag</span>
                  <div className="text-slate-300 text-[11px] font-medium truncate">
                    {selectedMember.registeredByStaffName}
                  </div>
                </div>
              </div>

              {/* Action Button: Check In */}
              {isMemberOnFloor(selectedMember.id) ? (
                <div className="p-3 bg-lime-400/10 border border-lime-400/30 rounded-xl text-center text-xs font-bold text-lime-400">
                  Athlete is currently on-floor with Locker #{activeCheckIns.find((c) => c.memberId === selectedMember.id)?.lockerNumber}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePerformCheckIn(selectedMember)}
                  disabled={getPendingPaymentInfo(selectedMember).isBlocked}
                  className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                    getPendingPaymentInfo(selectedMember).isBlocked
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-lime-400 hover:bg-lime-300 text-black shadow-[0_0_16px_rgba(163,230,53,0.35)] cursor-pointer'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-black stroke-black" />
                  <span>
                    Check In &amp; Hand Out Locker #{activeTargetLocker ? (activeTargetLocker < 10 ? `0${activeTargetLocker}` : activeTargetLocker) : '--'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 text-center space-y-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#070E1C] border border-[#142644] text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  No Athlete Selected
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Search or scan a member above. Selecting an athlete will verify photo identity and assign a locker key (or pop up the matrix table).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Facility Occupancy, Live Floor Roster & Key Summary (7 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Locker Utilization Card */}
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142644] pb-3">
              <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase font-mono">
                <KeyRound className="w-4 h-4 text-lime-400" />
                <span>Locker Capacity &amp; Key Matrix Status</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Capacity set by admin: <strong className="text-white font-mono">{facility.lockersTotal} Keys</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMatrixModalOpen(true)}
                  className="py-1 px-2.5 bg-lime-400 hover:bg-lime-300 text-black text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
                >
                  Pop-up Matrix
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#070E1C] border border-emerald-500/30 rounded-xl">
                <span className="text-xl font-black text-emerald-400 font-mono block">
                  {availableLockers.length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Available</span>
              </div>
              <div className="p-3 bg-[#070E1C] border border-indigo-500/30 rounded-xl">
                <span className="text-xl font-black text-indigo-400 font-mono block">
                  {lockers.filter((l) => l.status === 'OCCUPIED').length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Occupied</span>
              </div>
              <div className="p-3 bg-[#070E1C] border border-amber-500/30 rounded-xl">
                <span className="text-xl font-black text-amber-400 font-mono block">
                  {lockers.filter((l) => l.status === 'MAINTENANCE').length}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Maintenance</span>
              </div>
            </div>
          </div>

          {/* Live On-Floor Athletes List & Fast Checkout */}
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-lime-400" />
                  <span>Live On-Floor Athletes ({activeCheckIns.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Athletes currently inside the gym with assigned physical locker keys.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Gate: <span className="text-lime-400 font-bold">{facility.turnstileGateStatus}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#142644] text-[10px] font-mono uppercase text-slate-400">
                    <th className="pb-3 font-extrabold">Athlete</th>
                    <th className="pb-3 font-extrabold">Plan</th>
                    <th className="pb-3 font-extrabold">Check-In</th>
                    <th className="pb-3 font-extrabold">Key #</th>
                    <th className="pb-3 text-right font-extrabold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#101F38]">
                  {activeCheckIns.length > 0 ? (
                    activeCheckIns.map((item) => (
                      <tr key={item.id} className="hover:bg-[#070E1C]/60 transition-colors">
                        <td className="py-3 font-bold text-white flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#070E1C] border border-[#1E3A66] overflow-hidden flex items-center justify-center text-xs font-bold text-lime-400 shrink-0">
                            {item.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photoUrl}
                                alt={item.memberName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              item.memberName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)
                            )}
                          </div>
                          <div>
                            <span>{item.memberName}</span>
                            <div className="text-[10px] font-mono text-slate-500">{item.regId}</div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-lime-300">{item.planName}</td>
                        <td className="py-3 font-mono text-slate-300">{item.checkInTime}</td>
                        <td className="py-3 font-mono text-cyan-400 font-black">
                          #{item.lockerNumber < 10 ? `0${item.lockerNumber}` : item.lockerNumber}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handlePerformCheckOut(item.id, item.memberName, item.lockerNumber)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Check Out
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No athletes currently checked in on the floor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POP-UP LOCKER KEY MATRIX TABLE MODAL                                      */}
      {/* ========================================================================= */}
      {isMatrixModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1324] border border-[#1E3A66] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#070E1C] border-b border-[#142644] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Locker Key Matrix Table ({facility.lockersTotal} Lockers)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedMember
                      ? `Assigning key for ${selectedMember.firstName} ${selectedMember.lastName} (${selectedMember.regId})`
                      : 'Click any available locker key below to select for assignment'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMatrixModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#0A1324] border border-[#142644] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-bar: Auto-Select Next, Filter Tabs & Target */}
            <div className="p-4 bg-[#0A1324] border-b border-[#142644] flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644] text-xs font-bold">
                {(
                  [
                    { id: 'AVAILABLE', label: `Available (${availableLockers.length})` },
                    { id: 'OCCUPIED', label: `Occupied (${lockers.filter((l) => l.status === 'OCCUPIED').length})` },
                    { id: 'MAINTENANCE', label: `Maint (${lockers.filter((l) => l.status === 'MAINTENANCE').length})` },
                    { id: 'ALL', label: `All ${facility.lockersTotal}` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLockerFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      lockerFilter === tab.id
                        ? 'bg-lime-400 text-black font-extrabold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick Next Available Trigger */}
              <div className="flex items-center gap-2">
                {firstAvailableLocker && (
                  <button
                    type="button"
                    onClick={() => handleSelectLockerFromMatrix(firstAvailableLocker)}
                    className="py-1.5 px-3 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/40 text-lime-400 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-lime-400" />
                    <span>Auto-Pick Next Available (#{firstAvailableLocker < 10 ? `0${firstAvailableLocker}` : firstAvailableLocker})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="p-5 overflow-y-auto flex-1 max-h-[50vh]">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {filteredLockers.map((locker) => {
                  const isSelected = activeTargetLocker === locker.number;
                  const isAvailable = locker.status === 'AVAILABLE';
                  const isOccupied = locker.status === 'OCCUPIED';
                  const isMaintenance = locker.status === 'MAINTENANCE';

                  return (
                    <button
                      key={locker.number}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) handleSelectLockerFromMatrix(locker.number);
                      }}
                      title={
                        isOccupied
                          ? `Locker #${locker.number} - Occupied by ${locker.occupiedByMemberName}`
                          : isMaintenance
                          ? `Locker #${locker.number} - Under Maintenance`
                          : `Locker #${locker.number} - Available (Click to assign)`
                      }
                      className={`h-14 rounded-xl text-xs font-mono font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-lime-400 text-black ring-2 ring-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.6)] scale-105 z-10'
                          : isAvailable
                          ? 'bg-[#070E1C] border border-emerald-500/40 text-emerald-300 hover:border-lime-400 hover:bg-[#0D1D38] hover:scale-105 shadow-sm'
                          : isOccupied
                          ? 'bg-[#101B33] border border-indigo-500/30 text-indigo-300/80 cursor-not-allowed'
                          : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-sm font-black">{locker.number < 10 ? `0${locker.number}` : locker.number}</span>
                      <span className="text-[8px] font-sans font-bold leading-none mt-0.5">
                        {isAvailable ? 'AVAILABLE' : isOccupied ? 'OCCUPIED' : 'MAINT'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matrix Modal Footer */}
            <div className="p-4 bg-[#070E1C] border-t border-[#142644] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Free
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Occupied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Maintenance
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMatrixModalOpen(false)}
                  className="py-2 px-4 bg-[#0A1324] hover:bg-[#122240] text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                {selectedMember && activeTargetLocker && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMatrixModalOpen(false);
                      handlePerformCheckIn(selectedMember);
                    }}
                    className="py-2 px-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
                  >
                    Confirm &amp; Check In (Locker #{activeTargetLocker})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPDATE PAYMENT CONFIRMATION MODAL                                         */}
      {/* ========================================================================= */}
      {paymentModalMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#142644] pb-3">
              <div className="flex items-center gap-2 text-lime-400 font-extrabold text-sm uppercase font-mono">
                <CreditCard className="w-4 h-4" />
                <span>Confirm Payment Received</span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300">
                Front desk confirmation for <strong>{paymentModalMember.firstName} {paymentModalMember.lastName}</strong> ({paymentModalMember.regId}).
              </p>
              <div className="p-3 bg-[#070E1C] rounded-xl border border-[#142644] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan:</span>
                  <span className="font-bold text-white">{paymentModalMember.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Fee:</span>
                  <span className="font-mono font-bold text-lime-400">${paymentModalMember.totalFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registration Date:</span>
                  <span className="font-mono text-slate-300">
                    {paymentModalMember.registeredAt.split('T')[0]} (Unchanged)
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase">
                SELECT PAYMENT METHOD RECEIVED
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'CARD', label: 'Card (POS)', icon: CreditCard },
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'BANK_TRANSFER', label: 'Bank / QR', icon: ArrowRightLeft },
                  ] as const
                ).map((m) => {
                  const isSel = resolveMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setResolveMethod(m.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSel
                          ? 'bg-[#0E1E38] border-lime-400 text-lime-400 shadow-xs'
                          : 'bg-[#070E1C] border-[#142644] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalMember(null)}
                className="py-2.5 px-4 bg-[#0E1E38] hover:bg-[#152B4E] text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPaymentReceived}
                className="py-2.5 px-4 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WALK-IN REGISTRATION MODAL (CONTEXT PRESERVING)                           */}
      {/* ========================================================================= */}
      <ClientRegistrationModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        defaultMode="quick"
        title="Register Walk-in Athlete"
        subtitle="Quick 30-second desk onboarding. Preserves check-in queue context."
        onSuccess={(newClient) => {
          // Find newly created member in gym store or select
          const found = members.find((m) => m.firstName.toLowerCase() === newClient.firstName.toLowerCase() && m.lastName.toLowerCase() === newClient.lastName.toLowerCase());
          if (found) {
            handleSelectMember(found);
          }
        }}
      />
    </div>
  );
}

