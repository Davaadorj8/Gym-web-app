import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/types/next-auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole | 'OWNER' | 'ADMIN' | 'STAFF' | 'TRAINER' | 'FRONT_DESK';
  avatarInitials: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: {
    id: 'usr-1',
    name: 'Arche Admin (Supervisor)',
    email: 'admin@archegym.com',
    role: 'ADMIN',
    avatarInitials: 'AA',
  },
  isAuthenticated: true,
  token: 'auth-session-token-arche-001',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setAuthUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setRole: (state, action: PayloadAction<UserProfile['role']>) => {
      if (state.user) {
        state.user.role = action.payload;
        if (action.payload === 'ADMIN') {
          state.user.name = 'Arche Admin (Supervisor)';
          state.user.avatarInitials = 'AA';
        } else {
          state.user.name = 'Arche Desk Staff';
          state.user.avatarInitials = 'AS';
        }
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { setUser, setAuthUser, setRole, setToken, logout } = authSlice.actions;

export default authSlice.reducer;

