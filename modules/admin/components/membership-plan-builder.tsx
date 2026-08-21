'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addMembershipPlan,
  deleteMembershipPlan,
  MembershipPlan,
} from '@/features/gym/gymSlice';
import { showToast } from '@/features/ui/uiSlice';
import {
  Box,
  Layers,
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  Award,
  UserCheck,
  Building2,
} from 'lucide-react';

type PlanCategoryKey = 'UNDER_18' | 'OVER_18' | 'ORGANIZATION';

interface CategoryConfig {
  key: PlanCategoryKey;
  stepNumber: string;
  badgeLabel: string;
  name: string;
  description: string;
  categoryTag: string;
  color: string;
  badgeColorClass: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'UNDER_18',
    stepNumber: '1. UNDER 18',
    badgeLabel: 'Under 18',
    name: 'Youth & Student Pass',
    description: 'For members aged under 18',
    categoryTag: 'Under 18',
    color: '#F59E0B',
    badgeColorClass: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
    icon: Award,
  },
  {
    key: 'OVER_18',
    stepNumber: '2. OVER 18',
    badgeLabel: 'Over 18',
    name: 'Adult Full Access Pass',
    description: 'Standard adult athlete membership',
    categoryTag: 'Over 18',
    color: '#10B981',
    badgeColorClass: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
    icon: UserCheck,
  },
  {
    key: 'ORGANIZATION',
    stepNumber: '3. ORGANIZATION',
    badgeLabel: 'Organization',
    name: 'Corporate & Group',
    description: 'Company/Team institutional plan',
    categoryTag: 'Organization',
    color: '#A855F7',
    badgeColorClass: 'bg-purple-950/60 border-purple-500/40 text-purple-400',
    icon: Building2,
  },
];

