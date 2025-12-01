import React, { useState } from 'react';
import { ApplicationData, StartupData, MeetingData } from '../types';
import { ChevronDown, AlertCircle, MoreHorizontal, ArrowRight, Building2, MapPin, Calendar } from 'lucide-react';

// --- Constants for Column Widths ---
const COL = {
  ID: "w-[70px] min-w-[70px]",
  COMPANY: "w-[240px] min-w-[240px]",
  TEXT_SM: "w-[140px] min-w-[140px]",
  TEXT_MD: "w-[180px] min-w-[180px]",
  TEXT_LG: "w-[300px] min-w-[300px]",
  TEXT_XL: "w-[400px] min-w-[400px]",
  DATE: "w-[160px] min-w-[160px]",
  STATUS: "w-[150px] min-w-[150px]",
  NUM: "w-[120px] min-w-[120px]",
  ACTION: "w-[50px] min-w-[50px]"
};

// --- Expandable Cell Component (Simple Hover) ---
const ExpandableContent = ({ content, widthClass = COL.TEXT_LG }: { content: string, widthClass?: string }) => {
  return (
    <div className={`group relative ${widthClass}`}>
      {/* Default / Collapsed View */}
      <div className="truncate text-sm text-gray-500 leading-relaxed cursor-default w-full">
        {content}
      </div>

      {/* Hover / Expanded View */}
      <div className="hidden group-hover:block absolute left-0 -top-2 z-50 bg-white p-5 rounded-xl shadow-card-hover border border-gray-100/50 animate-in fade-in zoom-in-95 duration-200 w-full min-w-[320px] max-w-[400px]">
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
      </div>
    </div>
  );
};

// --- Table Helper Components ---

const HeaderCell = ({ children, className = '', width = '' }: { children?: React.ReactNode, className?: string, width?: string }) => (
  <th className={`px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/95 backdrop-blur border-b border-gray-100 align-middle ${className} ${width}`}>
    <div className="flex items-center gap-1.5 cursor-pointer group whitespace-nowrap hover:text-gray-600 transition-colors">
      {children}
    </div>
  </th>
);

