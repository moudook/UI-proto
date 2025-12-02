import React from 'react';
import { Tab } from '../../types';
import {
  Zap,
  Calendar,
  Settings,
  Briefcase,
  Layers,
  ChevronLeft,
  ChevronRight
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

  return (
    <div
      className={`
        relative h-full bg-white/80 backdrop-blur-xl flex flex-col border-r border-gray-200/50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[70px] items-center' : 'w-[260px] items-stretch'}
      `}
    >
      {/* Logo Section */}
      <div className={`h-20 flex items-center flex-none ${isCollapsed ? 'justify-center' : 'px-6 justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`flex-none w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-transform duration-300 ${isCollapsed ? 'scale-90' : 'scale-100'}`}>
            <Zap size={18} fill="currentColor" className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-lg font-bold tracking-tight text-gray-900 leading-none">
                InvestFlow
              </span>
              <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wider mt-0.5">
                VC Workspace
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">

        {/* Primary Tabs */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl group relative transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={`flex-none transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
              />

              {!isCollapsed && (
                <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'font-semibold' : ''} animate-in fade-in duration-200`}>
                  {item.label}
                </span>
              )}

              {/* Active Indicator (Right Border) */}
              {isActive && !isCollapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full" />
              )}
            </button>
          );
        })}

      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User & Settings Footer */}
      <div className="p-4 flex-none border-t border-gray-100/50">
        <button
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-white ring-2 ring-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-xs flex-none">
            JD
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden flex-1 animate-in fade-in duration-200">
              <p className="text-sm font-bold text-gray-900 truncate">John Doe</p>
              <p className="text-[10px] text-gray-500 truncate">john@investflow.com</p>
            </div>
          )}
          {!isCollapsed && <Settings size={18} className="text-gray-400 group-hover:text-gray-700 transition-colors" />}
        </button>
      </div>
    </div>
  );
};
