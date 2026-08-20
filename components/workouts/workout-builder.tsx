'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchWorkouts,
  createWorkout,
  deleteWorkout,
  setFilterCategory,
} from '@/features/workouts/workoutsSlice';
import { setAddWorkoutModalOpen, showToast } from '@/features/ui/uiSlice';
import { WorkoutPlan } from '@/types';
import { WorkoutPlanInput } from '@/lib/validations/workout';
import {
  Dumbbell,
  Plus,
  Trash2,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  X,
} from 'lucide-react';

export default function WorkoutBuilder() {
  const dispatch = useAppDispatch();
  const { items: plans, loading, filterCategory } = useAppSelector((state) => state.workouts);
  const isAddModalOpen = useAppSelector((state) => state.ui.isAddWorkoutModalOpen);

  const [newPlan, setNewPlan] = useState<WorkoutPlanInput>({
    title: '',
    description: '',
    level: 'INTERMEDIATE',
    category: 'Hypertrophy',
    durationWeeks: 6,
    isPublished: true,
    exercises: [
      { name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: 8, restSeconds: 90, orderIndex: 1 },
      { name: 'Incline Dumbbell Fly', targetMuscle: 'Upper Chest', sets: 3, reps: 12, restSeconds: 60, orderIndex: 2 }
    ],
  });

  const categories = ['ALL', 'Hypertrophy', 'Endurance', 'Mobility', 'Powerlifting', 'Conditioning'];

  useEffect(() => {
    dispatch(fetchWorkouts({ category: filterCategory }));
  }, [dispatch, filterCategory]);

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

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim()) return;

    try {
      await dispatch(createWorkout(newPlan)).unwrap();
      dispatch(showToast({ message: `Workout Program "${newPlan.title}" created successfully!`, type: 'success' }));
      dispatch(setAddWorkoutModalOpen(false));
      setNewPlan({
        title: '',
        description: '',
        level: 'INTERMEDIATE',
        category: 'Hypertrophy',
        durationWeeks: 6,
        isPublished: true,
        exercises: [
          { name: 'Primary Compound Lift', targetMuscle: 'Target Muscle', sets: 4, reps: 8, restSeconds: 90, orderIndex: 1 }
        ],
      });
    } catch (err: unknown) {
      console.error(err);
      dispatch(showToast({ message: 'Failed to create workout plan', type: 'error' }));
    }
  };

  const handleDeletePlan = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await dispatch(deleteWorkout(id)).unwrap();
      dispatch(showToast({ message: `Workout program deleted`, type: 'info' }));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat.toLowerCase()}`}
              onClick={() => dispatch(setFilterCategory(cat))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterCategory === cat
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          id="btn-create-workout-modal"
          onClick={() => dispatch(setAddWorkoutModalOpen(true))}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Build Program</span>
        </button>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <Dumbbell className="w-6 h-6 animate-pulse text-zinc-500" />
              <span>Loading programs from service...</span>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-white rounded-xl border border-zinc-200">
            <p className="font-semibold text-zinc-800">No workout programs found in this category.</p>
            <p className="text-zinc-400 text-xs mt-1">Click &quot;Build Program&quot; above to create your first training split.</p>
          </div>
        ) : (
          plans.map((plan: WorkoutPlan) => (
            <div
              key={plan.id}
              id={`workout-card-${plan.id}`}
              className="bg-white rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {plan.category}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    {plan.level}
                  </span>
                </div>

                <h3 className="font-bold text-zinc-950 text-base mb-1.5">{plan.title}</h3>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                  {plan.description || 'Custom structured routine created in Arche Fitness.'}
                </p>

                {/* Exercises Preview */}
                {plan.exercises && plan.exercises.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-zinc-100 mb-2">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Core Movements ({plan.exercises.length})
                    </div>
                    {plan.exercises.slice(0, 3).map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between text-xs text-zinc-700 bg-zinc-50/80 px-2.5 py-1.5 rounded-md"
                      >
                        <span className="font-medium truncate max-w-[170px]">{ex.name}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 3 && (
                      <div className="text-[11px] text-zinc-400 text-right">
                        +{plan.exercises.length - 3} more movements
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{plan.durationWeeks} Weeks</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{plan._count?.sessions ?? 12} logged</span>
                  </span>
                  <button
                    id={`btn-delete-plan-${plan.id}`}
                    onClick={() => handleDeletePlan(plan.id, plan.title)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
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
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div
            id="modal-add-workout"
            className="w-full max-w-xl bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-900 text-white">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-sm">New Training Program</h3>
                  <p className="text-[11px] text-zinc-500">Prisma & Neon Entity Model Builder</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setAddWorkoutModalOpen(false))}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Program Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upper Body Strength & Lat Hypertrophy"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                  <select
                    value={newPlan.category}
                    onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white"
                  >
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Powerlifting">Powerlifting</option>
                    <option value="Conditioning">Conditioning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Level</label>
                  <select
                    value={newPlan.level}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        level: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ELITE">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Duration</label>
                  <select
                    value={newPlan.durationWeeks}
                    onChange={(e) => setNewPlan({ ...newPlan, durationWeeks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white"
                  >
                    <option value={4}>4 Weeks</option>
                    <option value={6}>6 Weeks</option>
                    <option value={8}>8 Weeks</option>
                    <option value={12}>12 Weeks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description & Philosophy</label>
                <textarea
                  rows={2}
                  placeholder="Target audience, periodization structure, warm-up instructions..."
                  value={newPlan.description || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                ></textarea>
              </div>

              {/* Exercise Items List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800">Movements / Exercises</span>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                {(newPlan.exercises || []).map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Exercise name (e.g. Back Squat)"
                        value={ex.name}
                        required
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white rounded border border-zinc-200"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Muscle (e.g. Quads)"
                        value={ex.targetMuscle}
                        onChange={(e) => handleExerciseChange(idx, 'targetMuscle', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white rounded border border-zinc-200"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs bg-white rounded border border-zinc-200"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min={1}
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs bg-white rounded border border-zinc-200"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(idx)}
                        className="text-zinc-400 hover:text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => dispatch(setAddWorkoutModalOpen(false))}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg shadow-xs"
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
}
