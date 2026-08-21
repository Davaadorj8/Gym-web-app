import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NavigationTab =
  | 'dashboard'
  | 'registration'
  | 'check-in-desk'
  | 'lockers'
  | 'analytics'
  | 'inventory'
  | 'admin-panel'
  | 'clients'
  | 'workouts'
  | 'tech-stack';

interface UiState {
  activeTab: NavigationTab;
  isAddClientModalOpen: boolean;
  isAddWorkoutModalOpen: boolean;
  isSidebarOpen: boolean;
  toastNotification: {
    message: string;
    type: 'success' | 'info' | 'error';
    id: number;
  } | null;
}

const initialState: UiState = {
  activeTab: 'registration', // Set registration as requested / prominently featured
  isAddClientModalOpen: false,
  isAddWorkoutModalOpen: false,
  isSidebarOpen: true,
  toastNotification: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<NavigationTab>) => {
      state.activeTab = action.payload;
    },
    setAddClientModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddClientModalOpen = action.payload;
    },
    setAddWorkoutModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddWorkoutModalOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    showToast: (
      state,
      action: PayloadAction<{ message: string; type?: 'success' | 'info' | 'error' }>
    ) => {
      state.toastNotification = {
        message: action.payload.message,
        type: action.payload.type || 'success',
        id: Date.now(),
      };
    },
    hideToast: (state) => {
      state.toastNotification = null;
    },
  },
});

export const {
  setActiveTab,
  setAddClientModalOpen,
  setAddWorkoutModalOpen,
  toggleSidebar,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
