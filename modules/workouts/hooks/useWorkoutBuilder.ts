'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchWorkouts,
  createWorkoutPlan,
  deleteWorkoutPlan,
  setSelectedCategory,
  setSelectedPlan,
} from '../slice/workoutsSlice';
import { showToast } from '@/features/ui/uiSlice';
import { WorkoutPlanInput } from '../validations/workout.schema';
import { WorkoutPlan } from '@/types';

export function useWorkoutBuilder() {
  const dispatch = useAppDispatch();
  const { items: plans, loading, error, selectedCategory, selectedPlan } = useAppSelector(
    (state) => state.workouts
  );

  const [isCreating, setIsCreating] = useState(false);
  const [activeLevelFilter, setActiveLevelFilter] = useState<'ALL' | string>('ALL');

  useEffect(() => {
    dispatch(fetchWorkouts(selectedCategory));
  }, [dispatch, selectedCategory]);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      dispatch(setSelectedCategory(cat));
    },
    [dispatch]
  );

  const handleSelectPlan = useCallback(
    (plan: WorkoutPlan | null) => {
      dispatch(setSelectedPlan(plan));
    },
    [dispatch]
  );

  const handleCreatePlan = useCallback(
    async (input: WorkoutPlanInput) => {
      try {
        await dispatch(createWorkoutPlan(input)).unwrap();
        dispatch(
          showToast({
            message: `Routine "${input.title}" successfully created!`,
            type: 'success',
          })
        );
        setIsCreating(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create plan';
        dispatch(showToast({ message: msg, type: 'error' }));
      }
    },
    [dispatch]
  );

  const handleDeletePlan = useCallback(
    async (id: string, title: string) => {
      try {
        await dispatch(deleteWorkoutPlan(id)).unwrap();
        dispatch(
          showToast({
            message: `Routine "${title}" deleted`,
            type: 'info',
          })
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete plan';
        dispatch(showToast({ message: msg, type: 'error' }));
      }
    },
    [dispatch]
  );

  const filteredPlans = plans.filter((plan) => {
    if (activeLevelFilter !== 'ALL' && plan.level !== activeLevelFilter) {
      return false;
    }
    return true;
  });

  return {
    plans: filteredPlans,
    allPlans: plans,
    loading,
    error,
    selectedCategory,
    selectedPlan,
    isCreating,
    setIsCreating,
    activeLevelFilter,
    setActiveLevelFilter,
    handleCategoryChange,
    handleSelectPlan,
    handleCreatePlan,
    handleDeletePlan,
  };
}
