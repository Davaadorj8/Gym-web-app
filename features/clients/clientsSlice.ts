import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientStatus } from '@/types';
import { ClientInput } from '@/lib/validations/client';

interface ClientsState {
  items: Client[];
  loading: boolean;
  error: string | null;
  selectedClientId: string | null;
  filterStatus: 'ALL' | ClientStatus;
  searchQuery: string;
}

const initialState: ClientsState = {
  items: [],
  loading: false,
  error: null,
  selectedClientId: null,
  filterStatus: 'ALL',
  searchQuery: '',
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async ({ status, search }: { status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/clients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      return data.clients as Client[];
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (payload: ClientInput, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create client');
      return data.client as Client;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const addClient = createClient;

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, data }: { id: string; data: Partial<ClientInput> }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update client');
      return resData.client as Client;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete client');
      return id;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setFilterStatus: (state, action: PayloadAction<'ALL' | ClientStatus>) => {
      state.filterStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedClient: (state, action: PayloadAction<string | null>) => {
      state.selectedClientId = action.payload;
    },
    clearClientError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Client
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update Client
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Client
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
        if (state.selectedClientId === action.payload) {
          state.selectedClientId = null;
        }
      });
  },
});

export const { setFilterStatus, setSearchQuery, setSelectedClient, clearClientError } = clientsSlice.actions;
export default clientsSlice.reducer;
