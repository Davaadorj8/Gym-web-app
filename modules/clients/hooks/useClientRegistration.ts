'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addClient } from '../slice/clientsSlice';
import { registerMember, RegisteredMember } from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import { ClientFormData } from '../validations/client.schema';

interface UseClientRegistrationOptions {
  onSuccess?: (newClient: any) => void;
  onClose?: () => void;
}

export function useClientRegistration({ onSuccess, onClose }: UseClientRegistrationOptions = {}) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const registerAthlete = async (data: ClientFormData) => {
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
        email:
          data.email ||
          `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`,
        phone: data.phone,
        dob: data.dateOfBirth,
        gender: data.gender,
        emergencyContact: data.emergencyContactName
          ? `${data.emergencyContactName} (${data.emergencyRelation || 'Contact'} - ${
              data.emergencyContactPhone || 'N/A'
            })`
          : undefined,
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
      if (onClose) {
        onClose();
      }
      return createdClient;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register athlete';
      console.error('Failed to create client:', errorMsg);
      dispatch(showToast({ message: errorMsg, type: 'error' }));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    registerAthlete,
  };
}
