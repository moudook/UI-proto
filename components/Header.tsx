import React from 'react';
import { Tab } from '../types';
import { Search, ChevronRight, Home } from 'lucide-react';

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
    <header className="h-16 px-6 flex items-center justify-between bg-transparent flex-none z-10">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
         <div className="flex items-center gap-2 hover:text-gray-900 cursor-pointer transition-colors">
            <Home size={14} />
         </div>
         <ChevronRight size={12} className="text-gray-300" />
         <span className={`text-gray-900 font-semibold px-2.5 py-1 rounded-md bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm`}>
            {getBreadcrumbTitle()}
         </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-6">
          <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-transparent hover:bg-white focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50/20 rounded-xl text-xs w-64 transition-all duration-300 placeholder-gray-400 outline-none shadow-soft group-hover:shadow-lg group-hover:shadow-gray-100/50"
              />
          </div>
      </div>
    </header>
  );
};