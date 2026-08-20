import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import gymReducer from '@/features/gym/gymSlice';
import uiReducer from '@/features/ui/uiSlice';
import clientsReducer from '@/features/clients/clientsSlice';
import workoutsReducer from '@/features/workouts/workoutsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      gym: gymReducer,
      ui: uiReducer,
      clients: clientsReducer,
      workouts: workoutsReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
