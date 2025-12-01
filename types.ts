export interface ApplicationData {
  id: string;
  // Core CRM
  companyName: string;
  industry: string;
  location: string;
  founderName: string;
  founderContact: string;
  roundType: string;
  amountRaising: string;
  valuation: string;
  stage: string;
  dealLeadVCId: string;
  dateAdded: string;
  source: string;
  description: string;
  pitchDeckPath: string;
  keyInsight: string;
  previousKeyInsight?: string; // For diff view
  reminders: string;
  dueDiligenceSummary: string;
  // Workflow
  status: 'pending' | 'accepted' | 'rejected';
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface StartupData {
  // Derived from StartupCreate schema
  id: string; // convenient frontend key
  applicationId: string;
  companyName: string;
  dateAccepted: string;
  context: string;
  previousContext?: string; // For diff view
}

export interface MeetingData {
  // MeetingMiniData
  id: string;
  vc_id: string;
  start_time: string;
  end_time: string | null;
  status: 'in_progress' | 'completed' | 'canceled';
  relatedSessionId?: string; // Links to the backend AI session/chat history
}

export interface SummaryBlock {
  id: string;
  title: string;
  content: string;
  previousContent?: string;
}

export interface DiffItem {
  id: string;
  field: keyof ApplicationData | 'context'; // Field being changed
  fieldName: string; // Display name
  oldValue: string;
  newValue: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export enum Tab {
  APPLICATION = 'Application',
  STARTUP = 'Startup',
  MEETING = 'Meeting'
}