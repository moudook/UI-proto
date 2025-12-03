
import React from 'react';
import { StartupData } from '../../types';
import { Building2, Calendar, MapPin } from 'lucide-react';
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
            <HeaderCell width={COL.TEXT_MD}>Industry</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Location</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Founder</HeaderCell>
            <HeaderCell width={COL.NUM}>Round</HeaderCell>
            <HeaderCell width={COL.NUM}>Amount</HeaderCell>
            <HeaderCell width={COL.NUM}>Valuation</HeaderCell>
            <HeaderCell width={COL.STATUS}>Status</HeaderCell>
            <HeaderCell width={COL.TEXT_MD}>Deal Lead</HeaderCell>
            <HeaderCell width={COL.DATE}>Date Added</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Summary</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Notes</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Next Action</HeaderCell>
            <HeaderCell width={COL.DATE}>Reminder Date</HeaderCell>
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
              <Cell className={`${COL.TEXT_MD} font-medium`}>{row.industry}</Cell>
              <Cell className={`${COL.TEXT_MD} text-gray-500`}>
                 <div className="flex items-center gap-2 text-base text-gray-400">
                    <MapPin size={16} />
                    {row.location.split(',')[0]}
                 </div>
              </Cell>
              <Cell className={COL.TEXT_MD}>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-xs flex items-center justify-center font-bold text-emerald-500">
                      {row.founderName.charAt(0)}
                   </div>
                   <span className="text-gray-700">{row.founderName}</span>
                </div>
              </Cell>
              <Cell className={COL.NUM}><span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md text-sm font-medium text-gray-600">{row.round}</span></Cell>
              <Cell className={`${COL.NUM} font-mono text-base font-medium text-gray-700`}>{row.amountRaising}</Cell>
              <Cell className={`${COL.NUM} font-mono text-base text-gray-400`}>{row.valuation}</Cell>
              <Cell className={COL.STATUS}>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  row.status === 'active' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10' :
                  row.status === 'exited' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  'bg-gray-50 text-gray-500 border border-gray-100'
                }`}>
                  {row.status}
                </span>
              </Cell>
              <Cell className={`${COL.TEXT_MD} text-gray-600 text-sm`}>{row.dealLead}</Cell>
              <Cell className={`${COL.DATE} text-gray-500`}>
                 <div className="flex items-center gap-3 text-base">
                    <Calendar size={16} className="text-gray-400"/>
                    {new Date(row.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </div>
              </Cell>
              <Cell className={`${COL.TEXT_LG}`}>
                 <ExpandableContent content={row.summary} widthClass={COL.TEXT_LG} />
              </Cell>
              <Cell className={`${COL.TEXT_LG}`}>
                 <ExpandableContent content={row.notes} widthClass={COL.TEXT_LG} />
              </Cell>
              <Cell className={`${COL.TEXT_LG}`}>
                 <ExpandableContent content={row.nextAction} widthClass={COL.TEXT_LG} />
              </Cell>
              <Cell className={`${COL.DATE} text-gray-500`}>
                 <div className="flex items-center gap-3 text-base">
                    <Calendar size={16} className="text-gray-400"/>
                    {row.reminderDate ? new Date(row.reminderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                 </div>
              </Cell>
              <Cell className={`${COL.NUM} text-gray-300 font-mono text-base`}>{row.applicationId}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
