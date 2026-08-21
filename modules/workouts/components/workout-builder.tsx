'use client';

import React, { useState } from 'react';
import { useWorkoutBuilder } from '../hooks/useWorkoutBuilder';
import { WorkoutPlan } from '@/types';
import { WorkoutPlanInput } from '../validations/workout.schema';
import {
  Dumbbell,
  Plus,
  Trash2,
  Calendar,
  Flame,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

export const WorkoutBuilder: React.FC = () => {
  const {
    plans,
    loading,
    error,
    selectedCategory,
    isCreating,
    setIsCreating,
    activeLevelFilter,
    setActiveLevelFilter,
    handleCategoryChange,
    handleCreatePlan,
    handleDeletePlan,
  } = useWorkoutBuilder();

  const [newPlan, setNewPlan] = useState<WorkoutPlanInput>({
    title: '',
    description: '',
    level: 'INTERMEDIATE',
    category: 'Hypertrophy',
    durationWeeks: 6,
    isPublished: true,
    exercises: [
      {
        name: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: 4,
        reps: 8,
        restSeconds: 90,
        orderIndex: 1,
      },
      {
        name: 'Incline Dumbbell Fly',
        targetMuscle: 'Upper Chest',
        sets: 3,
        reps: 12,
        restSeconds: 60,
        orderIndex: 2,
      },
    ],
  });

  const categories = [
    'ALL',
    'Hypertrophy',
    'Endurance',
    'Mobility',
    'Powerlifting',
    'Conditioning',
  ];

  const handleAddExerciseRow = () => {
    setNewPlan((prev) => ({
      ...prev,
      exercises: [
        ...(prev.exercises || []),
        {
          name: '',
          targetMuscle: 'Full Body',
          sets: 3,
          reps: 10,
          restSeconds: 60,
          orderIndex: (prev.exercises || []).length + 1,
        },
      ],
    }));
  };

  const handleRemoveExerciseRow = (index: number) => {
    setNewPlan((prev) => ({
      ...prev,
      exercises: (prev.exercises || []).filter((_, i) => i !== index),
    }));
  };

  const handleExerciseChange = (index: number, field: string, val: unknown) => {
    setNewPlan((prev) => {
      const updated = [...(prev.exercises || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, exercises: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim()) return;
    await handleCreatePlan(newPlan);
    setNewPlan({
      title: '',
      description: '',
      level: 'INTERMEDIATE',
      category: 'Hypertrophy',
      durationWeeks: 6,
      isPublished: true,
      exercises: [
        {
          name: 'Primary Compound Lift',
          targetMuscle: 'Target Muscle',
          sets: 4,
          reps: 8,
          restSeconds: 90,
          orderIndex: 1,
        },
      ],
    });
  };

  return (
    <div id="workout-builder-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Category Pills & Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0A1324] p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat.toLowerCase()}`}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#070E1C] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          id="btn-create-workout-modal"
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-black text-xs font-extrabold rounded-xl hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Build Program</span>
        </button>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <Dumbbell className="w-6 h-6 animate-pulse text-cyan-400" />
              <span>Loading programs from service...</span>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-[#0A1324] rounded-2xl border border-slate-800">
            <p className="font-bold text-white">No workout programs found in this category.</p>
            <p className="text-slate-500 text-xs mt-1">
              Click &quot;Build Program&quot; above to create your first training split.
            </p>
          </div>
        ) : (
          plans.map((plan: WorkoutPlan) => (
            <div
              key={plan.id}
              id={`workout-card-${plan.id}`}
              className="bg-[#0A1324] rounded-2xl border border-slate-800 shadow-md hover:border-cyan-500/50 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {plan.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#070E1C] px-2 py-0.5 rounded border border-slate-800">
                    {plan.level}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mb-1.5 group-hover:text-cyan-300 transition-colors">
                  {plan.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {plan.description || 'Custom structured routine created in Arche Fitness.'}
                </p>

                {/* Exercises Preview */}
                {plan.exercises && plan.exercises.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-800 mb-2">
                    <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Core Movements ({plan.exercises.length})
                    </div>
                    {plan.exercises.slice(0, 3).map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between text-xs text-slate-200 bg-[#070E1C] px-2.5 py-1.5 rounded-lg border border-slate-800/80"
                      >
                        <span className="font-medium truncate max-w-[170px]">{ex.name}</span>
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 3 && (
                      <div className="text-[11px] text-slate-500 text-right font-mono">
                        +{plan.exercises.length - 3} more movements
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-slate-800 bg-[#070E1C]/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{plan.durationWeeks} Weeks</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{plan._count?.sessions ?? 12} logged</span>
                  </span>
                  <button
                    id={`btn-delete-plan-${plan.id}`}
                    onClick={() => handleDeletePlan(plan.id, plan.title)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Delete Program"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Workout Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            id="modal-add-workout"
            className="w-full max-w-xl bg-[#0A1324] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0E1B33] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">New Training Program</h3>
                  <p className="text-[11px] text-slate-400">Entity Model &amp; Exercise Protocol Builder</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Program Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upper Body Strength & Lat Hypertrophy"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newPlan.category}
                    onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Powerlifting">Powerlifting</option>
                    <option value="Conditioning">Conditioning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
                  <select
                    value={newPlan.level}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        level: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ELITE">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                  <select
                    value={newPlan.durationWeeks}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, durationWeeks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value={4}>4 Weeks</option>
                    <option value={6}>6 Weeks</option>
                    <option value={8}>8 Weeks</option>
                    <option value={12}>12 Weeks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description &amp; Training Protocol
                </label>
                <textarea
                  rows={2}
                  placeholder="Target audience, periodization structure, warm-up instructions..."
                  value={newPlan.description || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Exercise Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Movements / Exercises</span>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                {(newPlan.exercises || []).map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#070E1C] rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Exercise name (e.g. Back Squat)"
                        value={ex.name}
                        required
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Muscle (e.g. Quads)"
                        value={ex.targetMuscle}
                        onChange={(e) =>
                          handleExerciseChange(idx, 'targetMuscle', e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min={1}
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-extrabold text-black bg-cyan-500 hover:bg-cyan-400 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  Save Workout Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;
