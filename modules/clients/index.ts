// Module: Clients
export * from './types/client.types';
export * from './validations/client.schema';
export * from './slice/clientsSlice';
export * from './hooks/useClients';
export * from './hooks/useClientRegistration';

// Components
export { default as ClientTable, ClientTable as ClientTableComponent } from './components/client-table';
export { default as ClientForm, ClientForm as ClientFormComponent } from './components/client-form';
export { default as AddClientModal, AddClientModal as AddClientModalComponent } from './components/add-client-modal';
export { default as ClientRegistrationModal, ClientRegistrationModal as ClientRegistrationModalComponent } from './components/client-registration-modal';
