
import React from 'react';
import { StartupData } from '../../types';
import { Building2, Calendar } from 'lucide-react';
import { COL, HeaderCell, Cell, ExpandableContent } from './Shared';

interface StartupTableProps {
  data: StartupData[];
  onNameClick: (id: string, name: string) => void;
}

export const StartupTable: React.FC<StartupTableProps> = ({ data, onNameClick }) => {
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
            <HeaderCell width={COL.DATE}>Date Accepted</HeaderCell>
            <HeaderCell width={COL.TEXT_XL}>Context</HeaderCell>
            <HeaderCell width={COL.NUM}>App ID</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row hover:bg-gray-50">
              <td className={`sticky left-0 z-30 bg-white group-hover/row:bg-gray-50 px-6 py-5 text-base text-gray-300 font-medium border-b border-gray-50 ${COL.ID}`}>
                {row.id.split('-')[1]}
              </td>
              <td className={`sticky left-[90px] z-30 bg-white group-hover/row:bg-gray-50 px-6 py-5 text-lg font-semibold text-gray-900 border-b border-gray-50 ${COL.COMPANY} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
                <button 
                  onClick={() => onNameClick(row.id, row.companyName)}
                  className="hover:text-indigo-600 text-left w-full flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/50">
                      <Building2 size={18} />
                   </div>
                  <span className="truncate">{row.companyName}</span>
                </button>
              </td>
              <Cell className={`${COL.DATE} text-gray-500`}>
                 <div className="flex items-center gap-3 text-base">
                    <Calendar size={16} className="text-gray-400"/>
                    {new Date(row.dateAccepted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </div>
              </Cell>
              <Cell className={`${COL.TEXT_XL}`}>
                 <ExpandableContent 
                    content={typeof row.context === 'string' ? row.context : JSON.stringify(row.context, null, 2)} 
                    widthClass={COL.TEXT_XL} 
                 />
              </Cell>
              <Cell className={`${COL.NUM} text-gray-300 font-mono text-base`}>{row.applicationId}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
