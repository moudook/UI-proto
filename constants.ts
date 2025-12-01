
import { SummaryBlock } from './types';

export const APPLICATION_SUMMARY_SECTIONS = [
  "Financial Due Diligence",
  "Customer Due Diligence",
  "Tech Due Diligence",
  "Legal Due Diligence",
  "Founders Notes",
  "Company Notes"
];

export const STARTUP_SUMMARY_SECTIONS = [
  "Monthly Updates",
  "Board Meeting Minutes",
  "Key Metrics (KPIs)",
  "Hiring Needs",
  "Cap Table Changes",
  "Product Roadmap"
];

export const generateEmptySummaries = (id: string, type: 'application' | 'startup'): SummaryBlock[] => {
  const sections = type === 'application' ? APPLICATION_SUMMARY_SECTIONS : STARTUP_SUMMARY_SECTIONS;
  return sections.map((title, idx) => ({
    id: `${id}-${idx}`,
    title,
    content: "", 
    previousContent: undefined
  }));
};
