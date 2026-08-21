'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchClients,
  deleteClient,
  setFilterStatus,
  setSearchQuery,
  setSelectedClient,
} from '../slice/clientsSlice';
import { setAddClientModalOpen, showToast } from '@/features/ui/uiSlice';
import { Client, ClientStatus } from '@/types';

export function useClients() {
  const dispatch = useAppDispatch();
  const { items: clients, loading, error, filterStatus, searchQuery, selectedClientId } = useAppSelector(
    (state) => state.clients
  );
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER';

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchClients({ status: filterStatus, search: searchQuery }));
  }, [dispatch, filterStatus, searchQuery]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!isAdmin) {
        dispatch(
          showToast({
            message: 'Forbidden: Admin privilege required to delete athletes',
            type: 'error',
          })
        );
        return;
      }
      try {
        await dispatch(deleteClient(id)).unwrap();
        dispatch(
          showToast({
            message: `Athlete ${name} was deleted successfully`,
            type: 'info',
          })
        );
        setDeleteConfirmId(null);
      } catch (err: unknown) {
        console.error(err);
        dispatch(showToast({ message: 'Failed to delete athlete', type: 'error' }));
      }
    },
    [dispatch, isAdmin]
  );

  const handleSetFilter = useCallback(
    (status: ClientStatus | 'ALL') => {
      dispatch(setFilterStatus(status));
    },
    [dispatch]
  );

  const handleSetSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const handleSelectClient = useCallback(
    (id: string | null) => {
      dispatch(setSelectedClient(id));
    },
    [dispatch]
  );

  const handleOpenAddModal = useCallback(() => {
    dispatch(setAddClientModalOpen(true));
  }, [dispatch]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  return {
    clients,
    loading,
    error,
    filterStatus,
    searchQuery,
    selectedClientId,
    selectedClient,
    isAdmin,
    deleteConfirmId,
    setDeleteConfirmId,
    handleDelete,
    handleSetFilter,
    handleSetSearch,
    handleSelectClient,
    handleOpenAddModal,
  };
}
