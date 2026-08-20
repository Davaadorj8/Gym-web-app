'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchClients,
  deleteClient,
  setFilterStatus,
  setSearchQuery,
  setSelectedClient,
} from '@/features/clients/clientsSlice';
import { setAddClientModalOpen, showToast } from '@/features/ui/uiSlice';
import { Client, ClientStatus } from '@/types';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Activity,
  Mail,
  Phone,
  AlertCircle,
  Dumbbell,
  CheckCircle,
  Users,
} from 'lucide-react';

export default function ClientTable() {
  const dispatch = useAppDispatch();
  const { items: clients, loading, error, filterStatus, searchQuery } = useAppSelector(
    (state) => state.clients
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchClients({ status: filterStatus, search: searchQuery }));
  }, [dispatch, filterStatus, searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await dispatch(deleteClient(id)).unwrap();
      dispatch(showToast({ message: `Athlete ${name} was deleted successfully`, type: 'info' }));
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      console.error(err);
      dispatch(showToast({ message: 'Failed to delete athlete', type: 'error' }));
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Pending
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Inactive
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Archived
          </span>
        );
    }
  };

  const getLevelBadge = (level: string) => {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#0E1E38] text-slate-300 border border-[#18315B]">
        {level}
      </span>
    );
  };

  return (
    <div className="bg-[#0A1324] rounded-2xl border border-[#142644] shadow-lg overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-[#142644] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Field */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-client-search"
              type="text"
              placeholder="Search by name, email, or goal..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#070E1C] border border-[#142644] text-white focus:outline-none focus:border-lime-400 placeholder:text-slate-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
            {(['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                id={`filter-status-${st.toLowerCase()}`}
                onClick={() => dispatch(setFilterStatus(st))}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#0E1E38] text-lime-400 border border-lime-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-add-client-toolbar"
          onClick={() => dispatch(setAddClientModalOpen(true))}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-lime-400 text-black text-xs font-extrabold hover:bg-lime-300 transition-all shrink-0 shadow-[0_0_12px_rgba(163,230,53,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Enroll</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/10 text-red-400 text-xs flex items-center gap-2 border-b border-red-500/20">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#142644] bg-[#070E1C] text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Athlete Name &amp; Contact</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Experience Level</th>
              <th className="py-3.5 px-5">Fitness Goal</th>
              <th className="py-3.5 px-5 text-center">Sessions Logged</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#101F38] text-xs">
            {loading && clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Activity className="w-5 h-5 animate-spin text-lime-400" />
                    <span>Loading athletes from Redux &amp; database...</span>
                  </div>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-600" />
                    <p className="font-bold text-white">No athletes match criteria</p>
                    <p className="text-slate-500 text-xs">Try adjusting your filter or registering a new athlete.</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client: Client) => (
                <tr
                  key={client.id}
                  id={`client-row-${client.id}`}
                  className="hover:bg-[#070E1C]/60 transition-colors"
                >
                  {/* Name & Contact */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">
                      {client.firstName} {client.lastName}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">{getStatusBadge(client.status)}</td>

                  {/* Level */}
                  <td className="py-4 px-5">{getLevelBadge(client.fitnessLevel)}</td>

                  {/* Fitness Goal */}
                  <td className="py-4 px-5 max-w-[260px]">
                    <p className="text-slate-200 truncate font-medium">
                      {client.fitnessGoal || 'General Strength & Conditioning'}
                    </p>
                    {client.notes && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                        {client.notes}
                      </p>
                    )}
                  </td>

                  {/* Sessions */}
                  <td className="py-4 px-5 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-white bg-[#070E1C] border border-[#142644] px-2.5 py-1 rounded-md font-mono">
                      <Dumbbell className="w-3 h-3 text-lime-400" />
                      {client._count?.workoutSessions ?? 0}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {deleteConfirmId === client.id ? (
                        <div className="flex items-center gap-1.5 bg-red-500/10 p-1 rounded-lg border border-red-500/30">
                          <span className="text-[10px] text-red-400 font-bold px-1">Confirm?</span>
                          <button
                            id={`btn-confirm-delete-${client.id}`}
                            onClick={() => handleDelete(client.id, `${client.firstName} ${client.lastName}`)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-[#0E1E38] text-slate-300 rounded text-[10px] font-semibold hover:bg-[#14294C] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            id={`btn-select-client-${client.id}`}
                            onClick={() => dispatch(setSelectedClient(client.id))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0E1E38] transition-colors cursor-pointer"
                            title="View / Edit Athlete"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-client-${client.id}`}
                            onClick={() => setDeleteConfirmId(client.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Athlete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 border-t border-[#142644] bg-[#070E1C] flex items-center justify-between text-xs text-slate-400">
        <span>Showing {clients.length} registered members</span>
        <span className="flex items-center gap-1 text-lime-400 font-semibold font-mono text-[11px]">
          <CheckCircle className="w-3.5 h-3.5" />
          Synchronized via Redux State &amp; Database
        </span>
      </div>
    </div>
  );
}
