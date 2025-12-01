import { ApplicationData, StartupData, MeetingData, SummaryBlock } from './types';

export const APPLICATIONS: ApplicationData[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `app-${i}`,
  companyName: `NovaTech Solutions ${i + 1}`,
  industry: i % 2 === 0 ? 'Fintech' : 'Healthtech',
  location: i % 3 === 0 ? 'San Francisco, CA' : 'New York, NY',
  founderName: `Founder ${i + 1}`,
  founderContact: `founder${i + 1}@example.com`,
  roundType: 'Seed',
  amountRaising: `$${(i + 1) * 500}k`,
  valuation: `$${(i + 5) * 2}M`,
  stage: 'Due Diligence',
  dealLeadVCId: `vc-${(i % 5) + 1}`,
  dateAdded: '2023-10-24',
  source: 'Referral',
  description: 'AI-driven analytics for small businesses.',
  pitchDeckPath: '/files/deck.pdf',
  keyInsight: i === 0 
    ? 'Strong retention metrics in beta. Cohort analysis shows 40% month-over-month growth with negative churn.' 
    : 'Strong retention metrics in beta.',
  previousKeyInsight: i === 0 
    ? 'Strong retention metrics in beta. Cohort analysis shows 10% month-over-month growth.' 
    : undefined,
  reminders: 'Follow up next week.',
  dueDiligenceSummary: 'Technical risks are moderate.',
  status: i < 5 ? 'accepted' : i > 15 ? 'rejected' : 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// We generate initial startups from the 'accepted' applications
export const STARTUPS: StartupData[] = APPLICATIONS.filter(app => app.status === 'accepted').map((app, i) => ({
  id: `startup-${app.id}`,
  applicationId: app.id,
  companyName: app.companyName,
  dateAccepted: new Date().toISOString().split('T')[0],
  context: `Onboarded after successful Seed round led by ${app.dealLeadVCId}. Focusing on Q3 growth targets.`,
  previousContext: i === 0 ? `Onboarded after successful Seed round led by ${app.dealLeadVCId}.` : undefined
}));

export const MEETINGS: MeetingData[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `meet-${i}`,
  vc_id: `vc-1`,
  start_time: new Date(Date.now() - (i * 86400000)).toISOString(),
  end_time: new Date(Date.now() - (i * 86400000) + 3600000).toISOString(),
  status: 'completed',
}));

export const DEFAULT_SUMMARY_SECTIONS = [
  "Financial Due Diligence",
  "Customer Due Diligence",
  "Tech Due Diligence",
  "Legal Due Diligence",
  "Founders Notes",
  "Company Notes"
];

export const generateEmptySummaries = (startupName: string): SummaryBlock[] => {
  return DEFAULT_SUMMARY_SECTIONS.map((title, idx) => ({
    id: `${startupName.replace(/\s+/g, '-').toLowerCase()}-${idx}`,
    title,
    content: "", 
    previousContent: undefined
  }));
};