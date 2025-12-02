
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Tab, ApplicationData, StartupData, MeetingData } from '../../types';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) && 
        !isSidebarCollapsed
      ) {
        setIsSidebarCollapsed(true);
      }
    }
    if (!isSidebarCollapsed) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarCollapsed]);

  const getCurrentCount = () => {
    switch (activeTab) {
      case Tab.APPLICATION: return counts.app;
      case Tab.STARTUP: return counts.startup;
      case Tab.MEETING: return counts.meeting;
      default: return 0;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-800 bg-[#F3F3F2] relative">
      {/* Sidebar Container */}
      <div 
        ref={sidebarRef} 
        className="fixed top-0 left-0 h-full z-50 transition-all duration-300 shadow-2xl shadow-gray-200/50"
        style={{ width: isSidebarCollapsed ? '60px' : '260px' }}
      >
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Layout Spacer */}
      <div className="flex-none h-full transition-all duration-300 w-[60px]" />

      {/* Backdrop Blur */}
      <div 
        className={`fixed inset-0 bg-white/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`} 
      />

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-0">
        <Header 
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
        />

        <div className="flex-1 px-4 pb-4 pt-0 overflow-hidden relative flex flex-col">
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden transition-all">
                
                {/* Page Header (Only in Dashboard Mode) */}
                {viewMode === 'dashboard' && (
                  <div className="flex-none px-6 py-5 flex items-end justify-between bg-white z-10">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
                            {activeTab === Tab.APPLICATION ? 'Application' : activeTab === Tab.STARTUP ? 'Startup' : 'Meeting'}
                        </h1>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
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
