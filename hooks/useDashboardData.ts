
import { useState, useEffect } from 'react';
import { ApplicationData, StartupData, MeetingData, SummaryBlock } from '../types';
import { generateEmptySummaries } from '../constants';
import { api } from '../services/api';

/**
 * Custom hook that manages the dashboard data state and provides functions to interact with the data
 * Fetches applications, startups, meetings and summaries from the API
 * Provides functions to update application status, initialize summaries, and update summaries
 */
export const useDashboardData = () => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [summaries, setSummaries] = useState<Record<string, SummaryBlock[]>>({});

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apps, sts, mts] = await Promise.allSettled([
           api.fetchApplications(),
           api.fetchStartups(),
           api.fetchMeetings()
        ]);

        if (apps.status === 'fulfilled') {
          setApplications(apps.value);
          console.log(applications)

        }
        if (sts.status === 'fulfilled') setStartups(sts.value);
        if (mts.status === 'fulfilled') setMeetings(mts.value);

      } catch (err) {
        console.warn("Error loading dashboard data:", err);
      }
    };
    loadData();
  }, []);

  /**
   * Handles the status change of an application and updates the backend accordingly
   * Performs optimistic UI update and reverts on failure
   * @param id - The ID of the application to update
   * @param newStatus - The new status to set for the application
   */
  const handleApplicationStatusChange = async (id: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    // 1. Optimistic UI Update
    const previousApps = [...applications];
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));

    try {
        // 2. Call Backend API
        if (newStatus === 'accepted') {
            await api.acceptApplication(id);
            // In a real scenario, we'd refetch startups here to get the new one
            const sts = await api.fetchStartups();
            setStartups(sts);
        } else if (newStatus === 'rejected') {
            await api.rejectApplication(id);
        } else {
            await api.updateApplication(id, { status: newStatus });
        }

    } catch (error) {
        console.error("Failed to update status on backend", error);
        // 4. Revert on failure
        setApplications(previousApps);
        alert("Failed to connect to backend. Changes reverted.");
    }
  };

  /**
   * Initializes summaries for a given record ID and type if they don't already exist
   * @param id - The ID of the record to initialize summaries for
   * @param type - The type of record (application or startup)
   */
  const initSummaries = (id: string, type: 'application' | 'startup') => {
    if (!summaries[id]) {
      setSummaries(prev => ({
        ...prev,
        [id]: generateEmptySummaries(id, type)
      }));
    }
  };

  /**
   * Updates summaries with new content and tracks previous content for change tracking
   * @param id - The ID of the record to update summaries for
   * @param newBlocks - The new summary blocks to set
   */
  const updateSummaries = (id: string, newBlocks: SummaryBlock[]) => {
    setSummaries(prev => {
      const currentBlocks = prev[id] || [];
      const updatedBlocks = newBlocks.map(newBlock => {
        const oldBlock = currentBlocks.find(b => b.id === newBlock.id);
        if (oldBlock && oldBlock.content !== newBlock.content) {
          return { ...newBlock, previousContent: oldBlock.content };
        }
        return newBlock;
      });
      return { ...prev, [id]: updatedBlocks };
    });
  };

  /**
   * Updates meeting summaries and notes in the backend
   * Performs optimistic UI update and persists changes to the backend
   * @param meetingId - The ID of the meeting to update
   * @param newBlocks - The new summary blocks containing meeting summary and VC notes
   */
  const updateMeetingSummaries = async (meetingId: string, newBlocks: SummaryBlock[]) => {
    const summaryBlock = newBlocks.find(b => b.title === "Meeting Summary");
    const notesBlock = newBlocks.find(b => b.title === "VC Notes");
    
    // Optimistic
    setMeetings(prev => prev.map(m => {
       if (m.id === meetingId) {
           return {
               ...m,
               summary: summaryBlock?.content,
               vc_notes: notesBlock?.content
           }
       }
       return m;
    }));

    // Persist
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
        try {
            await api.updateMeeting({
                ...meeting,
                summary: summaryBlock?.content,
                vc_notes: notesBlock?.content
            });
        } catch(e) {
            console.error("Failed to save meeting notes", e);
        }
    }
  };

  return {
    applications,
    startups,
    meetings,
    summaries,
    handleApplicationStatusChange,
    initSummaries,
    updateSummaries,
    updateMeetingSummaries
  };
};