const Cell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-4 text-sm text-gray-600 border-b border-gray-50 bg-white align-middle transition-colors group-hover/row:bg-gray-50/40 ${className}`} {...props}>
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
  return (
    <div className="w-full h-full overflow-auto pb-20">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-20 shadow-sm shadow-gray-100/50">
          <tr>
            <th className={`sticky left-0 z-30 bg-white/95 backdrop-blur px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${COL.ID}`}>
              #
            </th>
            <th className={`sticky left-[70px] z-30 bg-white/95 backdrop-blur px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
              Company
            </th>
            
            <HeaderCell width={COL.TEXT_MD}>Industry</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Location</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Founder</HeaderCell>
            <HeaderCell width={COL.NUM}>Round</HeaderCell>
            <HeaderCell width={COL.NUM}>Amount</HeaderCell>
            <HeaderCell width={COL.NUM}>Valuation</HeaderCell>
            <HeaderCell width={COL.STATUS}>Stage</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Description</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Key Insight</HeaderCell>
            <HeaderCell width={COL.STATUS}>Status</HeaderCell>
            <HeaderCell width={COL.ACTION}></HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-all hover:bg-gray-50/40">
              {/* Sticky ID */}
              <td className={`sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/40 px-6 py-4 text-xs font-medium text-gray-300 border-b border-gray-50 ${COL.ID}`}>
                {row.id.split('-')[1]}
              </td>
              {/* Sticky Company Name */}
              <td className={`sticky left-[70px] z-10 bg-white group-hover/row:bg-gray-50/40 px-6 py-4 text-sm font-semibold text-gray-900 border-b border-gray-50 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
                <button 
                  onClick={() => onNameClick(row.companyName)}
                  className="w-full text-left flex items-center gap-3 group/btn"
                >
                   <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100 group-hover/btn:bg-white group-hover/btn:border-indigo-100 group-hover/btn:text-indigo-500 transition-colors">
                      <Building2 size={14} />
                   </div>
                  <span className="truncate group-hover/btn:text-indigo-600 transition-colors">{row.companyName}</span>
                </button>
              </td>
              
              <Cell className={`${COL.TEXT_MD} font-medium`}>{row.industry}</Cell>
              <Cell className={`${COL.TEXT_MD} text-gray-500`}>
                 <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin size={12} />
                    {row.location.split(',')[0]}
                 </div>
              </Cell>
              <Cell className={COL.TEXT_MD}>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-100 text-[10px] flex items-center justify-center font-bold text-indigo-400">
                      {row.founderName.charAt(0)}
                   </div>
                   <span className="text-gray-700">{row.founderName}</span>
                </div>
              </Cell>
              <Cell className={COL.NUM}><span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-md text-xs font-medium text-gray-600">{row.roundType}</span></Cell>
              <Cell className={`${COL.NUM} font-mono text-xs font-medium text-gray-700`}>{row.amountRaising}</Cell>
              <Cell className={`${COL.NUM} font-mono text-xs text-gray-400`}>{row.valuation}</Cell>
              <Cell className={COL.STATUS}><span className="text-[11px] font-semibold text-indigo-600 tracking-wide uppercase">{row.stage}</span></Cell>
              
              <Cell className={`${COL.TEXT_LG}`}>
                  <ExpandableContent content={row.description} widthClass={COL.TEXT_LG}/>
              </Cell>
              
              <Cell className={`${COL.TEXT_LG}`}>
                <ExpandableContent content={row.keyInsight} widthClass={COL.TEXT_LG} />
              </Cell>

              <Cell className={COL.STATUS}>
                <div className="relative">
                    <select 
                    value={row.status}
                    onChange={(e) => onStatusChange && onStatusChange(row.id, e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer focus:ring-0 transition-all w-full ${
                        row.status === 'accepted' ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50' : 
                        row.status === 'rejected' ? 'text-rose-700 bg-rose-50/50 hover:bg-rose-100/50' : 
                        'text-amber-700 bg-amber-50/50 hover:bg-amber-100/50'
                    }`}
                    >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50`} />
                </div>
              </Cell>
              <Cell className={`${COL.ACTION} text-right`}>
                  <button className="text-gray-300 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors"><MoreHorizontal size={16} /></button>
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
  return (
    <div className="w-full h-full overflow-auto pb-20">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-20 shadow-sm shadow-gray-100/50">
          <tr>
            <th className={`sticky left-0 z-30 bg-white/95 backdrop-blur px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${COL.ID}`}>
              #
            </th>
            <th className={`sticky left-[70px] z-30 bg-white/95 backdrop-blur px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
              Company
            </th>
            <HeaderCell width={COL.DATE}>Date Accepted</HeaderCell>
            <HeaderCell width={COL.TEXT_XL}>Context</HeaderCell>
            <HeaderCell width={COL.NUM}>App ID</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-all hover:bg-gray-50/40">
              <td className={`sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/40 px-6 py-4 text-xs text-gray-300 font-medium border-b border-gray-50 ${COL.ID}`}>
                {row.id.split('-')[1]}
              </td>
              <td className={`sticky left-[70px] z-10 bg-white group-hover/row:bg-gray-50/40 px-6 py-4 text-sm font-semibold text-gray-900 border-b border-gray-50 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
                <button 
                  onClick={() => onNameClick(row.companyName)}
                  className="hover:text-indigo-600 transition-colors text-left w-full flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/50">
                      <Building2 size={14} />
                   </div>
                  <span className="truncate">{row.companyName}</span>
                </button>
              </td>
              <Cell className={`${COL.DATE} text-gray-500`}>
                 <div className="flex items-center gap-2 text-xs">
                    <Calendar size={12} className="text-gray-400"/>
                    {new Date(row.dateAccepted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </div>
              </Cell>
              <Cell className={`${COL.TEXT_XL}`}>
                 <ExpandableContent content={row.context} widthClass={COL.TEXT_XL} />
              </Cell>
              <Cell className={`${COL.NUM} text-gray-300 font-mono text-xs`}>{row.applicationId}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Meeting Table ---
export const MeetingTable: React.FC<TableProps<MeetingData>> = ({ data }) => {
  // Override ID width for Meetings as UUIDs are longer
  const MEET_ID_WIDTH = "w-[200px] min-w-[200px]";

  return (
    <div className="w-full h-full overflow-auto pb-20">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-20 shadow-sm shadow-gray-100/50">
          <tr>
            <th className={`sticky left-0 z-30 bg-white/95 backdrop-blur px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${MEET_ID_WIDTH} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
              Meeting ID
            </th>
            <HeaderCell width={COL.TEXT_MD}>VC Lead</HeaderCell>
            <HeaderCell width={COL.DATE}>Start Time</HeaderCell>
            <HeaderCell width={COL.DATE}>End Time</HeaderCell>
            <HeaderCell width={COL.STATUS}>Status</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-all hover:bg-gray-50/40">
              <td className={`sticky left-0 z-10 bg-white group-hover/row:bg-gray-50/40 px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 border-b border-gray-50 ${MEET_ID_WIDTH} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
                {row.id}
              </td>
              <Cell className={`${COL.TEXT_MD} font-medium text-xs text-gray-600`}>{row.vc_id}</Cell>
              <Cell className={`${COL.DATE} text-xs text-gray-500`}>{new Date(row.start_time).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })}</Cell>
              <Cell className={`${COL.DATE} text-xs text-gray-400`}>{row.end_time ? new Date(row.end_time).toLocaleTimeString() : '-'}</Cell>
              <Cell className={COL.STATUS}>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  row.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10' :
                  row.status === 'completed' ? 'bg-gray-50 text-gray-500 border border-gray-100' :
                  'bg-rose-50 text-rose-500 border border-rose-100'
                }`}>
                   {row.status === 'in_progress' && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 animate-pulse"></span>}
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