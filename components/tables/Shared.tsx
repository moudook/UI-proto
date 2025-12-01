
import React from 'react';

// --- Constants for Column Widths ---
export const COL = {
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

// --- Expandable Cell Component ---
export const ExpandableContent = ({ content, widthClass = COL.TEXT_LG }: { content: string, widthClass?: string }) => {
  return (
    <div className={`group relative ${widthClass}`}>
      <div className="truncate text-sm text-gray-500 leading-relaxed cursor-default w-full font-medium transition-colors group-hover:text-gray-700">
        {content}
      </div>
      <div className="hidden group-hover:block absolute left-0 -top-2 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl shadow-gray-200 w-full min-w-[320px] max-w-[400px] animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
            {content}
          </div>
      </div>
    </div>
  );
};

// --- Table Helper Components ---

export const HeaderCell = ({ children, className = '', width = '' }: { children?: React.ReactNode, className?: string, width?: string }) => (
  <th className={`px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border-b border-gray-100 align-middle ${className} ${width}`}>
    <div className="flex items-center gap-1.5 cursor-pointer group whitespace-nowrap hover:text-gray-800 transition-colors duration-200">
      {children}
    </div>
  </th>
);

export const Cell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-4 py-3 text-sm text-gray-600 border-b border-gray-50 bg-white align-middle group-hover/row:bg-gray-50 transition-colors duration-150 ${className}`} {...props}>
    {children}
  </td>
);
