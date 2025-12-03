
import { ApplicationData, StartupData, MeetingData } from '../types';

const API_BASE_APPS = '/api/applications';
const API_BASE_STARTUPS = '/api/startups';
const API_BASE_MEETINGS = '/api/meetings';

// Helper to get headers with the required API key
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': process.env.INTERNAL_API_KEY || '', 
  'authorization' : process.env.JWT_TOKEN || " ",
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
      console.log("API Response:", json);

      // Handle different response formats
      let data = json.data || json;

      // If data is a single object (not an array), wrap it in an array
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          console.log("Wrapping single object in array");
          data = [data];
        } else {
          console.warn("Unexpected data type:", typeof data, data);
          return [];
        }
      }

      return data.map(normalizeId);
    } catch (error) {
      console.error("API Fetch Error (Apps):", error);
      throw error;
    }
  },

  acceptApplication: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_APPS}/accept/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error accepting application: ${res.statusText}`, errorData);
        throw new Error(`Error accepting application: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Accept Application):", error);
      throw error;
    }
  },

  rejectApplication: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_APPS}/reject/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error rejecting application: ${res.statusText}`, errorData);
        throw new Error(`Error rejecting application: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Reject Application):", error);
      throw error;
    }
  },

  updateApplication: async (id: string, data: Partial<ApplicationData>) => {
    try {
      const res = await fetch(`${API_BASE_APPS}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error updating application: ${res.statusText}`, errorData);
        throw new Error(`Error updating application: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Update Application):", error);
      throw error;
    }
  },

  // --- STARTUPS ---

  fetchStartups: async (): Promise<StartupData[]> => {
    try {
      const res = await fetch(`${API_BASE_STARTUPS}/fetch/all`, {
        method: 'GET',
        headers: getHeaders()
      });

      // Handle 404 or other errors gracefully
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn(`Warning fetching startups: ${res.statusText}`, errorData);
        // Return empty array instead of throwing for "not found" errors
        if (res.status === 404 || errorData.detail?.includes('not found')) {
          return [];
        }
        throw new Error(`Error fetching startups: ${res.statusText}`);
      }

      const json = await res.json();
      console.log("API Response (Startups):", json);

      // Handle different response formats
      let data = json.data || json;

      // If data is a single object (not an array), wrap it in an array
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          console.log("Wrapping single startup object in array");
          data = [data];
        } else {
          console.warn("Unexpected data type:", typeof data, data);
          return [];
        }
      }

      return data.map(normalizeId);
    } catch (error) {
      console.error("API Fetch Error (Startups):", error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  updateStartup: async (id: string, data: Partial<StartupData>) => {
    try {
      const res = await fetch(`${API_BASE_STARTUPS}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error updating startup: ${res.statusText}`, errorData);
        throw new Error(`Error updating startup: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Update Startup):", error);
      throw error;
    }
  },

  deleteStartup: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_STARTUPS}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error deleting startup: ${res.statusText}`, errorData);
        throw new Error(`Error deleting startup: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Delete Startup):", error);
      throw error;
    }
  },

  // --- MEETINGS ---

  fetchMeetings: async (): Promise<MeetingData[]> => {
    try {
      const res = await fetch(`${API_BASE_MEETINGS}/fetch/all`, {
        method: 'GET',
        headers: getHeaders()
      });

      // Handle 404 or other errors gracefully
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn(`Warning fetching meetings: ${res.statusText}`, errorData);
        // Return empty array instead of throwing for "not found" errors
        if (res.status === 404 || errorData.detail?.includes('not found')) {
          return [];
        }
        throw new Error(`Error fetching meetings: ${res.statusText}`);
      }

      const json = await res.json();
      console.log("API Response (Meetings):", json);

      // Handle different response formats
      let data = json.data || json;

      // If data is a single object (not an array), wrap it in an array
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          console.log("Wrapping single meeting object in array");
          data = [data];
        } else {
          console.warn("Unexpected data type:", typeof data, data);
          return [];
        }
      }

      return data.map(normalizeId);
    } catch (error) {
      console.error("API Fetch Error (Meetings):", error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  createMeeting: async (data: any) => {
    try {
      const res = await fetch(`${API_BASE_MEETINGS}/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error creating meeting: ${res.statusText}`, errorData);
        throw new Error(`Error creating meeting: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Create Meeting):", error);
      throw error;
    }
  },

  updateMeeting: async (data: any) => {
    try {
      const res = await fetch(`${API_BASE_MEETINGS}/update`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error updating meeting: ${res.statusText}`, errorData);
        throw new Error(`Error updating meeting: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Update Meeting):", error);
      throw error;
    }
  },

  deleteMeeting: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_MEETINGS}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Error deleting meeting: ${res.statusText}`, errorData);
        throw new Error(`Error deleting meeting: ${errorData.detail || res.statusText}`);
      }
      return res.json();
    } catch (error) {
      console.error("API Error (Delete Meeting):", error);
      throw error;
    }
  }
};
