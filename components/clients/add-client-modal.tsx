'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAddClientModalOpen } from '@/features/ui/uiSlice';
import { ClientRegistrationModal } from './client-registration-modal';

export default function AddClientModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAddClientModalOpen);

  return (
    <ClientRegistrationModal
      isOpen={isOpen}
      onClose={() => dispatch(setAddClientModalOpen(false))}
      defaultMode="quick"
    />
  );
}
