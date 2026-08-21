'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateLockerState,
  resolveOverdueLocker,
  checkOutMember,
  LockerStatus as GymLockerStatus,
} from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import { Locker, LockerStatus, LockerZoneFilter, LockerStats } from '../types/locker.types';

export function useLockerHub() {
  const dispatch = useAppDispatch();
  const reduxLockers = useAppSelector((state) => state.gym.lockers);
  const registeredMembers = useAppSelector((state) => state.gym.members);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const lockerUsageLogs = useAppSelector((state) => state.gym.lockerUsageLogs);
  const user = useAppSelector((state) => state.auth.user);
  const staffName = user?.name || 'Staff Ops';

  // Map Redux locker items to modular Locker type
  const lockers: Locker[] = useMemo(() => {
    return reduxLockers.map((l) => {
      let zone: Locker['zone'] = 'MEN';
      if (l.number > 35) zone = 'VIP';
      else if (l.number > 20) zone = 'WOMEN';
      else if (l.number > 45) zone = 'STAFF';

      let mappedStatus: LockerStatus = 'AVAILABLE';
      if (l.status === 'OCCUPIED') {
        mappedStatus = l.isOverdue ? 'OVERDUE' : 'OCCUPIED';
      } else if (l.status === 'MAINTENANCE' || l.status === 'OUT_OF_SERVICE') {
        mappedStatus = 'MAINTENANCE';
      }

      return {
        id: `loc-${l.number}`,
        number: l.number,
        size: l.number > 40 ? 'LARGE' : l.number > 20 ? 'MEDIUM' : 'STANDARD',
        zone,
        gender: l.number <= 20 ? 'MALE' : l.number <= 35 ? 'FEMALE' : 'UNISEX',
        status: mappedStatus,
        assignedMemberName: l.occupiedByMemberName || undefined,
        assignedMemberId: l.occupiedByMemberId || undefined,
        assignedRegId: l.occupiedByRegId || undefined,
        assignedAt: l.assignedAt || (l.status === 'OCCUPIED' ? 'Active' : undefined),
        notes: l.inactiveNotes || undefined,
        isOverdue: l.isOverdue,
      };
    });
  }, [reduxLockers]);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LockerStatus | 'ALL'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'MALE' | 'FEMALE' | 'UNISEX' | 'ALL'>('ALL');
  const [zoneFilter, setZoneFilter] = useState<LockerZoneFilter>('ALL');
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  // Compute calculated statistics
  const stats: LockerStats = useMemo(() => {
    const total = lockers.length;
    const available = lockers.filter((l) => l.status === 'AVAILABLE').length;
    const occupied = lockers.filter((l) => l.status === 'OCCUPIED' || l.status === 'OVERDUE').length;
    const maintenance = lockers.filter((l) => l.status === 'MAINTENANCE').length;
    const overdue = lockers.filter((l) => l.status === 'OVERDUE').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      total,
      available,
      occupied,
      maintenance,
      overdue,
      occupancyRate,
    };
  }, [lockers]);

  // Filtered lockers
  const filteredLockers = useMemo(() => {
    return lockers.filter((locker) => {
      // Search by number, assigned member name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch =
          locker.number.toString().includes(q) || `locker ${locker.number}`.includes(q);
        const nameMatch = locker.assignedMemberName?.toLowerCase().includes(q);
        if (!numMatch && !nameMatch) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && locker.status !== statusFilter) {
        return false;
      }

      // Gender filter
      if (genderFilter !== 'ALL' && locker.gender !== genderFilter && locker.gender !== 'UNISEX') {
        return false;
      }

      // Zone filter
      if (zoneFilter !== 'ALL') {
        if (zoneFilter === 'ZONE_A' && (locker.number < 1 || locker.number > 20)) return false;
        if (zoneFilter === 'ZONE_B' && (locker.number < 21 || locker.number > 40)) return false;
        if (zoneFilter === 'ZONE_C' && (locker.number < 41 || locker.number > 60)) return false;
        if (zoneFilter === 'VIP' && locker.zone !== 'VIP') return false;
      }

      return true;
    });
  }, [lockers, searchQuery, statusFilter, genderFilter, zoneFilter]);

  // Handler to open action dialog
  const handleOpenLockerAction = useCallback((locker: Locker) => {
    setSelectedLocker(locker);
    setIsActionDialogOpen(true);
  }, []);

  const handleOpenLockerByNumber = useCallback(
    (lockerNumber: number) => {
      const found = lockers.find((l) => l.number === lockerNumber);
      if (found) {
        setSelectedLocker(found);
        setIsActionDialogOpen(true);
      } else {
        // Fallback construct locker object
        const fallbackLocker: Locker = {
          id: `loc-${lockerNumber}`,
          number: lockerNumber,
          gender: lockerNumber <= 20 ? 'MALE' : lockerNumber <= 35 ? 'FEMALE' : 'UNISEX',
          zone: lockerNumber > 35 ? 'VIP' : lockerNumber > 20 ? 'WOMEN' : 'MEN',
          status: 'AVAILABLE',
        };
        setSelectedLocker(fallbackLocker);
        setIsActionDialogOpen(true);
      }
    },
    [lockers]
  );

  const handleCloseLockerAction = useCallback(() => {
    setIsActionDialogOpen(false);
    setSelectedLocker(null);
  }, []);

  // Action: Assign Locker to Member
  const handleAssignLocker = useCallback(
    (lockerId: string, memberId: string, memberName: string) => {
      const lockerNum = selectedLocker ? selectedLocker.number : parseInt(lockerId.replace('loc-', ''), 10);
      dispatch(
        updateLockerState({
          lockerNumber: lockerNum,
          status: 'OCCUPIED',
          reason: `Assigned to ${memberName}`,
          notes: `Check-in desk assignment by ${staffName}`,
          staffLogged: staffName,
        })
      );
      dispatch(
        showToast({
          message: `Locker #${lockerNum} successfully assigned to ${memberName}`,
          type: 'success',
        })
      );
      handleCloseLockerAction();
    },
    [dispatch, selectedLocker, staffName, handleCloseLockerAction]
  );

  // Action: Release / Free Locker
  const handleReleaseLocker = useCallback(
    (lockerId: string) => {
      const lockerNum = selectedLocker ? selectedLocker.number : parseInt(lockerId.replace('loc-', ''), 10);
      const activeCI = activeCheckIns.find((c) => c.lockerNumber === lockerNum);
      if (activeCI) {
        dispatch(checkOutMember({ checkInId: activeCI.id }));
      } else {
        dispatch(
          updateLockerState({
            lockerNumber: lockerNum,
            status: 'AVAILABLE',
            reason: 'Locker released & key returned',
            staffLogged: staffName,
          })
        );
      }
      dispatch(
        showToast({
          message: `Locker #${lockerNum} has been released & unlocked`,
          type: 'info',
        })
      );
      handleCloseLockerAction();
    },
    [dispatch, selectedLocker, activeCheckIns, staffName, handleCloseLockerAction]
  );

  // Action: Toggle Maintenance
  const handleToggleMaintenance = useCallback(
    (lockerId: string, reason?: string) => {
      const lockerNum = selectedLocker ? selectedLocker.number : parseInt(lockerId.replace('loc-', ''), 10);
      const isMaint = selectedLocker?.status === 'MAINTENANCE';
      dispatch(
        updateLockerState({
          lockerNumber: lockerNum,
          status: isMaint ? 'AVAILABLE' : 'MAINTENANCE',
          reason: reason || (isMaint ? 'Repaired & Cleaned' : 'Maintenance / Lock Jam'),
          notes: reason,
          staffLogged: staffName,
        })
      );
      dispatch(
        showToast({
          message: `Locker #${lockerNum} ${
            isMaint ? 'returned to service' : 'flagged for maintenance'
          }`,
          type: 'info',
        })
      );
      handleCloseLockerAction();
    },
    [dispatch, selectedLocker, staffName, handleCloseLockerAction]
  );

  return {
    lockers: filteredLockers,
    allLockers: lockers,
    stats,
    registeredMembers,
    activeCheckIns,
    lockerUsageLogs,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    genderFilter,
    setGenderFilter,
    zoneFilter,
    setZoneFilter,
    selectedLocker,
    isActionDialogOpen,
    viewMode,
    setViewMode,
    handleOpenLockerAction,
    handleOpenLockerByNumber,
    handleCloseLockerAction,
    handleAssignLocker,
    handleReleaseLocker,
    handleToggleMaintenance,
  };
}
