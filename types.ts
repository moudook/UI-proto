
export interface ApplicationData {



  id: string;
  companyName: string;
  industry: string;
  location: string;
  founderName: string;
  founderContact: string;
  dateAdded: string;
  pitchDeckPath: string;
  keyInsight: string;
  email: string;
  startupDescription: string;
  QnA: Record<string, any>;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  
}

export interface StartupData {
  // Derived from StartupCreate schema

  
  id: string;
  applicationId: string;
  companyName: string;
  industry: string;
  location: string;
  founderName: string;
  founderContact: string;
  round: string;
  amountRaising: string;
  valuation: string;
  status: string;
  dealLead: string;
  dateAdded: string;
  source: string;
  summary: string;
  notes: string;
  nextAction: string;
  reminderDate: string;
  vc_notes: string;
  dueDiligenceSummary: string;

}

export interface TranscriptChunk {
  speaker: string;
  text: string;
  timestamp: string;
}

export interface MeetingData {
  id: string; 
  vc_id: string;
  start_time: string;
  end_time: string | null;
  status: 'in_progress' | 'completed' | 'canceled';
  
  transcript: TranscriptChunk[]; 
  chat_history: TranscriptChunk[]; 
  summary?: string;
  vc_notes?: string;
}

export interface SummaryBlock {
  id: string;
  title: string;
  content: string;
  previousContent?: string;
}

export interface DiffItem {
  id: string;
  field: keyof ApplicationData | 'context';
  fieldName: string;
  oldValue: string;
  newValue: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export enum Tab {
  APPLICATION = 'Application',
  STARTUP = 'Startup',
  MEETING = 'Meeting'
}
