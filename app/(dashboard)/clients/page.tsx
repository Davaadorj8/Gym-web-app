import React from 'react';
import ClientTable from '@/components/clients/client-table';
import AddClientModal from '@/components/clients/add-client-modal';

export default function ClientsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ClientTable />
      <AddClientModal />
    </div>
  );
}
