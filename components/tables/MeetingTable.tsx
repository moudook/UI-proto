
import React from 'react';
import { MeetingData, TranscriptChunk } from '../../types';
import { COL, HeaderCell, Cell, ExpandableContent } from './Shared';

interface MeetingTableProps {
  data: MeetingData[];
  onNameClick: (id: string) => void;
}

const formatTranscript = (chunks: TranscriptChunk[] = []) => {
  if (!chunks || chunks.length === 0) return "No transcript available";
  return chunks.map(c => `[${new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${c.speaker}: ${c.text}`).join('\n');
};

export const MeetingTable: React.FC<MeetingTableProps> = ({ data, onNameClick }) => {
  // Override ID width for Meetings as UUIDs are longer
  const MEET_ID_WIDTH = "w-[200px] min-w-[200px]";

  return (
    <div className="w-full h-full overflow-auto pb-20 font-sans">
      <table className="min-w-max border-separate border-spacing-0">
        <thead className="bg-white sticky top-0 z-40 shadow-sm shadow-gray-100/50">
          <tr>
            <th className={`sticky left-0 z-50 bg-white px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${MEET_ID_WIDTH} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
              Meeting ID
            </th>
            <HeaderCell width={COL.TEXT_MD}>VC Lead</HeaderCell>
            <HeaderCell width={COL.DATE}>Start Time</HeaderCell>
            <HeaderCell width={COL.DATE}>End Time</HeaderCell>
            <HeaderCell width={COL.STATUS}>Status</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Transcript</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Chat History</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>Summary</HeaderCell>
            <HeaderCell width={COL.TEXT_LG}>VC Notes</HeaderCell>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row) => (
            <tr key={row.id} className="group/row transition-colors hover:bg-gray-50">
              <td className={`sticky left-0 z-30 bg-white group-hover/row:bg-gray-50 px-4 py-3 whitespace-nowrap text-xs font-mono border-b border-gray-50 ${MEET_ID_WIDTH} shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]`}>
                 <button 
                  onClick={() => onNameClick(row.id)}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors text-left"
                >
                  {row.id}
                </button>
              </td>
              <Cell className={`${COL.TEXT_MD} font-medium text-xs text-gray-600`}>{row.vc_id}</Cell>
              <Cell className={`${COL.DATE} text-xs text-gray-500`}>{new Date(row.start_time).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' })}</Cell>
              <Cell className={`${COL.DATE} text-xs text-gray-400`}>{row.end_time ? new Date(row.end_time).toLocaleTimeString() : '-'}</Cell>
              <Cell className={COL.STATUS}>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  row.status === 'in_progress' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10' :
                  row.status === 'completed' ? 'bg-gray-50 text-gray-500 border border-gray-100' :
                  'bg-rose-50 text-rose-500 border border-rose-100'
                }`}>
                   {row.status === 'in_progress' && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-1.5 animate-pulse"></span>}
                  {row.status.replace('_', ' ')}
                </span>
              </Cell>
              
              <Cell className={COL.TEXT_LG}>
                 <ExpandableContent content={formatTranscript(row.transcript)} widthClass={COL.TEXT_LG} />
              </Cell>
              <Cell className={COL.TEXT_LG}>
                 <ExpandableContent content={formatTranscript(row.chat_history)} widthClass={COL.TEXT_LG} />
              </Cell>

              <Cell className={COL.TEXT_LG}>
                 <ExpandableContent content={row.summary || '-'} widthClass={COL.TEXT_LG} />
              </Cell>
              <Cell className={COL.TEXT_LG}>
                 <ExpandableContent content={row.vc_notes || '-'} widthClass={COL.TEXT_LG} />
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
