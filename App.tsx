
import React, { useState } from 'react';
import { Tab, ApplicationData, StartupData, MeetingData, SummaryBlock } from './types';
import { APPLICATIONS, STARTUPS, MEETINGS, generateEmptySummaries } from './constants';
import { ApplicationTable, StartupTable, MeetingTable } from './components/TableComponents';
import { ChatInterface } from './components/ChatInterface';
import { SummaryView } from './components/SummaryView';
import { Search, Zap, Filter, Play, Square } from 'lucide-react';

type ViewMode = 'dashboard' | 'summary';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.APPLICATION);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedStartup, setSelectedStartup] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Session State
  const [isAiSessionActive, setIsAiSessionActive] = useState(false);

  // Data State
  const [applications, setApplications] = useState<ApplicationData[]>(APPLICATIONS);
  const [startups, setStartups] = useState<StartupData[]>(STARTUPS);
  const [meetings, setMeetings] = useState<MeetingData[]>(MEETINGS);
  
  // Persistent Summary State: Map<StartupName, SummaryBlocks>
  const [startupSummaries, setStartupSummaries] = useState<Record<string, SummaryBlock[]>>({});

  const handleStartupClick = (name: string) => {
    setSelectedStartup(name);
    setViewMode('summary');
    setSearchQuery(''); 

    // Initialize summaries for this startup if not present
    if (!startupSummaries[name]) {
      setStartupSummaries(prev => ({
        ...prev,
        [name]: generateEmptySummaries(name)
      }));
    }
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedStartup('');
    setSearchQuery('');
  };

  // Logic: When an application is 'accepted', it moves to the startup list
  const handleApplicationStatusChange = (id: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        // If status changing to accepted, check if we need to add to startups
        if (newStatus === 'accepted' && app.status !== 'accepted') {
          const newStartup: StartupData = {
            id: `startup-${app.id}`,
            applicationId: app.id,
            companyName: app.companyName,
            dateAccepted: new Date().toISOString().split('T')[0],
            context: `Manually accepted from Application dashboard. Previous status: ${app.status}.`
          };
          setStartups(prevStartups => [newStartup, ...prevStartups]);
        }
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  // Logic: Save Summaries with Versioning (Diff)
  const handleSaveSummaries = (newBlocks: SummaryBlock[]) => {
    setStartupSummaries(prev => {
      const currentBlocks = prev[selectedStartup] || [];
      
      const updatedBlocks = newBlocks.map(newBlock => {
        const oldBlock = currentBlocks.find(b => b.id === newBlock.id);
        
        // If content changed, move current content to previousContent
        if (oldBlock && oldBlock.content !== newBlock.content) {
          return {
            ...newBlock,
            previousContent: oldBlock.content
          };
        }
        return newBlock;
      });

      return {
        ...prev,
        [selectedStartup]: updatedBlocks
      };
    });
  };

  // Logic: Start/Stop AI Session
  const toggleAiSession = () => {
    const newState = !isAiSessionActive;
    setIsAiSessionActive(newState);

    if (newState) {
      // Logic from previous requirement: Create a meeting when "started"
      const newMeeting: MeetingData = {
        id: `meet-${Date.now()}`,
        vc_id: 'vc-current-user',
        start_time: new Date().toISOString(),
        end_time: null, // Open ended
        status: 'in_progress'
      };
      
      setMeetings(prev => [newMeeting, ...prev]);
    }
  };

  // --- Filtering & Sorting Logic ---
  const filteredApplications = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    return (
      app.companyName.toLowerCase().includes(q) ||
      app.founderName.toLowerCase().includes(q) ||
      app.industry.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q) ||
      app.location.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    // Sort Order: Pending (0) -> Rejected (1) -> Accepted (2)
    const statusPriority = { pending: 0, rejected: 1, accepted: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  const filteredStartups = startups.filter(startup => {
    const q = searchQuery.toLowerCase();
    return (
      startup.companyName.toLowerCase().includes(q) ||
      startup.context.toLowerCase().includes(q)
    );
  });

  const filteredMeetings = meetings.filter(meeting => {
    const q = searchQuery.toLowerCase();
    return (
      meeting.id.toLowerCase().includes(q) ||
      meeting.vc_id.toLowerCase().includes(q) ||
      meeting.status.toLowerCase().includes(q)
    );
  });

  const renderContent = () => {
    if (viewMode === 'summary') {
      const currentSummaries = startupSummaries[selectedStartup] || generateEmptySummaries(selectedStartup);
      return (
        <div className="h-full border border-gray-100 rounded-lg shadow-sm overflow-hidden bg-white">
          <SummaryView 
            startupName={selectedStartup} 
            data={currentSummaries}
            onBack={handleBackToDashboard}
            onSave={handleSaveSummaries}
            searchQuery={searchQuery}
          />
        </div>
      );
    }

    switch (activeTab) {
      case Tab.APPLICATION:
        return <ApplicationTable data={filteredApplications} onNameClick={handleStartupClick} onStatusChange={handleApplicationStatusChange} />;
      case Tab.STARTUP:
        return <StartupTable data={filteredStartups} onNameClick={handleStartupClick} />;
      case Tab.MEETING:
        return <MeetingTable data={filteredMeetings} onNameClick={() => {}} />;
      default:
        return null;
    }
  };

  // Helper for footer count
  const getCurrentCount = () => {
    if (viewMode === 'summary') return 0; // Handled inside summary view conceptually
    switch (activeTab) {
      case Tab.APPLICATION: return filteredApplications.length;
      case Tab.STARTUP: return filteredStartups.length;
      case Tab.MEETING: return filteredMeetings.length;
      default: return 0;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800 relative">
      {/* Header Section */}
      <header className="flex-none px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between z-30 shadow-sm">
        {/* Left: Branding & Tabs */}
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={handleBackToDashboard}
          >
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">InvestFlow</span>
          </div>

          {viewMode === 'dashboard' && (
            <nav className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg border border-gray-200">
              {Object.values(Tab).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchQuery(''); // Clear search on tab switch for better UX
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 rounded-lg text-sm w-56 transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                 <Filter size={12} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative p-6 pb-0">
        <div className="bg-white border border-gray-200 rounded-t-2xl shadow-sm h-full flex flex-col relative overflow-hidden">
             
             {/* Content Header (for Dashboard) */}
             {viewMode === 'dashboard' && (
              <div className="flex-none px-6 pt-6 pb-4 border-b border-gray-50">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{activeTab}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === Tab.APPLICATION && "Review and manage incoming investment applications."}
                  {activeTab === Tab.STARTUP && "Monitor portfolio companies and accepted deals."}
                  {activeTab === Tab.MEETING && "Track live meetings and recordings."}
                </p>
              </div>
             )}

             {/* Main Content */}
             <div className="flex-1 overflow-hidden relative">
                 {renderContent()}
             </div>

             {/* Footer with counts (Hidden behind the curve slightly, but visible enough) */}
             <div className="flex-none p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center pb-8">
                 Showing {getCurrentCount()} results
             </div>
        </div>
      </main>

      {/* Persistent Chat Interface Overlay */}
      {isAiSessionActive && (
        <ChatInterface onClose={() => setIsAiSessionActive(false)} />
      )}

      {/* Bottom Curve Dock & Button */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-end z-50 pointer-events-none filter drop-shadow-[0_-4px_6px_rgba(0,0,0,0.02)]">
        <div className="relative flex items-end">
           {/* SVG Shape: A smooth arc 'tab' rising from the bottom */}
           <svg width="160" height="40" viewBox="0 0 160 40" className="text-white fill-current">
              {/* Outer stroke/border simulation */}
              <path d="M0,40 L40,40 C60,40 60,0 80,0 C100,0 100,40 120,40 L160,40 L160,42 L0,42 Z" fill="#e5e7eb" />
              {/* Main white fill */}
              <path d="M0,40 L40,40 C60,40 60,1 80,1 C100,1 100,40 120,40 L160,40 L160,42 L0,42 Z" fill="white" transform="translate(0, 1)" />
           </svg>
           
           {/* The Button centered in the arc */}
           <button
            onClick={toggleAiSession}
            className={`pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 p-2.5 rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
              isAiSessionActive 
                ? 'bg-red-500 border-red-100 ring-4 ring-red-50 animate-pulse' 
                : 'bg-red-500 border-white hover:bg-red-600'
            }`}
            aria-label={isAiSessionActive ? "Stop AI Session" : "Start AI Session"}
            title={isAiSessionActive ? "Stop Recording" : "Start Recording"}
          >
            {isAiSessionActive ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>

    </div>
  );
}
