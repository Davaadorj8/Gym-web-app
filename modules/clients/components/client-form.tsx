'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, ClientFormData } from '../validations/client.schema';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
} from 'lucide-react';

export interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'quick' | 'full';
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'quick',
}) => {
  const [showExtendedDetails, setShowExtendedDetails] = useState(mode === 'full');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      gender: initialData?.gender || 'MALE',
      dateOfBirth: initialData?.dateOfBirth || '',
      membershipType: initialData?.membershipType || 'STANDARD',
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      rfidTag: initialData?.rfidTag || '',
      emergencyContactName: initialData?.emergencyContactName || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      emergencyRelation: initialData?.emergencyRelation || '',
      medicalNotes: initialData?.medicalNotes || '',
      fitnessGoals: initialData?.fitnessGoals || '',
      waiverSigned: initialData?.waiverSigned ?? true,
      assignedTrainerId: initialData?.assignedTrainerId || '',
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: Core Essentials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
              1
            </span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Essential Information (Core Identity)
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            * Required for check-in
          </span>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              First Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative mt-1">
              <input
                {...register('firstName')}
                placeholder="e.g. Alexander"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Last Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative mt-1">
              <input
                {...register('lastName')}
                placeholder="e.g. Hayes"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            {errors.lastName && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative mt-1">
              <input
                {...register('phone')}
                placeholder="+976 9911-2233"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Email Address <span className="text-slate-400 text-[10px] font-normal">(Optional for Walk-in)</span>
            </label>
            <div className="relative mt-1">
              <input
                {...register('email')}
                type="email"
                placeholder="alex.hayes@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Gender and Birth Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300">Gender</label>
            <select
              {...register('gender')}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other / Non-Binary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Date of Birth</label>
            <input
              type="date"
              {...register('dateOfBirth')}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Membership Tier & RFID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300">Membership Tier</label>
            <select
              {...register('membershipType')}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="STANDARD">Standard Monthly ($110/mo)</option>
              <option value="PREMIUM">Premium / All-Access ($299/qtr)</option>
              <option value="VIP">VIP Athlete ($999/yr)</option>
              <option value="DAY_PASS">Day Pass ($25/day)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Start Date</label>
            <input
              type="date"
              {...register('startDate')}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">RFID / Card Tag</label>
            <input
              {...register('rfidTag')}
              placeholder="Scan badge or RFID ID"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Progressive Disclosure Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowExtendedDetails(!showExtendedDetails)}
          className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left transition hover:border-cyan-500/40 hover:bg-slate-800/80 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-500/20 text-xs font-bold text-cyan-400">
              2
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300">
              {showExtendedDetails
                ? 'Collapse Emergency & Medical Profile'
                : '+ Expand Emergency Contact, Medical Notes & Fitness Goals'}
            </span>
          </div>
          {showExtendedDetails ? (
            <ChevronUp className="h-4 w-4 text-cyan-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-cyan-400" />
          )}
        </button>
      </div>

      {/* Section 2: Extended Details (Progressive Collapsible) */}
      {showExtendedDetails && (
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Emergency &amp; Medical Profile
            </h4>
            <span className="text-[11px] text-slate-400">Optional for quick walk-ins</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Emergency Contact Name
              </label>
              <input
                {...register('emergencyContactName')}
                placeholder="e.g. Maria Hayes"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Relationship</label>
              <input
                {...register('emergencyRelation')}
                placeholder="e.g. Spouse / Parent / Friend"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Emergency Phone
              </label>
              <input
                {...register('emergencyContactPhone')}
                placeholder="+976 9900-1122"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Medical Conditions / Injury History
              </label>
              <textarea
                {...register('medicalNotes')}
                rows={2}
                placeholder="Asthma, previous shoulder surgery, hypertension, allergies..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Primary Fitness &amp; Physical Goals
              </label>
              <textarea
                {...register('fitnessGoals')}
                rows={2}
                placeholder="Hypertrophy, strength rehabilitation, 5K prep, mobility..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Waiver & Terms */}
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3 border border-slate-700/60">
            <input
              type="checkbox"
              id="waiverSigned"
              {...register('waiverSigned')}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="waiverSigned" className="text-xs text-slate-300 cursor-pointer select-none">
              <span className="font-semibold text-white">Liability Waiver &amp; Facility Agreement:</span> Athlete / Guardian has reviewed and accepted the Arche Gym terms of safety.
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(6,182,212,0.35)] transition hover:bg-cyan-400 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Saving Member...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save &amp; Register Member</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
export default ClientForm;
