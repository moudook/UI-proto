import React from 'react';
import { Tab } from '../../types';
import { 
  Zap, 
  Calendar, 
  Settings, 
  Briefcase,
  Layers
} from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed
}) => {
  
  const navItems = [
    { id: Tab.APPLICATION, label: 'Application', icon: Layers },
    { id: Tab.STARTUP, label: 'Startup', icon: Briefcase },
    { id: Tab.MEETING, label: 'Meeting', icon: Calendar },
  ];

  const handleSidebarClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  return (
    <div 
      onClick={handleSidebarClick}
      className={`
        relative h-full bg-[#F3F3F2] flex flex-col border-r border-gray-200/50 cursor-pointer
        ${isCollapsed ? 'items-center' : 'items-stretch'}
      `}
    >
      {/* Logo Section */}
      <div className={`h-16 flex items-center flex-none ${isCollapsed ? 'justify-center' : 'px-6'} transition-all`}>
        <div className="flex items-center gap-3">
          <div className={`flex-none w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-105`}>
            <Zap size={14} fill="currentColor" />
          </div>
          {!isCollapsed && (
             <span className="text-sm font-bold tracking-tight text-gray-900 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
               InvestFlow
             </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* Primary Tabs */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(item.id);
                // Optional: keep expanded or collapse? 
                // User said click outside to minimize, implying it stays open while interacting inside.
                setIsCollapsed(false); 
              }}
              className={`
                w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-gray-200/60 text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon 
                size={20} 
                strokeWidth={2}
                className={`flex-none transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} 
              />
              
              {!isCollapsed && (
                <span className={`text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-200 ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

      </div>

      {/* User & Settings Footer */}
      <div className="p-4 flex-none">
         <button 
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); }}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 ${isCollapsed ? 'justify-center' : ''}`}
         >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-[10px] flex-none shadow-sm">
              JD
            </div>
            {!isCollapsed && (
                <div className="text-left overflow-hidden flex-1 animate-in fade-in slide-in-from-left-2">
                    <p className="text-xs font-bold text-gray-900 truncate">John Doe</p>
                    <p className="text-[10px] text-gray-400 truncate">john@investflow.com</p>
                </div>
            )}
            {!isCollapsed && <Settings size={16} className="text-gray-400 hover:text-gray-900 transition-colors" />}
         </button>
      </div>
    </div>
  );
};