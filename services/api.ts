
import { ApplicationData, StartupData, MeetingData } from '../types';

const API_BASE_APPS = '/api/applications';
const API_BASE_STARTUPS = '/api/startups';
const API_BASE_MEETINGS = '/api/meetings';

// Helper to get headers with the required API key
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': process.env.INTERNAL_API_KEY || '', 
});

// Helper to normalize MongoDB _id to frontend id
const normalizeId = <T extends { _id?: string, id?: string }>(item: T): T & { id: string } => {
  return {
    ...item,
    id: item._id || item.id || ''
  } as T & { id: string };
};

export const api = {
  // --- APPLICATIONS ---

  fetchApplications: async (): Promise<ApplicationData[]> => {
    try {
      const res = await fetch(`${API_BASE_APPS}/fetch/all`, { 
        method: 'GET',
        headers: getHeaders() 
      });
      if (!res.ok) throw new Error(`Error fetching applications: ${res.statusText}`);
      const json = await res.json();
      return (json.data || []).map(normalizeId);
    } catch (error) {
      console.error("API Fetch Error (Apps):", error);
      throw error;
    }
  },

  acceptApplication: async (id: string) => {
    const res = await fetch(`${API_BASE_APPS}/accept/${id}`, { 
        method: 'POST', 
        headers: getHeaders() 
    });
    if (!res.ok) throw new Error(`Error accepting application: ${res.statusText}`);
    return res.json();
  },

  rejectApplication: async (id: string) => {
    const res = await fetch(`${API_BASE_APPS}/reject/${id}`, { 
        method: 'POST', 
        headers: getHeaders() 
    });
    if (!res.ok) throw new Error(`Error rejecting application: ${res.statusText}`);
    return res.json();
  },
  
  updateApplication: async (id: string, data: Partial<ApplicationData>) => {
      const res = await fetch(`${API_BASE_APPS}/update/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Error updating application: ${res.statusText}`);
      return res.json();
  },

  // --- STARTUPS ---

  fetchStartups: async (): Promise<StartupData[]> => {
    try {
      const res = await fetch(`${API_BASE_STARTUPS}/fetch/all`, { 
        method: 'GET',
        headers: getHeaders() 
      });
      if (!res.ok) throw new Error(`Error fetching startups: ${res.statusText}`);
      const json = await res.json();
      return (json.data || []).map(normalizeId);
    } catch (error) {
      console.error("API Fetch Error (Startups):", error);
      throw error;
    }
  },

  updateStartup: async (id: string, data: Partial<StartupData>) => {
    const res = await fetch(`${API_BASE_STARTUPS}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Error updating startup: ${res.statusText}`);
    return res.json();
  },

  deleteStartup: async (id: string) => {
    const res = await fetch(`${API_BASE_STARTUPS}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Error deleting startup: ${res.statusText}`);
    return res.json();
  },

  // --- MEETINGS ---

  fetchMeetings: async (): Promise<MeetingData[]> => {
    try {
      const res = await fetch(`${API_BASE_MEETINGS}/fetch/all`, { 
        method: 'GET',
        headers: getHeaders() 
      });
      if (!res.ok) throw new Error(`Error fetching meetings: ${res.statusText}`);
      const json = await res.json();
      return (json.data || []).map(normalizeId);
    } catch (error) {
      console.error("API Fetch Error (Meetings):", error);
      throw error;
    }
  },

  createMeeting: async (data: any) => {
    const res = await fetch(`${API_BASE_MEETINGS}/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Error creating meeting: ${res.statusText}`);
    return res.json();
  },

  updateMeeting: async (data: any) => {
    const res = await fetch(`${API_BASE_MEETINGS}/update`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Error updating meeting: ${res.statusText}`);
    return res.json();
  },

  deleteMeeting: async (id: string) => {
    const res = await fetch(`${API_BASE_MEETINGS}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Error deleting meeting: ${res.statusText}`);
    return res.json();
  }
};
