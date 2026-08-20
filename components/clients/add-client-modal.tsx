'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAddClientModalOpen, showToast } from '@/features/ui/uiSlice';
import { createClient } from '@/features/clients/clientsSlice';
import { clientSchema, ClientInput } from '@/lib/validations/client';
import { X, UserPlus, AlertCircle, Check } from 'lucide-react';

export default function AddClientModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAddClientModalOpen);

  const [formData, setFormData] = useState<ClientInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    fitnessGoal: '',
    fitnessLevel: 'BEGINNER',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const validationResult = clientSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      await dispatch(createClient(validationResult.data)).unwrap();
      dispatch(showToast({ message: `Client ${formData.firstName} ${formData.lastName} added successfully!`, type: 'success' }));
      dispatch(setAddClientModalOpen(false));
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        fitnessGoal: '',
        fitnessLevel: 'BEGINNER',
        notes: '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create client';
      setErrors({ global: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div
        id="modal-add-client"
        className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 text-white">
              <UserPlus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-950 text-sm">Add New Trainee</h3>
              <p className="text-[11px] text-zinc-500">Register a client into the Arche database</p>
            </div>
          </div>
          <button
            id="btn-close-client-modal"
            onClick={() => dispatch(setAddClientModalOpen(false))}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.global && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.global}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="input-first-name"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Alexander"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
              {errors.firstName && (
                <p className="text-[11px] text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="input-last-name"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Hayes"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
              {errors.lastName && (
                <p className="text-[11px] text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="input-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex.hayes@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Phone Number
              </label>
              <input
                id="input-phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Status
              </label>
              <select
                id="select-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending Onboarding</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Experience Level
              </label>
              <select
                id="select-level"
                name="fitnessLevel"
                value={formData.fitnessLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ELITE">Elite Athlete</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Primary Fitness Objective
            </label>
            <input
              id="input-goal"
              name="fitnessGoal"
              type="text"
              value={formData.fitnessGoal || ''}
              onChange={handleChange}
              placeholder="e.g. Strength conditioning, 10k run prep, body recomposition"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Trainer Notes & Health Considerations
            </label>
            <textarea
              id="input-notes"
              name="notes"
              rows={2}
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Specific injuries, training preferences, dietary notes..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => dispatch(setAddClientModalOpen(false))}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-client"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <span>Saving to Database...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
