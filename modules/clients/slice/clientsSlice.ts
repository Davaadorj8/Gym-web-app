import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientStatus } from '@/types';
import { ClientFormData } from '../validations/client.schema';

interface ClientsState {
  items: Client[];
  selectedClientId: string | null;
  loading: boolean;
  error: string | null;
  filterStatus: ClientStatus | 'ALL';
  searchQuery: string;
}

const initialState: ClientsState = {
  items: [],
  selectedClientId: null,
  loading: false,
  error: null,
  filterStatus: 'ALL',
  searchQuery: '',
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (
    params: { status?: ClientStatus | 'ALL'; search?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') {
        searchParams.append('status', params.status);
      }
      if (params?.search) {
        searchParams.append('search', params.search);
      }

      const queryString = searchParams.toString();
      const url = `/api/clients${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        return rejectWithValue(json.error || 'Failed to fetch clients');
      }

      return (json.data || json.clients || []) as Client[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const addClient = createAsyncThunk(
  'clients/addClient',
  async (formData: ClientFormData, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.error || 'Failed to create client');
      }

      return (json.data || json.client) as Client;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/clients?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.error || 'Failed to delete client');
      }

      return id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return rejectWithValue(msg);
    }
  }
);

export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setFilterStatus: (state, action: PayloadAction<ClientStatus | 'ALL'>) => {
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
    },
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
      // Add Client
      .addCase(addClient.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
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

export const { setFilterStatus, setSearchQuery, setSelectedClient, clearClientError } =
  clientsSlice.actions;

export default clientsSlice.reducer;
