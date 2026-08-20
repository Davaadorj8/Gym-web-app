import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutPlan } from '@/types';
import { WorkoutPlanInput } from '@/lib/validations/workout';

interface WorkoutsState {
  items: WorkoutPlan[];
  loading: boolean;
  error: string | null;
  selectedPlanId: string | null;
  filterCategory: string;
}

const initialState: WorkoutsState = {
  items: [],
  loading: false,
  error: null,
  selectedPlanId: null,
  filterCategory: 'ALL',
};

export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async ({ category }: { category?: string } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);

      const res = await fetch(`/api/workouts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch workout programs');
      const data = await res.json();
      return data.plans as WorkoutPlan[];
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const createWorkout = createAsyncThunk(
  'workouts/createWorkout',
  async (payload: WorkoutPlanInput, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create workout plan');
      return data.plan as WorkoutPlan;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/workouts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete workout plan');
      return id;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload;
    },
    setSelectedPlanId: (state, action: PayloadAction<string | null>) => {
      state.selectedPlanId = action.payload;
    },
    clearWorkoutError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkout.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w.id !== action.payload);
      });
  },
});

export const { setFilterCategory, setSelectedPlanId, clearWorkoutError } = workoutsSlice.actions;
export default workoutsSlice.reducer;
