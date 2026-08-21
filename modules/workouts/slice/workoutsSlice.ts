import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutPlan } from '@/types';
import { WorkoutPlanInput } from '../validations/workout.schema';

interface WorkoutsState {
  items: WorkoutPlan[];
  selectedPlan: WorkoutPlan | null;
  loading: boolean;
  error: string | null;
  selectedCategory: string;
}

const initialState: WorkoutsState = {
  items: [],
  selectedPlan: null,
  loading: false,
  error: null,
  selectedCategory: 'ALL',
};

export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async (category: string | undefined, { rejectWithValue }) => {
    try {
      const url = category && category !== 'ALL' ? `/api/workouts?category=${category}` : '/api/workouts';
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.error || 'Failed to load workouts');
      }
      return json.data as WorkoutPlan[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const createWorkoutPlan = createAsyncThunk(
  'workouts/createWorkoutPlan',
  async (input: WorkoutPlanInput, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.error || 'Failed to create plan');
      }
      return json.data as WorkoutPlan;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const deleteWorkoutPlan = createAsyncThunk(
  'workouts/deleteWorkoutPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/workouts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.error || 'Failed to delete plan');
      }
      return id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedPlan: (state, action: PayloadAction<WorkoutPlan | null>) => {
      state.selectedPlan = action.payload;
    },
    clearWorkoutError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
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
      // Create
      .addCase(createWorkoutPlan.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Delete
      .addCase(deleteWorkoutPlan.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selectedPlan?.id === action.payload) {
          state.selectedPlan = null;
        }
      });
  },
});

export const { setSelectedCategory, setSelectedPlan, clearWorkoutError } = workoutsSlice.actions;
export default workoutsSlice.reducer;
