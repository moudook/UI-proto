import React, { useState } from 'react';
import { ApplicationData, StartupData, MeetingData } from '../types';
import { ChevronDown, AlertCircle, FileDiff, X, MoreHorizontal } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/20 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] border border-white/50">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <FileDiff className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold">Version Comparison</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto leading-relaxed text-gray-600">
          <p className="text-base">
            {diff.map((token, idx) => {
              if (token.type === 'added') {
                return (
                  <span key={idx} className="bg-emerald-100/60 text-emerald-700 px-1.5 py-0.5 rounded-md mx-0.5 font-medium border border-emerald-200/50">
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'removed') {
                return (
                  <span key={idx} className="bg-rose-100/60 text-rose-700 px-1.5 py-0.5 rounded-md mx-0.5 line-through decoration-rose-400/50 opacity-70 text-sm">
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

// --- Expandable Cell Component ---
const ExpandableContent = ({ content, previousContent, widthClass = "w-[260px]" }: { content: string, previousContent?: string, widthClass?: string }) => {
  const [showDiff, setShowDiff] = useState(false);
  const hasChanged = previousContent && previousContent.trim() !== content.trim();

  return (
    <>
      <div className={`group relative ${widthClass} transition-all duration-300 ease-in-out`}>
        <div className="truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-white group-hover:shadow-xl group-hover:z-50 group-hover:absolute group-hover:left-0 group-hover:-top-2 group-hover:p-4 group-hover:rounded-xl group-hover:border group-hover:border-gray-100 text-sm text-gray-600 leading-relaxed cursor-default">
          {content}
          
          {hasChanged && (
             <div className="hidden group-hover:flex justify-start mt-3 pt-3 border-t border-gray-100">
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDiff(true);
                  }}
                  className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-orange-200/50 w-full justify-center"
                >
                  <AlertCircle size={14} />
                  See Changes
                </button>
            </div>
          )}
        </div>
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
  <th className={`px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white border-b border-gray-100 align-middle ${className} ${width}`}>
    <div className="flex items-center gap-1.5 cursor-pointer group whitespace-nowrap hover:text-gray-600 transition-colors">
      {children}
    </div>
  </th>
);

const Cell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-5 py-4 text-sm text-gray-600 border-b border-gray-50 bg-white align-top transition-colors group-hover/row:bg-gray-50/50 ${className}`} {...props}>
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
  const W_ID = "80px";
  const W_COMPANY = "180px"; 
  
  return (
    <div className="w-full h-full overflow-auto pb-20">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-20 shadow-sm shadow-gray-100">
          <tr>
            <th className={`sticky left-0 z-30 bg-white px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 w-[${W_ID}] min-w-[${W_ID}]`}>
              ID
            </th>
            <th className={`sticky left-[${W_ID}] z-30 bg-white px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 w-[${W_COMPANY}] min-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]`}>
              Company
            </th>
            
            <HeaderCell width="min-w-[140px]">Industry</HeaderCell>
            <HeaderCell width="min-w-[150px]">Location</HeaderCell>
            <HeaderCell width="min-w-[140px]">Founder</HeaderCell>
            <HeaderCell width="min-w-[100px]">Round</HeaderCell>
            <HeaderCell width="min-w-[110px]">Amount</HeaderCell>
            <HeaderCell width="min-w-[110px]">Valuation</HeaderCell>
            <HeaderCell width="min-w-[120px]">Stage</HeaderCell>
            <HeaderCell width="min-w-[280px]">Description</HeaderCell>
            <HeaderCell width="min-w-[280px]">Key Insight</HeaderCell>
            <HeaderCell width="min-w-[140px]">Status</HeaderCell>
            <HeaderCell width="min-w-[50px]"></HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-all hover:bg-gray-50/50">
              {/* Sticky ID */}
              <td className={`sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/50 px-5 py-4 text-xs font-mono text-gray-400 border-b border-gray-50 w-[${W_ID}] min-w-[${W_ID}] align-top`}>
                <span className="opacity-70">#</span>{row.id.split('-')[1]}
              </td>
              {/* Sticky Company Name */}
              <td className={`sticky left-[${W_ID}] z-10 bg-white group-hover/row:bg-gray-50/50 px-5 py-4 text-sm font-semibold text-gray-900 border-b border-gray-50 w-[${W_COMPANY}] min-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] align-top`}>
                <button 
                  onClick={() => onNameClick(row.companyName)}
                  className="w-full text-left group hover:text-indigo-600 transition-colors block"
                >
                  <span className="truncate w-full block">{row.companyName}</span>
                </button>
              </td>
              
              <Cell className="min-w-[140px] font-medium">{row.industry}</Cell>
              <Cell className="min-w-[150px] text-gray-500">{row.location}</Cell>
              <Cell className="min-w-[140px]">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[10px] flex items-center justify-center font-bold text-gray-500">
                      {row.founderName.charAt(0)}
                   </div>
                   {row.founderName}
                </div>
              </Cell>
              <Cell className="min-w-[100px]"><span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium text-gray-600">{row.roundType}</span></Cell>
              <Cell className="min-w-[110px] font-mono text-xs">{row.amountRaising}</Cell>
              <Cell className="min-w-[110px] font-mono text-xs text-gray-400">{row.valuation}</Cell>
              <Cell className="min-w-[120px]"><span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full">{row.stage}</span></Cell>
              
              <Cell className="min-w-[280px] p-0">
                  <div className="px-5 py-4"><ExpandableContent content={row.description} widthClass="w-[260px]"/></div>
              </Cell>
              
              <Cell className="min-w-[280px] p-0">
                <div className="px-5 py-4"><ExpandableContent content={row.keyInsight} previousContent={row.previousKeyInsight} widthClass="w-[260px]" /></div>
              </Cell>

              <Cell className="min-w-[140px]">
                <div className="relative">
                    <select 
                    value={row.status}
                    onChange={(e) => onStatusChange && onStatusChange(row.id, e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-bold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 transition-all w-full ${
                        row.status === 'accepted' ? 'text-emerald-700 bg-emerald-100 focus:ring-emerald-200' : 
                        row.status === 'rejected' ? 'text-rose-700 bg-rose-100 focus:ring-rose-200' : 
                        'text-amber-700 bg-amber-100 focus:ring-amber-200'
                    }`}
                    >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${
                        row.status === 'accepted' ? 'text-emerald-700' : 
                        row.status === 'rejected' ? 'text-rose-700' : 
                        'text-amber-700'
                    }`} />
                </div>
              </Cell>
              <Cell className="min-w-[50px] text-right">
                  <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal size={16} /></button>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Startup Table ---
export const StartupTable: React.FC<TableProps<StartupData>> = ({ data, onNameClick }) => {
  const W_ID = "80px";
  const W_COMPANY = "180px";

  return (
    <div className="w-full h-full overflow-auto pb-20">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-20 shadow-sm shadow-gray-100">
          <tr>
            <th className={`sticky left-0 z-30 bg-white px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 w-[${W_ID}] min-w-[${W_ID}]`}>
              ID
            </th>
            <th className={`sticky left-[${W_ID}] z-30 bg-white px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 w-[${W_COMPANY}] min-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]`}>
              Company
            </th>
            <HeaderCell width="min-w-[140px]">Date Accepted</HeaderCell>
            <HeaderCell width="min-w-[400px]">Context</HeaderCell>
            <HeaderCell width="min-w-[120px]">App ID</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-all hover:bg-gray-50/50">
              <td className={`sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/50 px-5 py-4 text-xs text-gray-400 font-mono border-b border-gray-50 w-[${W_ID}] align-top`}>
                <span className="opacity-70">#</span>{row.id.split('-')[1]}
              </td>
              <td className={`sticky left-[${W_ID}] z-10 bg-white group-hover/row:bg-gray-50/50 px-5 py-4 text-sm font-semibold text-gray-900 border-b border-gray-50 w-[${W_COMPANY}] min-w-[${W_COMPANY}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] align-top`}>
                <button 
                  onClick={() => onNameClick(row.companyName)}
                  className="hover:text-indigo-600 transition-colors text-left w-full block"
                >
                  <span className="truncate w-full block">{row.companyName}</span>
                </button>
              </td>
              <Cell className="min-w-[140px] text-gray-500">{new Date(row.dateAccepted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Cell>
              <Cell className="min-w-[400px] p-0">
                 <div className="px-5 py-4"><ExpandableContent content={row.context} previousContent={row.previousContext} widthClass="w-[380px]" /></div>
              </Cell>
              <Cell className="min-w-[120px] text-gray-300 font-mono text-xs">{row.applicationId}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Meeting Table ---
export const MeetingTable: React.FC<TableProps<MeetingData>> = ({ data }) => {
  const W_ID = "180px";

  return (
    <div className="w-full h-full overflow-auto pb-20">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-20 shadow-sm shadow-gray-100">
          <tr>
            <th className={`sticky left-0 z-30 bg-white px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 w-[${W_ID}] min-w-[${W_ID}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]`}>
              Meeting ID
            </th>
            <HeaderCell width="min-w-[140px]">VC Lead</HeaderCell>
            <HeaderCell width="min-w-[200px]">Start Time</HeaderCell>
            <HeaderCell width="min-w-[200px]">End Time</HeaderCell>
            <HeaderCell width="min-w-[160px]">Status</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-all hover:bg-gray-50/50">
              <td className={`sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/50 px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-50 w-[${W_ID}] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] align-top`}>
                {row.id}
              </td>
              <Cell className="min-w-[140px] font-mono text-xs text-gray-500">{row.vc_id}</Cell>
              <Cell className="min-w-[200px] text-xs text-gray-500">{new Date(row.start_time).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })}</Cell>
              <Cell className="min-w-[200px] text-xs text-gray-400">{row.end_time ? new Date(row.end_time).toLocaleTimeString() : '-'}</Cell>
              <Cell className="min-w-[160px]">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  row.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600 animate-pulse ring-1 ring-indigo-200' :
                  row.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                  'bg-rose-50 text-rose-500'
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