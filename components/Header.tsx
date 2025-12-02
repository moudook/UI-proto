
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
    <header className="h-20 px-8 flex items-center justify-between bg-transparent flex-none z-10">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-4 text-base text-gray-400 font-medium">
         <div className="flex items-center gap-2 hover:text-gray-900 cursor-pointer transition-colors duration-200">
            <Home size={18} />
         </div>
         <ChevronRight size={16} className="text-gray-300" />
         <span className={`text-gray-900 font-semibold px-4 py-1.5 rounded-lg bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-left-2 duration-300`}>
            {getBreadcrumbTitle()}
         </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-8">
          <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-transparent hover:bg-white focus:bg-white focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50/20 rounded-2xl text-base w-80 placeholder-gray-400 outline-none shadow-soft group-hover:shadow-lg group-hover:shadow-gray-100/50 transition-all duration-300 ease-out"
              />
          </div>
      </div>
    </header>
  );
};
