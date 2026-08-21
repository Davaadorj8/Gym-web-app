'use client';

import React, { useEffect } from 'react';
import { ClientForm } from './client-form';
import { ClientFormData } from '../validations/client.schema';
import { useClientRegistration } from '../hooks/useClientRegistration';
import { UserPlus, X } from 'lucide-react';

export interface ClientRegistrationModalProps {
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
  const { loading, registerAthlete } = useClientRegistration({
    onSuccess,
    onClose,
  });

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
    await registerAthlete(data);
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
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
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
