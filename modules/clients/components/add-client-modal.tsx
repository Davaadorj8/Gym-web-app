'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAddClientModalOpen } from '@/features/ui/uiSlice';
import { ClientRegistrationModal } from './client-registration-modal';

export const AddClientModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAddClientModalOpen);

  return (
    <ClientRegistrationModal
      isOpen={isOpen}
      onClose={() => dispatch(setAddClientModalOpen(false))}
      defaultMode="quick"
    />
  );
};

export default AddClientModal;
