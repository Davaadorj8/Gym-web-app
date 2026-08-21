'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTab } from '@/features/ui/uiSlice';

export function useAnalyticsData() {
  const dispatch = useAppDispatch();
  const facility = useAppSelector((state) => state.gym.facility);
  const members = useAppSelector((state) => state.gym.members);
  const activeCheckIns = useAppSelector((state) => state.gym.activeCheckIns);
  const lockers = useAppSelector((state) => state.gym.lockers);
  const membershipPlans = useAppSelector((state) => state.gym.membershipPlans);
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER';

  // 1. Available / Occupied Lockers
  const totalLockers = facility.lockersTotal || lockers.length || 50;
  const occupiedLockers =
    lockers.filter((l) => l.status === 'OCCUPIED').length || facility.lockersOccupied;
  const overdueLockersCount = lockers.filter((l) => l.isOverdue).length;
  const maintenanceLockersCount = lockers.filter(
    (l) => l.status === 'MAINTENANCE' || l.status === 'OUT_OF_SERVICE'
  ).length;
  const availableLockers = Math.max(0, totalLockers - occupiedLockers - maintenanceLockersCount);

  // 2. Currently in Gym
  const currentlyInGym = activeCheckIns.length || facility.activeOccupancy;

  // 3. Subscriptions / Revenue Value
  const activeMembers = useMemo(() => members.filter((m) => m.status === 'ACTIVE'), [members]);
  const totalRevenue = useMemo(() => {
    return members.reduce((sum, m) => sum + (m.totalFee || 0), 0);
  }, [members]);

  // 4. Expiring / Unpaid
  const now = new Date();
  const unpaidCount = members.filter((m) => m.paymentStatus === 'PENDING').length;
  const expiringCount = members.filter((m) => {
    if (!m.expiryDate) return false;
    const expiry = new Date(m.expiryDate);
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const totalFlagged = unpaidCount + expiringCount;

  // 5. Hourly Traffic Data
  const hourlyTrafficData = useMemo(() => {
    return [
      { time: '06:00', checkIns: 4 },
      { time: '08:00', checkIns: 12 },
      { time: '10:00', checkIns: 8 },
      { time: '12:00', checkIns: 15 },
      { time: '14:00', checkIns: 7 },
      { time: '16:00', checkIns: 14 },
      { time: '18:00', checkIns: 24 },
      { time: '20:00', checkIns: 18 },
      { time: '22:00', checkIns: 6 },
    ];
  }, []);

  // 6. Membership Breakdown
  const planBreakdown = useMemo(() => {
    const totalCount = members.length || 1;
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const pName = m.planName || 'Standard Pass';
      counts[pName] = (counts[pName] || 0) + 1;
    });

    const colors = ['#22d3ee', '#38bdf8', '#818cf8', '#a78bfa', '#c084fc'];
    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: count,
      percent: Math.round((count / totalCount) * 100),
      color: colors[index % colors.length],
    }));
  }, [members]);

  const navigateTab = (tab: any) => {
    dispatch(setActiveTab(tab));
  };

  return {
    facility,
    members,
    activeCheckIns,
    lockers,
    membershipPlans,
    user,
    role,
    isAdmin,
    totalLockers,
    occupiedLockers,
    overdueLockersCount,
    maintenanceLockersCount,
    availableLockers,
    currentlyInGym,
    activeMembers,
    totalRevenue,
    unpaidCount,
    expiringCount,
    totalFlagged,
    hourlyTrafficData,
    planBreakdown,
    navigateTab,
  };
}
