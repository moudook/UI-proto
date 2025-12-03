
import React from 'react';
import { ApplicationData } from '../../types';
import { ChevronDown, MoreHorizontal, Building2, MapPin } from 'lucide-react';
import { COL, HeaderCell, Cell, ExpandableContent, QnAExpandable } from './Shared';

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
            <HeaderCell width={COL.TEXT_MD}>Contact</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Email</HeaderCell>
            <HeaderCell width={COL.DATE}>Date Added</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Startup Description</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Key Insight</HeaderCell>
            <HeaderCell width={COL.TEXT_XL}>Q&A</HeaderCell>
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
                    disabled={row.status === 'rejected' || row.status === 'accepted'}
                    className={`appearance-none pl-4 pr-8 py-2 text-sm font-bold rounded-lg border-0 focus:ring-0 w-full ${
                        row.status === 'rejected'
                            ? 'text-rose-700 bg-rose-50/50 cursor-not-allowed opacity-60'
                            : row.status === 'accepted'
                            ? 'text-emerald-700 bg-emerald-50/50 cursor-not-allowed opacity-60'
                            : 'text-amber-700 bg-amber-50/50 hover:bg-amber-100/50 cursor-pointer'
                    }`}
                    >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${(row.status === 'rejected' || row.status === 'accepted') ? 'opacity-30' : 'opacity-50'}`} />
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
              <Cell className={`${COL.TEXT_MD} text-gray-500 text-sm`}>{row.founderContact}</Cell>
              <Cell className={`${COL.TEXT_MD} text-gray-500 text-sm`}>{row.email}</Cell>
              <Cell className={`${COL.DATE} text-gray-500`}>
                 <div className="flex items-center gap-2 text-sm">
                    {new Date(row.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </div>
              </Cell>

              <Cell className={`${COL.TEXT_LG}`}>
                  <ExpandableContent content={row.startupDescription} widthClass={COL.TEXT_LG}/>
              </Cell>
              
              <Cell className={`${COL.TEXT_LG}`}>
                <ExpandableContent content={row.keyInsight} widthClass={COL.TEXT_LG} />
              </Cell>

              <Cell className={`${COL.TEXT_XL}`}>
                <QnAExpandable qnaData={row.QnA} widthClass={COL.TEXT_XL} />
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
