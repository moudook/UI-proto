import React, { useState } from 'react';
import { ApplicationData, StartupData, MeetingData } from '../types';
import { ChevronDown, AlertCircle, FileDiff, X } from 'lucide-react';

// --- Shared Diff Logic ---
type DiffToken = { type: 'same' | 'added' | 'removed'; value: string };

function computeDiff(oldText: string, newText: string): DiffToken[] {
  const a = oldText.split(/\s+/);
  const b = newText.split(/\s+/);
  const m = a.length;
  const n = b.length;
  
  const C = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        C[i][j] = C[i - 1][j - 1] + 1;
      } else {
        C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }

  let i = m;
  let j = n;
  const result: DiffToken[] = [];

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'same', value: a[i - 1] });
      i--; j--;
    } else if (C[i - 1][j] > C[i][j - 1]) {
      result.unshift({ type: 'removed', value: a[i - 1] });
      i--;
    } else {
      result.unshift({ type: 'added', value: b[j - 1] });
      j--;
    }
  }
  while (i > 0) { result.unshift({ type: 'removed', value: a[i - 1] }); i--; }
  while (j > 0) { result.unshift({ type: 'added', value: b[j - 1] }); j--; }

  return result;
}

const DiffModal = ({ oldText, newText, onClose }: { oldText: string, newText: string, onClose: () => void }) => {
  const diff = computeDiff(oldText, newText);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-900">
            <FileDiff className="w-6 h-6" />
            <h3 className="text-xl font-bold">Version Comparison</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto leading-relaxed text-gray-700">
          <p className="text-lg">
            {diff.map((token, idx) => {
              if (token.type === 'added') {
                return (
                  <span key={idx} className="bg-green-100 text-green-800 px-1 rounded mx-0.5 font-medium border border-green-200">
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'removed') {
                return (
                  <span key={idx} className="bg-red-100 text-red-800 px-1 rounded mx-0.5 line-through decoration-red-400 opacity-80 text-sm">
                    {token.value}
                  </span>
                );
              }
              return <span key={idx} className="text-gray-600"> {token.value} </span>;
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Expandable Cell Component (Vertical Expansion) ---
const ExpandableContent = ({ content, previousContent, widthClass = "w-[260px]" }: { content: string, previousContent?: string, widthClass?: string }) => {
  const [showDiff, setShowDiff] = useState(false);
  const hasChanged = previousContent && previousContent.trim() !== content.trim();

  return (
    <>
      <div className={`group relative ${widthClass} transition-all duration-300 ease-in-out`}>
        {/* 
            Default: truncate (one line).
            Hover: whitespace-normal (wraps text, expands vertical height).
        */}
        <div className="truncate group-hover:whitespace-normal group-hover:overflow-visible text-sm text-gray-700 leading-relaxed cursor-default">
          {content}
        </div>

        {/* Button appears below text on hover if changed */}
        {hasChanged && (
          <div className="hidden group-hover:flex justify-start mt-2">
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDiff(true);
                }}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors border border-amber-200"
              >
                <AlertCircle size={12} />
                Changes Detected
              </button>
          </div>
        )}
      </div>

      {showDiff && previousContent && (
        <DiffModal 
          oldText={previousContent}
          newText={content}
          onClose={() => setShowDiff(false)}
        />
      )}
    </>
  );
};

// --- Table Helper Components ---

const HeaderCell = ({ children, className = '', width = '' }: { children?: React.ReactNode, className?: string, width?: string }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight bg-gray-50 border-b border-gray-200 align-top ${className} ${width}`}>
    <div className="flex items-center gap-1 cursor-pointer group whitespace-nowrap">
      {children}
      <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600 opacity-50 group-hover:opacity-100" />
    </div>
  </th>
);

const Cell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-4 py-3 text-sm text-gray-700 border-b border-gray-100 bg-white align-top ${className}`} {...props}>
    {children}
  </td>
);

interface TableProps<T> {
  data: T[];
  onNameClick: (name: string) => void;
  onStatusChange?: (id: string, newStatus: any) => void;
}

// --- Application Table ---
export const ApplicationTable: React.FC<TableProps<ApplicationData>> = ({ data, onNameClick, onStatusChange }) => {
  // Column Width Config
  const W_ID = "70px";
  const W_COMPANY = "150px"; // Reduced to approx 16 characters width
  
  return (
    <div className="w-full h-full overflow-auto">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            {/* Sticky Col 1: ID */}
            <th className={`sticky left-0 z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight border-b border-gray-200 w-[${W_ID}] min-w-[${W_ID}] max-w-[${W_ID}]`}>
              <div className="flex items-center gap-1">ID <ChevronDown size={12}/></div>
            </th>
            {/* Sticky Col 2: Company Name */}
            <th className={`sticky left-[${W_ID}] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight border-b border-gray-200 w-[${W_COMPANY}] min-w-[${W_COMPANY}] max-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]`}>
              <div className="flex items-center gap-1">Company <ChevronDown size={12}/></div>
            </th>
            
            <HeaderCell width="min-w-[120px]">Industry</HeaderCell>
            <HeaderCell width="min-w-[140px]">Location</HeaderCell>
            <HeaderCell width="min-w-[130px]">Founder</HeaderCell>
            <HeaderCell width="min-w-[150px]">Contact</HeaderCell>
            <HeaderCell width="min-w-[90px]">Round</HeaderCell>
            <HeaderCell width="min-w-[100px]">Amount</HeaderCell>
            <HeaderCell width="min-w-[100px]">Valuation</HeaderCell>
            <HeaderCell width="min-w-[110px]">Stage</HeaderCell>
            <HeaderCell width="min-w-[100px]">Deal Lead</HeaderCell>
            <HeaderCell width="min-w-[100px]">Added</HeaderCell>
            <HeaderCell width="min-w-[100px]">Source</HeaderCell>
            <HeaderCell width="min-w-[260px]">Description</HeaderCell>
            <HeaderCell width="min-w-[90px]">Deck</HeaderCell>
            <HeaderCell width="min-w-[260px]">Key Insight</HeaderCell>
            <HeaderCell width="min-w-[200px]">Reminders</HeaderCell>
            <HeaderCell width="min-w-[200px]">Due Diligence</HeaderCell>
            <HeaderCell width="min-w-[120px]">Status</HeaderCell>
            <HeaderCell width="min-w-[100px]">Created</HeaderCell>
            <HeaderCell width="min-w-[100px]">Updated</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors group/row">
              {/* Sticky Cell 1: ID */}
              <td className={`sticky left-0 z-10 bg-white px-4 py-3 text-xs text-gray-500 font-mono border-b border-gray-100 w-[${W_ID}] min-w-[${W_ID}] align-top`}>
                {row.id}
              </td>
              {/* Sticky Cell 2: Company Name */}
              <td className={`sticky left-[${W_ID}] z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100 w-[${W_COMPANY}] min-w-[${W_COMPANY}] max-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] align-top`}>
                <button 
                  onClick={() => onNameClick(row.companyName)}
                  className="w-full text-left group hover:text-indigo-600 transition-colors block"
                  title={row.companyName}
                >
                  <span className="truncate w-full hover:whitespace-normal block">{row.companyName}</span>
                </button>
              </td>
              
              <Cell className="min-w-[120px] max-w-[120px] truncate hover:whitespace-normal">{row.industry}</Cell>
              <Cell className="min-w-[140px] max-w-[140px] truncate hover:whitespace-normal">{row.location}</Cell>
              <Cell className="min-w-[130px] max-w-[130px] truncate hover:whitespace-normal">{row.founderName}</Cell>
              <Cell className="min-w-[150px] max-w-[150px] truncate hover:whitespace-normal text-xs">{row.founderContact}</Cell>
              <Cell className="min-w-[90px]">{row.roundType}</Cell>
              <Cell className="min-w-[100px]">{row.amountRaising}</Cell>
              <Cell className="min-w-[100px]">{row.valuation}</Cell>
              <Cell className="min-w-[110px]"><span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{row.stage}</span></Cell>
              <Cell className="min-w-[100px] text-xs font-mono text-gray-500">{row.dealLeadVCId}</Cell>
              <Cell className="min-w-[100px] text-xs">{row.dateAdded}</Cell>
              <Cell className="min-w-[100px]">{row.source}</Cell>
              
              <Cell className="min-w-[260px] p-0">
                  <div className="px-4 py-3"><ExpandableContent content={row.description} widthClass="w-[260px]"/></div>
              </Cell>
              
              <Cell className="min-w-[90px] text-xs"><a href={row.pitchDeckPath} className="text-indigo-600 hover:underline">PDF</a></Cell>
              
              <Cell className="min-w-[260px] p-0">
                <div className="px-4 py-3"><ExpandableContent content={row.keyInsight} previousContent={row.previousKeyInsight} widthClass="w-[260px]" /></div>
              </Cell>
              
              <Cell className="min-w-[200px] p-0">
                <div className="px-4 py-3"><ExpandableContent content={row.reminders} widthClass="w-[180px]" /></div>
              </Cell>
              
              <Cell className="min-w-[200px] p-0">
                <div className="px-4 py-3"><ExpandableContent content={row.dueDiligenceSummary} widthClass="w-[180px]" /></div>
              </Cell>

              <Cell className="min-w-[120px]">
                <select 
                  value={row.status}
                  onChange={(e) => onStatusChange && onStatusChange(row.id, e.target.value)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 w-full ${
                    row.status === 'accepted' ? 'text-green-700 bg-green-100' : 
                    row.status === 'rejected' ? 'text-red-700 bg-red-100' : 
                    'text-yellow-700 bg-yellow-100'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Cell>
              <Cell className="min-w-[100px] text-[10px] text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</Cell>
              <Cell className="min-w-[100px] text-[10px] text-gray-400">{new Date(row.updatedAt).toLocaleDateString()}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Startup Table ---
export const StartupTable: React.FC<TableProps<StartupData>> = ({ data, onNameClick }) => {
  const W_ID = "70px";
  const W_COMPANY = "150px"; // Reduced to approx 16 characters width

  return (
    <div className="w-full h-full overflow-auto">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            <th className={`sticky left-0 z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight border-b border-gray-200 w-[${W_ID}] min-w-[${W_ID}]`}>
              <div className="flex items-center gap-1">ID <ChevronDown size={12}/></div>
            </th>
            <th className={`sticky left-[${W_ID}] z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight border-b border-gray-200 w-[${W_COMPANY}] min-w-[${W_COMPANY}] max-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]`}>
              <div className="flex items-center gap-1">Company <ChevronDown size={12}/></div>
            </th>
            <HeaderCell width="min-w-[120px]">Date Accepted</HeaderCell>
            <HeaderCell width="min-w-[350px]">Context</HeaderCell>
            <HeaderCell width="min-w-[120px]">App ID</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              <td className={`sticky left-0 z-10 bg-white px-4 py-3 text-xs text-gray-500 font-mono border-b border-gray-100 w-[${W_ID}] align-top`}>
                {row.id}
              </td>
              <td className={`sticky left-[${W_ID}] z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100 w-[${W_COMPANY}] min-w-[${W_COMPANY}] max-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] align-top`}>
                <button 
                  onClick={() => onNameClick(row.companyName)}
                  className="hover:text-indigo-600 hover:underline text-left w-full block"
                  title={row.companyName}
                >
                  <span className="truncate w-full block">{row.companyName}</span>
                </button>
              </td>
              <Cell className="min-w-[120px]">{row.dateAccepted}</Cell>
              <Cell className="min-w-[350px] p-0">
                 <div className="px-4 py-3"><ExpandableContent content={row.context} previousContent={row.previousContext} widthClass="w-[350px]" /></div>
              </Cell>
              <Cell className="min-w-[120px] text-gray-400 font-mono text-xs">{row.applicationId}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Meeting Table ---
export const MeetingTable: React.FC<TableProps<MeetingData>> = ({ data }) => {
  const W_ID = "160px";

  return (
    <div className="w-full h-full overflow-auto">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            <th className={`sticky left-0 z-30 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-tight border-b border-gray-200 w-[${W_ID}] min-w-[${W_ID}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]`}>
              <div className="flex items-center gap-1">Meeting ID <ChevronDown size={12}/></div>
            </th>
            <HeaderCell width="min-w-[120px]">VC ID</HeaderCell>
            <HeaderCell width="min-w-[180px]">Start Time</HeaderCell>
            <HeaderCell width="min-w-[180px]">End Time</HeaderCell>
            <HeaderCell width="min-w-[140px]">Status</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              <td className={`sticky left-0 z-10 bg-white px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-100 w-[${W_ID}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] align-top`}>
                {row.id}
              </td>
              <Cell className="min-w-[120px] font-mono text-xs text-gray-500">{row.vc_id}</Cell>
              <Cell className="min-w-[180px] text-xs">{new Date(row.start_time).toLocaleString()}</Cell>
              <Cell className="min-w-[180px] text-xs">{row.end_time ? new Date(row.end_time).toLocaleString() : '-'}</Cell>
              <Cell className="min-w-[140px]">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                  row.status === 'in_progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                  row.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                  'bg-red-50 text-red-500'
                }`}>
                  {row.status.replace('_', ' ')}
                </span>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
