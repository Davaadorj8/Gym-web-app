'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkOutMember } from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import {
  LogOut,
  Search,
  X,
  KeyRound,
  Phone,
  Clock,
  Users,
} from 'lucide-react';

interface QuickCheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCheckOutModal({ isOpen, onClose }: QuickCheckOutModalProps) {
  const dispatch = useAppDispatch();
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const members = useAppSelector((state) => state.gym.members);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Map active check-ins with member details (like phone number)
  const enrichedCheckIns = useMemo(() => {
    return activeCheckIns.map((checkIn) => {
      const member = members.find((m) => m.id === checkIn.memberId);
      const referenceTime = currentTime || checkIn.checkInTimestamp;
      const elapsedMinutes = Math.max(
        1,
        Math.round((referenceTime - checkIn.checkInTimestamp) / (1000 * 60))
      );
      return {
        ...checkIn,
        phone: member?.phone || 'No phone recorded',
        email: member?.email || '',
        elapsedMinutes,
      };
    });
  }, [activeCheckIns, members, currentTime]);

  // Filter by name, phone, or locker number
  const filteredCheckIns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase().replace(/^#/, '');
    if (!query) return enrichedCheckIns;

    return enrichedCheckIns.filter((item) => {
      const matchName = item.memberName.toLowerCase().includes(query);
      const matchPhone = item.phone.toLowerCase().replace(/\D/g, '').includes(query.replace(/\D/g, '')) || item.phone.toLowerCase().includes(query);
      const matchLocker = item.lockerNumber.toString() === query || 
        (item.lockerNumber < 10 && `0${item.lockerNumber}` === query) ||
        `locker ${item.lockerNumber}`.includes(query);
      const matchReg = item.regId.toLowerCase().includes(query);

      return matchName || matchPhone || matchLocker || matchReg;
    });
  }, [enrichedCheckIns, searchQuery]);

  const handleCheckout = (checkInId: string, memberName: string, lockerNumber: number) => {
    dispatch(checkOutMember({ checkInId }));
    dispatch(
      showToast({
        message: `Checked out ${memberName}. Locker #${lockerNumber < 10 ? `0${lockerNumber}` : lockerNumber} is now available.`,
        type: 'success',
      })
    );
    if (activeCheckIns.length <= 1) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A1324] border border-[#1E3A66] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-[#070E1C] border-b border-[#142644] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Quick Check Out
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[11px] font-mono font-bold">
                  {activeCheckIns.length} On-Floor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Check out active athletes via member name, phone number, or locker key number
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0A1324] border border-[#142644] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-[#0A1324] border-b border-[#142644] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by athlete name, phone (e.g. 555-234), or locker key (e.g. 12)..."
              className="w-full bg-[#070E1C] border border-[#1E3A66] focus:border-red-400/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Athletes List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5 max-h-[420px]">
          {filteredCheckIns.length > 0 ? (
            filteredCheckIns.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#142644] bg-[#070E1C] hover:border-[#1E3A66] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                {/* Athlete Profile & Details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A1324] border border-[#1E3A66] overflow-hidden flex items-center justify-center text-xs font-bold text-lime-400 shrink-0">
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
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">
                        {item.memberName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {item.regId}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Phone className="w-3 h-3 text-cyan-400" />
                        <span>{item.phone}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>In at {item.checkInTime} ({item.elapsedMinutes}m on floor)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Locker Key & Checkout Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#142644]">
                  <div className="px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 flex items-center gap-1.5 font-mono font-bold text-xs">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Locker #{item.lockerNumber < 10 ? `0${item.lockerNumber}` : item.lockerNumber}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheckout(item.id, item.memberName, item.lockerNumber)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-400">
                {activeCheckIns.length === 0
                  ? 'No Athletes Currently On-Floor'
                  : 'No Matching Athlete Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {activeCheckIns.length === 0
                  ? 'All athletes have been checked out and locker keys have been returned.'
                  : `No on-floor athlete matched "${searchQuery}". Check the name, phone number, or locker key number.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070E1C] border-t border-[#142644] flex items-center justify-between shrink-0 text-xs text-slate-400">
          <span>
            Checking out frees the assigned locker key and logs session duration automatically.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-3.5 bg-[#0A1324] hover:bg-[#122240] text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
