'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import DashboardView from '@/components/dashboard/dashboard-view';
import AthleteRegistrationView from '@/components/registration/athlete-registration-view';
import CheckInDeskView from '@/components/desk/check-in-desk-view';
import AnalyticsHub from '@/components/dashboard/analytics-hub';
import InventoryView from '@/components/inventory/inventory-view';
import LockerHubView from '@/components/lockers/locker-hub-view';
import AdminPanelView from '@/components/admin/admin-panel-view';
import ClientTable from '@/components/clients/client-table';
import AddClientModal from '@/components/clients/add-client-modal';
import WorkoutBuilder from '@/components/workouts/workout-builder';
import TechStackStatus from '@/components/system/tech-stack-status';

export default function HomePage() {
  const activeTab = useAppSelector((state) => state.ui.activeTab);

  return (
    <div className="flex min-h-screen bg-[#050A14] text-slate-100 selection:bg-lime-400 selection:text-black">
      {/* Sidebar Navigation matching image & specs */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <DashboardView />
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="animate-in fade-in duration-200">
              <AthleteRegistrationView />
            </div>
          )}

          {activeTab === 'check-in-desk' && (
            <div className="animate-in fade-in duration-200">
              <CheckInDeskView />
            </div>
          )}

          {activeTab === 'lockers' && (
            <div className="animate-in fade-in duration-200">
              <LockerHubView />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-200">
              <AnalyticsHub />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="animate-in fade-in duration-200">
              <InventoryView />
            </div>
          )}

          {activeTab === 'admin-panel' && (
            <div className="animate-in fade-in duration-200">
              <AdminPanelView />
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ClientTable />
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <WorkoutBuilder />
            </div>
          )}

          {activeTab === 'tech-stack' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <TechStackStatus />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddClientModal />
    </div>
  );
}
