import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'TRAINER' | 'FRONT_DESK';
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
    name: 'Arche Owner (Admin)',
    email: 'admin@archegym.com',
    role: 'OWNER',
    avatarInitials: 'AO',
  },
  isAuthenticated: true,
  token: 'mock-auth-token-arche-001',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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

export const { setUser, setToken, logout } = authSlice.actions;

export default authSlice.reducer;
