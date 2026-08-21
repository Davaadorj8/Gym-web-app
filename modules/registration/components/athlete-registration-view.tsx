'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { showToast } from '@/features/ui/uiSlice';
import { addClient } from '@/features/clients/clientsSlice';
import { registerMember, RegisteredMember } from '@/features/gym/gymSlice';
import { ClientForm } from '@/components/clients/client-form';
import { ClientFormData } from '@/lib/validations/client';
import {
  UserPlus,
  Zap,
  CheckCircle,
  Shield,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function AthleteRegistrationView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentlyRegistered, setRecentlyRegistered] = useState<{
    name: string;
    regId: string;
    membershipType: string;
  } | null>(null);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      
      // 1. Dispatch createClient
      const createdClient = await dispatch(addClient(data)).unwrap();

      // 2. Synchronize with Gym Slice
      const planNameMap: Record<string, string> = {
        STANDARD: 'Standard Monthly (1 Mo)',
        PREMIUM: '3 Months - Pro Athlete (3 Mo)',
        VIP: '1 Year - Elite Unlimited (12 Mo)',
        DAY_PASS: 'Day Pass (1 Day)',
      };

      const durationMap: Record<string, number> = {
        STANDARD: 1,
        PREMIUM: 3,
        VIP: 12,
        DAY_PASS: 1,
      };

      const feeMap: Record<string, number> = {
        STANDARD: 110,
        PREMIUM: 299,
        VIP: 999,
        DAY_PASS: 25,
      };

      const regId = `ARC-${Math.floor(1000 + Math.random() * 9000)}`;
      const startDate = data.startDate || new Date().toISOString().split('T')[0];
      const duration = durationMap[data.membershipType] || 1;
      
      const expiryDateObj = new Date(startDate);
      expiryDateObj.setMonth(expiryDateObj.getMonth() + duration);
      const expiryDate = expiryDateObj.toISOString().split('T')[0];

      const newMember: RegisteredMember = {
        id: createdClient.id || `mem-${Date.now()}`,
        regId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`,
        phone: data.phone,
        dob: data.dateOfBirth,
        gender: data.gender,
        emergencyContact: data.emergencyContactName ? `${data.emergencyContactName} (${data.emergencyRelation || 'Contact'} - ${data.emergencyContactPhone || 'N/A'})` : undefined,
        medicalNotes: data.medicalNotes,
        photoUrl: null,
        planId: `plan-${data.membershipType.toLowerCase()}`,
        planName: planNameMap[data.membershipType] || 'Standard Pass',
        durationMonths: duration,
        startDate,
        expiryDate,
        totalFee: feeMap[data.membershipType] || 110,
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        registeredByStaffId: 'staff-active',
        registeredByStaffName: 'Registration Desk',
        registeredAt: new Date().toISOString(),
        status: 'ACTIVE',
      };

      dispatch(registerMember(newMember));

      setRecentlyRegistered({
        name: `${data.firstName} ${data.lastName}`,
        regId,
        membershipType: planNameMap[data.membershipType] || data.membershipType,
      });

      dispatch(
        showToast({
          message: `Athlete ${data.firstName} ${data.lastName} registered successfully! (ID: ${regId})`,
          type: 'success',
        })
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register athlete';
      console.error('Failed to create client:', errorMsg);
      dispatch(showToast({ message: errorMsg, type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.35)] shrink-0">
            <UserPlus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Athlete &amp; Member Registration
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Unified registration terminal with progressive medical and emergency disclosure
            </p>
          </div>
        </div>

        <Link
          href="/desk"
          className="py-2.5 px-4 bg-[#0E1E38] hover:bg-[#152B4E] border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <UserCheck className="w-4 h-4 text-lime-400" />
          <span>Go to Check-in Desk</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Success Notification Banner */}
      {recentlyRegistered && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {recentlyRegistered.name} is now registered!
              </div>
              <div className="text-xs text-emerald-400/90 font-mono">
                Assigned ID: {recentlyRegistered.regId} &bull; {recentlyRegistered.membershipType}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/desk')}
              className="px-3 py-1.5 bg-emerald-500 text-black font-extrabold text-xs rounded-lg hover:bg-emerald-400 transition cursor-pointer"
            >
              Check-In Now
            </button>
            <button
              type="button"
              onClick={() => setRecentlyRegistered(null)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-700 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Unified Form Card */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 sm:p-8 shadow-xl">
        <ClientForm
          mode="full"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard')}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
