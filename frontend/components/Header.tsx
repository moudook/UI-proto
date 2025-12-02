import React from 'react';
import { Tab } from '../../types';
import { Search, ChevronRight, Home, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: Tab;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'dashboard' | 'summary' | 'review';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  viewMode
}) => {
  const getBreadcrumbTitle = () => {
    if (viewMode === 'review') return 'Meeting Review';
    if (viewMode === 'summary') {
      return activeTab === Tab.MEETING ? 'Meeting Details' : 'Startup Details';
    }
    return activeTab === Tab.APPLICATION ? 'Application' :
      activeTab === Tab.STARTUP ? 'Startup' : 'Meeting';
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-transparent flex-none z-10">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-2 hover:text-indigo-600 cursor-pointer transition-colors duration-200">
          <Home size={16} />
        </div>
        <ChevronRight size={14} className="text-gray-300" />
        <span className={`text-gray-900 font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200/50 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300`}>
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200/80 hover:border-gray-300 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm w-72 placeholder-gray-400 outline-none shadow-sm transition-all duration-300 ease-out"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl bg-white border border-gray-200/80 hover:border-indigo-200 hover:bg-indigo-50 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-all duration-200 shadow-sm group">
          <Bell size={18} />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:border-indigo-50 transition-colors" />
        </button>
      </div>
    </header>
  );
};
