import React, { useState } from 'react';
import { Tab, ApplicationData, StartupData, MeetingData, SummaryBlock } from './types';
import { APPLICATIONS, STARTUPS, MEETINGS, generateEmptySummaries } from './constants';
import { ApplicationTable, StartupTable, MeetingTable } from './components/TableComponents';
import { ChatInterface } from './components/ChatInterface';
import { SummaryView } from './components/SummaryView';
import { Search, Zap, Filter, Mic, StopCircle } from 'lucide-react';

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

  const handleApplicationStatusChange = (id: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
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

  const handleSaveSummaries = (newBlocks: SummaryBlock[]) => {
    setStartupSummaries(prev => {
      const currentBlocks = prev[selectedStartup] || [];
      const updatedBlocks = newBlocks.map(newBlock => {
        const oldBlock = currentBlocks.find(b => b.id === newBlock.id);
        if (oldBlock && oldBlock.content !== newBlock.content) {
          return { ...newBlock, previousContent: oldBlock.content };
        }
        return newBlock;
      });
      return { ...prev, [selectedStartup]: updatedBlocks };
    });
  };

  const toggleAiSession = () => {
    const newState = !isAiSessionActive;
    setIsAiSessionActive(newState);

    if (newState) {
      const newMeeting: MeetingData = {
        id: `meet-${Date.now()}`,
        vc_id: 'vc-current-user',
        start_time: new Date().toISOString(),
        end_time: null,
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
        <SummaryView 
          startupName={selectedStartup} 
          data={currentSummaries}
          onBack={handleBackToDashboard}
          onSave={handleSaveSummaries}
          searchQuery={searchQuery}
        />
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

  const getCurrentCount = () => {
    if (viewMode === 'summary') return 0;
    switch (activeTab) {
      case Tab.APPLICATION: return filteredApplications.length;
      case Tab.STARTUP: return filteredStartups.length;
      case Tab.MEETING: return filteredMeetings.length;
      default: return 0;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-gray-800 bg-[#F2F4F6] selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Floating Header */}
      <div className="px-8 pt-6 pb-2 z-30">
        <header className="glass-panel rounded-2xl shadow-soft px-6 py-4 flex items-center justify-between">
          
          {/* Brand & Tabs */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBackToDashboard}>
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">InvestFlow</span>
            </div>

            {viewMode === 'dashboard' && (
              <nav className="flex items-center p-1 bg-gray-100/50 rounded-xl border border-gray-200/50">
                {Object.values(Tab).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchQuery('');
                    }}
                    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-white text-indigo-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2.5 bg-gray-50/50 border border-transparent hover:bg-white focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 rounded-xl text-sm w-64 transition-all duration-300 placeholder-gray-400 outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Filter size={12} />
                  </button>
                )}
             </div>
             
             {/* Profile Avatar Placeholder */}
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-100 to-rose-100 border border-white shadow-sm flex items-center justify-center text-rose-500 font-bold text-xs cursor-pointer hover:shadow-md transition-all">
                JD
             </div>
          </div>
        </header>
      </div>

      {/* Main Content Area - The "Island" */}
      <main className="flex-1 px-8 pb-8 pt-4 overflow-hidden relative flex flex-col min-h-0">
        <div className="bg-white rounded-[2rem] shadow-soft-lg border border-white/60 h-full flex flex-col relative overflow-hidden ring-1 ring-black/5">
             
             {/* Content Header (for Dashboard) */}
             {viewMode === 'dashboard' && (
              <div className="flex-none px-8 py-6 flex items-end justify-between border-b border-gray-50">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{activeTab}</h1>
                  <p className="text-gray-400 mt-1 font-medium text-sm">
                    {activeTab === Tab.APPLICATION && "Review and manage incoming deal flow."}
                    {activeTab === Tab.STARTUP && "Monitor portfolio performance and updates."}
                    {activeTab === Tab.MEETING && "Track live meetings and recordings."}
                  </p>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                   {getCurrentCount()} Records
                </div>
              </div>
             )}

             {/* Rendered Content */}
             <div className="flex-1 overflow-hidden relative">
                 {renderContent()}
             </div>
        </div>
      </main>

      {/* Persistent Chat Interface Overlay */}
      {isAiSessionActive && (
        <ChatInterface onClose={() => setIsAiSessionActive(false)} />
      )}

      {/* Floating Glass Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-panel pl-2 pr-3 py-2 rounded-full shadow-2xl flex items-center gap-4 transition-all duration-500 hover:scale-105">
           
           {/* Recording Indicator/Controls */}
           <div className={`flex items-center gap-3 pr-4 border-r border-gray-200/50 transition-all duration-500 ${isAiSessionActive ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden pr-0 border-none'}`}>
              <div className="flex gap-1 h-3 items-center">
                 <div className="w-1 bg-red-500 rounded-full h-2 animate-[bounce_1s_infinite]"></div>
                 <div className="w-1 bg-red-500 rounded-full h-3 animate-[bounce_1.2s_infinite]"></div>
                 <div className="w-1 bg-red-500 rounded-full h-1.5 animate-[bounce_0.8s_infinite]"></div>
              </div>
              <span className="text-xs font-semibold text-red-500 whitespace-nowrap">Recording</span>
           </div>

           {/* Main Action Button */}
           <button
             onClick={toggleAiSession}
             className={`
               relative flex items-center gap-2 px-5 py-3 rounded-full text-white font-medium shadow-lg transition-all duration-300
               ${isAiSessionActive 
                 ? 'bg-gray-900 hover:bg-black pr-5' 
                 : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:-translate-y-0.5'}
             `}
           >
             {isAiSessionActive ? (
               <>
                 <StopCircle size={18} className="text-red-400" />
                 <span>End Session</span>
               </>
             ) : (
               <>
                 <Mic size={18} />
                 <span>Start AI Session</span>
               </>
             )}
           </button>
        </div>
      </div>

    </div>
  );
}