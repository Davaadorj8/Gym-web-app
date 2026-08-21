'use client';

import React, { useState, useEffect } from 'react';
import { ClientForm } from './client-form';
import { ClientFormData } from '@/lib/validations/client';
import { useAppDispatch } from '@/store/hooks';
import { addClient } from '@/features/clients/clientsSlice';
import { registerMember, RegisteredMember } from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import { UserPlus, X, Shield, Sparkles } from 'lucide-react';

interface ClientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newClient: any) => void;
  defaultMode?: 'quick' | 'full';
  initialData?: Partial<ClientFormData>;
  title?: string;
  subtitle?: string;
}

export const ClientRegistrationModal: React.FC<ClientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'quick',
  initialData,
  title = 'Register Athlete / Member',
  subtitle = 'Complete fast onboarding or expand for medical & emergency details.',
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      
      // 1. Create client in Clients store & database API
      const createdClient = await dispatch(addClient(data)).unwrap();

      // 2. Synchronize with Gym Check-In Member list so desk is immediately ready
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
        registeredByStaffName: 'Front Desk Lead',
        registeredAt: new Date().toISOString(),
        status: 'ACTIVE',
      };

      dispatch(registerMember(newMember));

      dispatch(
        showToast({
          message: `Athlete ${data.firstName} ${data.lastName} registered successfully! (ID: ${regId})`,
          type: 'success',
        })
      );

      if (onSuccess) {
        onSuccess(createdClient);
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register athlete';
      console.error('Failed to create client:', errorMsg);
      dispatch(showToast({ message: errorMsg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="client-registration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="client-registration-modal-container"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-700/80 bg-[#0A1324] shadow-2xl shadow-cyan-950/30 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0E1B33] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ClientForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={loading}
            mode={defaultMode}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientRegistrationModal;
