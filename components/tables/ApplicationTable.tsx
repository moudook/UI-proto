
import React from 'react';
import { ApplicationData } from '../../types';
import { ChevronDown, MoreHorizontal, Building2, MapPin } from 'lucide-react';
import { COL, HeaderCell, Cell, ExpandableContent } from './Shared';

interface ApplicationTableProps {
  data: ApplicationData[];
  onNameClick: (id: string, name: string) => void;
  onStatusChange?: (id: string, newStatus: any) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ data, onNameClick, onStatusChange }) => {
  return (
    <div className="w-full h-full overflow-auto pb-20 font-sans">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-40 shadow-sm shadow-gray-100/50">
          <tr>
            <th className={`sticky left-0 z-50 bg-white px-6 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${COL.ID}`}>
              #
            </th>
            <th className={`sticky left-[90px] z-50 bg-white px-6 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
              Company
            </th>
            
            <HeaderCell width={COL.TEXT_MD}>Industry</HeaderCell>
            <HeaderCell width={COL.STATUS}>Status</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Location</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Founder</HeaderCell>
            <HeaderCell width={COL.NUM}>Round</HeaderCell>
            <HeaderCell width={COL.NUM}>Amount</HeaderCell>
            <HeaderCell width={COL.NUM}>Valuation</HeaderCell>
            <HeaderCell width={COL.STATUS}>Stage</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Description</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Key Insight</HeaderCell>
            <HeaderCell width={COL.ACTION}></HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row hover:bg-gray-50">
              {/* Sticky ID */}
              <td className={`sticky left-0 z-30 bg-white group-hover/row:bg-gray-50 px-6 py-5 text-base font-medium text-gray-300 border-b border-gray-50 ${COL.ID}`}>
                {row.id.split('-')[1]}
              </td>
              {/* Sticky Company Name */}
              <td className={`sticky left-[90px] z-30 bg-white group-hover/row:bg-gray-50 px-6 py-5 text-lg font-semibold text-gray-900 border-b border-gray-50 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
                <button 
                  onClick={() => onNameClick(row.id, row.companyName)}
                  className="w-full text-left flex items-center gap-4 group/btn"
                >
                   <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100 group-hover/btn:bg-white group-hover/btn:border-indigo-100 group-hover/btn:text-indigo-500">
                      <Building2 size={18} />
                   </div>
                  <span className="truncate group-hover/btn:text-indigo-600">{row.companyName}</span>
                </button>
              </td>
              
              <Cell className={`${COL.TEXT_MD} font-medium`}>{row.industry}</Cell>
              
              <Cell className={COL.STATUS}>
                <div className="relative">
                    <select 
                    value={row.status}
                    onChange={(e) => onStatusChange && onStatusChange(row.id, e.target.value)}
                    className={`appearance-none pl-4 pr-8 py-2 text-sm font-bold rounded-lg border-0 cursor-pointer focus:ring-0 w-full ${
                        row.status === 'accepted' ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50' : 
                        row.status === 'rejected' ? 'text-rose-700 bg-rose-50/50 hover:bg-rose-100/50' : 
                        'text-amber-700 bg-amber-50/50 hover:bg-amber-100/50'
                    }`}
                    >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50`} />
                </div>
              </Cell>

              <Cell className={`${COL.TEXT_MD} text-gray-500`}>
                 <div className="flex items-center gap-2 text-base text-gray-400">
                    <MapPin size={16} />
                    {row.location.split(',')[0]}
                 </div>
              </Cell>
              <Cell className={COL.TEXT_MD}>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-100 text-xs flex items-center justify-center font-bold text-indigo-400">
                      {row.founderName.charAt(0)}
                   </div>
                   <span className="text-gray-700">{row.founderName}</span>
                </div>
              </Cell>
              <Cell className={COL.NUM}><span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md text-sm font-medium text-gray-600">{row.roundType}</span></Cell>
              <Cell className={`${COL.NUM} font-mono text-base font-medium text-gray-700`}>{row.amountRaising}</Cell>
              <Cell className={`${COL.NUM} font-mono text-base text-gray-400`}>{row.valuation}</Cell>
              <Cell className={COL.STATUS}><span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">{row.stage}</span></Cell>
              
              <Cell className={`${COL.TEXT_LG}`}>
                  <ExpandableContent content={row.description} widthClass={COL.TEXT_LG}/>
              </Cell>
              
              <Cell className={`${COL.TEXT_LG}`}>
                <ExpandableContent content={row.keyInsight} widthClass={COL.TEXT_LG} />
              </Cell>

              <Cell className={`${COL.ACTION} text-right`}>
                  <button className="text-gray-300 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"><MoreHorizontal size={20} /></button>
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
