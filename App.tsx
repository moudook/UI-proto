import React, { useState } from 'react';
import { Tab, ApplicationData, StartupData, MeetingData, SummaryBlock, DiffItem } from './types';
import { APPLICATIONS, STARTUPS, MEETINGS, generateEmptySummaries } from './constants';
import { ApplicationTable, StartupTable, MeetingTable } from './components/TableComponents';
import { ChatInterface } from './components/ChatInterface';
import { SummaryView } from './components/SummaryView';
import { LiveAudioSession } from './components/LiveAudioSession';
import { PostMeetingReview } from './components/PostMeetingReview';
import { Search, Zap, Filter, LayoutGrid, BarChart2, Calendar } from 'lucide-react';

type ViewMode = 'dashboard' | 'summary' | 'review';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.APPLICATION);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedStartup, setSelectedStartup] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Session & Review State
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [pendingMeetingData, setPendingMeetingData] = useState<{startTime: string, endTime: string} | null>(null);

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

  const handleSessionComplete = (sessionId: string, startTime: string, endTime: string) => {
      setReviewSessionId(sessionId);
      setPendingMeetingData({ startTime, endTime });
      setViewMode('review');
  };

  const handleReviewComplete = (acceptedDiffs: DiffItem[]) => {
      if (acceptedDiffs.length > 0) {
          setApplications(prev => {
              const newApps = [...prev];
              const targetApp = newApps[0]; 
              acceptedDiffs.forEach(diff => {
                  if (diff.field in targetApp) {
                      (targetApp as any)[diff.field] = diff.newValue;
                  }
              });
              return newApps;
          });
      }

      if (reviewSessionId && pendingMeetingData) {
          const newMeeting: MeetingData = {
              id: `meet-${Date.now()}`,
              relatedSessionId: reviewSessionId,
              vc_id: 'vc-current-user',
              start_time: pendingMeetingData.startTime,
              end_time: pendingMeetingData.endTime,
              status: 'completed'
          };
          setMeetings(prev => [newMeeting, ...prev]);
      }

      setReviewSessionId(null);
      setPendingMeetingData(null);
      setActiveTab(Tab.MEETING);
      setViewMode('dashboard');
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
    if (viewMode === 'review' && reviewSessionId) {
        return (
            <PostMeetingReview 
                sessionId={reviewSessionId} 
                onComplete={handleReviewComplete}
                onCancel={() => {
                    setReviewSessionId(null);
                    setViewMode('dashboard');
                }}
            />
        );
    }

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
    if (viewMode === 'summary' || viewMode === 'review') return 0;
    switch (activeTab) {
      case Tab.APPLICATION: return filteredApplications.length;
      case Tab.STARTUP: return filteredStartups.length;
      case Tab.MEETING: return filteredMeetings.length;
      default: return 0;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-gray-800 bg-[#F3F4F6] selection:bg-indigo-100 selection:text-indigo-900">
      
      {viewMode === 'review' ? (
          renderContent()
      ) : (
        <>
            {/* Floating Header */}
            <div className="px-10 pt-8 pb-4 z-30">
                <header className="glass-panel rounded-[1.5rem] shadow-soft px-8 py-5 flex items-center justify-between">
                
                {/* Brand & Tabs */}
                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={handleBackToDashboard}>
                      <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg shadow-indigo-300 group-hover:shadow-indigo-400 transition-all duration-300 transform group-hover:scale-105">
                          <Zap size={22} className="text-white fill-current" />
                      </div>
                      <span className="text-xl font-bold tracking-tight text-gray-900">InvestFlow</span>
                    </div>

                    {viewMode === 'dashboard' && (
                    <nav className="flex items-center p-1.5 bg-gray-100/60 rounded-xl border border-gray-100/50">
                        {Object.values(Tab).map((tab) => {
                            let Icon = LayoutGrid;
                            if (tab === Tab.STARTUP) Icon = BarChart2;
                            if (tab === Tab.MEETING) Icon = Calendar;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                    setActiveTab(tab);
                                    setSearchQuery('');
                                    }}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-300 ${
                                    activeTab === tab
                                        ? 'bg-white text-indigo-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                                >
                                    <Icon size={14} className={activeTab === tab ? "text-indigo-500" : "text-gray-400"} />
                                    {tab}
                                </button>
                            );
                        })}
                    </nav>
                    )}
                </div>

                {/* Search */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                        type="text"
                        placeholder="Search workspace..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-10 py-3 bg-gray-50/50 border border-transparent hover:bg-white focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/30 rounded-xl text-sm w-72 transition-all duration-300 placeholder-gray-400 outline-none"
                        />
                        {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Filter size={12} />
                        </button>
                        )}
                    </div>
                    
                    {/* Profile Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-100 to-rose-100 border-2 border-white shadow-sm flex items-center justify-center text-rose-500 font-bold text-xs cursor-pointer hover:shadow-md transition-all">
                        JD
                    </div>
                </div>
                </header>
            </div>

            {/* Main Content Area - The "Island" */}
            <main className="flex-1 px-10 pb-10 pt-2 overflow-hidden relative flex flex-col min-h-0">
                <div className="bg-white rounded-[2.5rem] shadow-soft-lg border border-white/60 h-full flex flex-col relative overflow-hidden ring-1 ring-black/5">
                    
                    {/* Content Header (for Dashboard) */}
                    {viewMode === 'dashboard' && (
                    <div className="flex-none px-10 py-8 flex items-end justify-between border-b border-gray-50 bg-white/50 backdrop-blur-sm z-10">
                        <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{activeTab}</h1>
                        <p className="text-gray-400 mt-2 font-medium text-sm">
                            {activeTab === Tab.APPLICATION && "Review and manage incoming deal flow opportunities."}
                            {activeTab === Tab.STARTUP && "Monitor portfolio performance, metrics, and updates."}
                            {activeTab === Tab.MEETING && "Track live meetings, recordings, and AI-generated insights."}
                        </p>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        {getCurrentCount()} Active Records
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
            {isAiChatOpen && (
                <ChatInterface onClose={() => setIsAiChatOpen(false)} />
            )}

            {/* Live Audio Session Controller */}
            <LiveAudioSession onSessionComplete={handleSessionComplete} />
        </>
      )}
    </div>
  );
}