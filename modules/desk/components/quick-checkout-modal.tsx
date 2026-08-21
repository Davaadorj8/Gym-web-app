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

export const QuickCheckOutModal: React.FC<QuickCheckOutModalProps> = ({ isOpen, onClose }) => {
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

  // Map active check-ins with member details
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
      const matchPhone =
        item.phone.toLowerCase().replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
        item.phone.toLowerCase().includes(query);
      const matchLocker =
        item.lockerNumber.toString() === query ||
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
        message: `Checked out ${memberName}. Locker #${
          lockerNumber < 10 ? `0${lockerNumber}` : lockerNumber
        } is now available.`,
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
              <p className="text-xs text-slate-400">
                Release locker keys and mark athlete workout session completed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0E1E38] hover:bg-[#142644] text-slate-400 hover:text-white flex items-center justify-center transition border border-[#1E3A66] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-[#0A1324] border-b border-[#142644] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search by athlete name, phone, reg ID, or locker #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#070E1C] border border-[#1E3A66] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List of Active Check-Ins */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-800/40">
          {filteredCheckIns.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-slate-600" />
              <p className="text-sm font-semibold">
                {activeCheckIns.length === 0
                  ? 'No athletes currently checked in on the floor.'
                  : `No checked-in athletes match "${searchQuery}"`}
              </p>
              <p className="text-xs text-slate-500">
                {activeCheckIns.length === 0
                  ? 'Use the Check-In Desk to log incoming athletes.'
                  : 'Try searching by member name, ID, or locker number.'}
              </p>
            </div>
          ) : (
            filteredCheckIns.map((ci) => (
              <div
                key={ci.id}
                className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#070E1C] border border-[#142644] hover:border-[#1E3A66] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {ci.regId.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm tracking-tight">
                        {ci.memberName}
                      </span>
                      <span className="px-2 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {ci.regId}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        In: {ci.checkInTime} ({ci.elapsedMinutes}m ago)
                      </span>
                      {ci.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {ci.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  {ci.lockerNumber ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1E38] border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        Locker #{ci.lockerNumber < 10 ? `0${ci.lockerNumber}` : ci.lockerNumber}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">No Locker</span>
                  )}

                  <button
                    onClick={() => handleCheckout(ci.id, ci.memberName, ci.lockerNumber)}
                    className="px-4 py-1.5 bg-red-600/90 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Check Out</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070E1C] border-t border-[#142644] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            Showing <strong className="text-white">{filteredCheckIns.length}</strong> of{' '}
            <strong className="text-white">{activeCheckIns.length}</strong> active members
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#0E1E38] hover:bg-[#142644] text-slate-300 text-xs font-semibold transition border border-[#1E3A66] cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickCheckOutModal;
