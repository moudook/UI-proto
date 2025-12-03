import React from 'react';
import { Tab } from '../types';
import { Search, ChevronRight, Home, Minus, Square, X } from 'lucide-react';

declare global {
  interface Window {
    electronAPI?: {
      send: (channel: string, data?: any) => void;
      invoke: (channel: string, data?: any) => Promise<any>;
      platform: string;
    };
  }
}

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

  const handleMinimize = () => {
    window.electronAPI?.send('minimize-main-window');
  };

  const handleMaximize = () => {
    window.electronAPI?.send('maximize-main-window');
  };

  const handleClose = () => {
    window.electronAPI?.send('close-main-window');
  };

  return (
    <header className="h-12 px-4 flex items-center justify-between bg-transparent flex-none z-10" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 text-sm text-gray-400 font-medium" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
         <div className="flex items-center gap-2 hover:text-gray-900 cursor-pointer transition-colors duration-200">
            <Home size={16} />
         </div>
         <ChevronRight size={14} className="text-gray-300" />
         <span className={`text-gray-900 font-semibold px-3 py-1 rounded-lg bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-left-2 duration-300 text-sm`}>
            {getBreadcrumbTitle()}
         </span>
      </div>

      {/* Search + Window Controls */}
      <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-transparent border border-gray-200 hover:bg-transparent focus:bg-transparent focus:border-indigo-100 focus:ring-2 focus:ring-indigo-50/20 rounded-xl text-sm w-56 placeholder-gray-400 outline-none shadow-soft group-hover:shadow-lg group-hover:shadow-gray-100/50 transition-all duration-300 ease-out"
              />
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <button
              onClick={handleMinimize}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              title="Minimize"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleMaximize}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              title="Maximize"
            >
              <Square size={12} />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors duration-200"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
      </div>
    </header>
  );
};
