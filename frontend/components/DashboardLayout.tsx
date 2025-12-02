import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Tab } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'dashboard' | 'summary' | 'review';
  counts: { app: number; startup: number; meeting: number };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  viewMode,
  counts
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getCurrentCount = () => {
    switch (activeTab) {
      case Tab.APPLICATION: return counts.app;
      case Tab.STARTUP: return counts.startup;
      case Tab.MEETING: return counts.meeting;
      default: return 0;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-800 bg-[#F8F9FC] relative selection:bg-indigo-100 selection:text-indigo-700">
      {/* Sidebar Container */}
      <div
        className="fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out shadow-2xl shadow-gray-200/50"
        style={{ width: isSidebarCollapsed ? '70px' : '260px' }}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Layout Spacer (Pushes content) */}
      <div
        className="flex-none h-full transition-all duration-300 ease-in-out"
        style={{ width: isSidebarCollapsed ? '70px' : '260px' }}
      />

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-0 bg-[#F8F9FC]">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
        />

        <div className="flex-1 px-6 pb-6 pt-2 overflow-hidden relative flex flex-col">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100/80 h-full flex flex-col relative overflow-hidden transition-all ring-1 ring-gray-50">

            {/* Page Header (Only in Dashboard Mode) */}
            {viewMode === 'dashboard' && (
              <div className="flex-none px-8 py-6 flex items-end justify-between bg-white z-10 border-b border-gray-50">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-display">
                    {activeTab === Tab.APPLICATION ? 'Application' : activeTab === Tab.STARTUP ? 'Startup' : 'Meeting'}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1 font-medium">Manage your {activeTab.toLowerCase()} pipeline</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100/50 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  {getCurrentCount()} Active Records
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