export default function MembershipPlanBuilder() {
  const dispatch = useAppDispatch();
  const membershipPlans = useAppSelector((state) => state.gym.membershipPlans);

  // Form State
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<PlanCategoryKey>('OVER_18');
  const [customPlanTitle, setCustomPlanTitle] = useState('');
  const [specializedLessons, setSpecializedLessons] = useState('');
  const [durationMonths, setDurationMonths] = useState<number | string>(1);
  const [price, setPrice] = useState<number | string>(100);

  const selectedCategory = CATEGORIES.find((c) => c.key === selectedCategoryKey) || CATEGORIES[1];

  const handleBuildAndSavePlan = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedDuration = Math.max(1, parseInt(String(durationMonths), 10) || 1);
    const parsedPrice = Math.max(0, parseFloat(String(price)) || 100);

    // Derive a clean, professional title
    let planTitle = customPlanTitle.trim();
    if (!planTitle) {
      if (parsedDuration === 1) {
        planTitle = selectedCategoryKey === 'OVER_18' ? '1 Month - Starter Pass' : `${selectedCategory.name}`;
      } else if (parsedDuration === 12) {
        planTitle = '1 Year - Elite Unlimited';
      } else {
        planTitle = `${parsedDuration} Months - ${selectedCategory.name}`;
      }
    }

    const newPlan: MembershipPlan = {
      id: `plan-${Date.now()}`,
      name: planTitle,
      category: selectedCategory.categoryTag,
      price: parsedPrice,
      durationMonths: parsedDuration,
      description: specializedLessons.trim() || selectedCategory.description,
      specializedLessons: specializedLessons.trim() || undefined,
      color: selectedCategory.color,
    };

    dispatch(addMembershipPlan(newPlan));
    dispatch(
      showToast({
        message: `Plan "${newPlan.name}" built and added to active inventory!`,
        type: 'success',
      })
    );

    // Reset optional fields
    setCustomPlanTitle('');
    setSpecializedLessons('');
  };

  const handleDeletePlan = (plan: MembershipPlan) => {
    dispatch(deleteMembershipPlan(plan.id));
    dispatch(
      showToast({
        message: `Removed plan: "${plan.name}"`,
        type: 'info',
      })
    );
  };

  const getCategoryBadgeClass = (catStr: string) => {
    const lower = catStr.toLowerCase();
    if (lower.includes('under') || lower.includes('youth')) {
      return 'bg-amber-950/60 border-amber-500/40 text-amber-400';
    }
    if (lower.includes('org') || lower.includes('corp')) {
      return 'bg-purple-950/60 border-purple-500/40 text-purple-400';
    }
    return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Target Container Card matching Focus Selector */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0E1E2E] border border-lime-500/30 text-lime-400 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(163,230,53,0.15)]">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Membership Plan Builder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Construct structured membership categories with customized specializations and prices.
            </p>
          </div>
        </div>

        {/* Builder Form Formatter */}
        <form onSubmit={handleBuildAndSavePlan} className="space-y-6">
          {/* 1. SELECT BLOCK 1 (CATEGORY TARGET) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
              <Layers className="w-4 h-4" />
              <span>1. SELECT BLOCK 1 (CATEGORY TARGET)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategoryKey === cat.key;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategoryKey(cat.key)}
                    className={`rounded-xl p-4 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#070E1C] border-2 border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                        : 'bg-[#070E1C] border border-[#142644] hover:border-[#1E3A66]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <IconComponent className="w-5 h-5 text-lime-400 shrink-0" />
                        <span className="text-[10px] font-mono font-bold text-lime-400 uppercase tracking-wider">
                          {cat.stepNumber}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white tracking-tight">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. BLOCK 2 (CUSTOM TITLE & SPECIALIZED TRAINING LESSONS) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>2. BLOCK 2 (CUSTOM TITLE &amp; SPECIALIZED TRAINING LESSONS)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  CUSTOM PLAN TITLE (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={customPlanTitle}
                  onChange={(e) => setCustomPlanTitle(e.target.value)}
                  placeholder="e.g. Executive Pro Pass (or leave blank for standard category name)"
                  className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  SPECIALIZED LESSONS / MODULES (CAN BE EMPTY)
                </label>
                <input
                  type="text"
                  value={specializedLessons}
                  onChange={(e) => setSpecializedLessons(e.target.value)}
                  placeholder="e.g. Includes Personal Trainer + Swimming & Boxing Lessons"
                  className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. BLOCK 3 (DURATION & PRICING) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
              <DollarSign className="w-4 h-4" />
              <span>3. BLOCK 3 (DURATION &amp; PRICING)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  DURATION (MONTHS)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  PRICE ($ USD)
                </label>
                <div className="relative flex items-center bg-[#070E1C] border border-[#142644] focus-within:border-lime-400 rounded-xl px-4 py-2.5 transition-colors">
                  <span className="text-slate-400 font-mono font-bold text-sm mr-2">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent font-mono font-bold text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full bg-[#A3E635] hover:bg-[#bef264] text-black font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Build &amp; Save Plan</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Active Built Plans Inventory Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            ACTIVE BUILT PLANS INVENTORY ({membershipPlans?.length || 0})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {membershipPlans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#070E1C] border border-[#142644] hover:border-[#1E3A66] rounded-xl p-4 space-y-3 transition-all relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Top Row: Category and Duration Badge + Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getCategoryBadgeClass(
                        plan.category
                      )}`}
                    >
                      {plan.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {plan.durationMonths === 12
                        ? '12 Months'
                        : `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan)}
                    title={`Delete ${plan.name}`}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plan Title */}
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    {plan.name}
                  </h4>
                  {plan.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Row at Bottom */}
              <div className="flex items-center justify-between pt-3 border-t border-[#142644]">
                <span className="text-xs text-slate-400 font-medium">Plan Price:</span>
                <div className="bg-[#0A1324] border border-[#142644] rounded-lg px-3 py-1 flex items-center gap-1.5 font-mono">
                  <span className="text-slate-400 text-xs">$</span>
                  <span className="text-lime-400 font-black text-sm">{plan.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
