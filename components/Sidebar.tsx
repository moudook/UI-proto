
import React from 'react';
import { Tab } from '../types';
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
      <div className={`h-24 flex items-center flex-none ${isCollapsed ? 'justify-center' : 'px-8'}`}>
        <div className="flex items-center gap-4">
          <div className={`flex-none w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-md ${isCollapsed ? 'scale-90' : 'scale-100'}`}>
            <Zap size={20} fill="currentColor" />
          </div>
          {!isCollapsed && (
             <span className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap">
               InvestFlow
             </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* Primary Tabs */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(item.id);
                setIsCollapsed(false); 
              }}
              className={`
                w-full flex items-center gap-5 px-5 py-4 rounded-xl group relative
                ${isActive 
                  ? 'bg-gray-200/60 text-gray-900 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon 
                size={24} 
                strokeWidth={2}
                className={`flex-none ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} 
              />
              
              {!isCollapsed && (
                <span className={`text-lg font-medium whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

      </div>

      {/* User & Settings Footer */}
      <div className="p-6 flex-none">
         <button 
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); }}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 ${isCollapsed ? 'justify-center' : ''}`}
         >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs flex-none shadow-sm group-hover:scale-105">
              JD
            </div>
            {!isCollapsed && (
                <div className="text-left overflow-hidden flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">John Doe</p>
                    <p className="text-xs text-gray-400 truncate">john@investflow.com</p>
                </div>
            )}
            {!isCollapsed && <Settings size={20} className="text-gray-400 hover:text-gray-900" />}
         </button>
      </div>
    </div>
  );
};
