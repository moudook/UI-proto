import React, { useState } from 'react';
import { Tab, SummaryBlock } from './types';
import { ApplicationTable } from './frontend/components/tables/ApplicationTable';
import { StartupTable } from './frontend/components/tables/StartupTable';
import { MeetingTable } from './frontend/components/tables/MeetingTable';
import { SummaryView } from './frontend/components/SummaryView';
import { useDashboardData } from './hooks/useDashboardData';
import { DashboardLayout } from './frontend/components/DashboardLayout';

export type ViewMode = 'dashboard' | 'summary' | 'review';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.APPLICATION);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  
  // Selection State
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [selectedRecordName, setSelectedRecordName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data Logic Hook
  const {
    applications,
    startups,
    meetings,
    summaries,
    handleApplicationStatusChange,
    initSummaries,
    updateSummaries,
    updateMeetingSummaries
  } = useDashboardData();

  // --- Handlers ---

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedRecordId('');
    setSelectedRecordName('');
    setSearchQuery('');
  };

  const handleApplicationClick = (id: string, name: string) => {
    setSelectedRecordId(id);
    setSelectedRecordName(name);
    setViewMode('summary');
    setSearchQuery('');
    initSummaries(id, 'application');
  };

  const handleStartupClick = (id: string, name: string) => {
    setSelectedRecordId(id);
    setSelectedRecordName(name);
    setViewMode('summary');
    setSearchQuery('');
    initSummaries(id, 'startup');
  };

  const handleMeetingClick = (id: string) => {
    setSelectedRecordId(id);
    setSelectedRecordName(id);
    setViewMode('summary');
    setSearchQuery('');
  };

  // --- Filtering ---
  
  const filteredApplications = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    return (
      app.companyName.toLowerCase().includes(q) ||
      app.founderName.toLowerCase().includes(q) ||
      app.industry.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const statusPriority = { pending: 0, rejected: 1, accepted: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  const filteredStartups = startups.filter(startup => {
    const q = searchQuery.toLowerCase();
    const contextString = typeof startup.context === 'string' 
        ? startup.context 
        : JSON.stringify(startup.context);
    return startup.companyName.toLowerCase().includes(q) || contextString.toLowerCase().includes(q);
  });

  const filteredMeetings = meetings.filter(meeting => {
    const q = searchQuery.toLowerCase();
    return meeting.id.toLowerCase().includes(q) || meeting.vc_id.toLowerCase().includes(q);
  });

  // --- Content Render ---

  const renderContent = () => {
    if (viewMode === 'summary') {
      if (activeTab === Tab.MEETING && selectedRecordId) {
         const meeting = meetings.find(m => m.id === selectedRecordId);
         if (meeting) {
            const meetingBlocks: SummaryBlock[] = [
                { id: `summary-${meeting.id}`, title: "Meeting Summary", content: meeting.summary || "", previousContent: undefined },
                { id: `notes-${meeting.id}`, title: "VC Notes", content: meeting.vc_notes || "", previousContent: undefined }
            ];
            return (
                <SummaryView 
                    title={meeting.id}
                    subtitle="Meeting & Notes"
                    data={meetingBlocks}
                    onBack={handleBackToDashboard}
                    onSave={(blocks) => updateMeetingSummaries(selectedRecordId, blocks)}
                    searchQuery={searchQuery}
                />
            );
         }
      }

      const currentSummaries = summaries[selectedRecordId] || [];
      const subtitle = activeTab === Tab.APPLICATION ? "Due Diligence Notebook" : "Portfolio Management Notebook";
      
      return (
        <SummaryView 
          title={selectedRecordName} 
          subtitle={subtitle}
          data={currentSummaries}
          onBack={handleBackToDashboard}
          onSave={(blocks) => updateSummaries(selectedRecordId, blocks)}
          searchQuery={searchQuery}
        />
      );
    }

    switch (activeTab) {
      case Tab.APPLICATION:
        return <ApplicationTable data={filteredApplications} onNameClick={handleApplicationClick} onStatusChange={handleApplicationStatusChange} />;
      case Tab.STARTUP:
        return <StartupTable data={filteredStartups} onNameClick={handleStartupClick} />;
      case Tab.MEETING:
        return <MeetingTable data={filteredMeetings} onNameClick={handleMeetingClick} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={(t) => { setActiveTab(t); handleBackToDashboard(); }}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      viewMode={viewMode}
      counts={{
        app: filteredApplications.length,
        startup: filteredStartups.length,
        meeting: filteredMeetings.length
      }}
    >
      {renderContent()}
    </DashboardLayout>
  );
}