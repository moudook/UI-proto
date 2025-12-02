
import React from 'react';

// --- Constants for Column Widths (Scaled up ~1.3-1.5x) ---
export const COL = {
  ID: "w-[90px] min-w-[90px]",
  COMPANY: "w-[340px] min-w-[340px]",
  TEXT_SM: "w-[180px] min-w-[180px]",
  TEXT_MD: "w-[240px] min-w-[240px]",
  TEXT_LG: "w-[420px] min-w-[420px]",
  TEXT_XL: "w-[600px] min-w-[600px]",
  DATE: "w-[220px] min-w-[220px]",
  STATUS: "w-[200px] min-w-[200px]",
  NUM: "w-[160px] min-w-[160px]",
  ACTION: "w-[80px] min-w-[80px]"
};

// --- Expandable Cell Component ---
export const ExpandableContent = ({ content, widthClass = COL.TEXT_LG }: { content: string, widthClass?: string }) => {
  return (
    <div className={`group relative ${widthClass}`}>
      <div className="truncate text-lg text-gray-500 leading-relaxed cursor-default w-full font-medium transition-colors group-hover:text-gray-700">
        {content}
      </div>
      <div className="hidden group-hover:block absolute left-0 -top-2 z-50 bg-gray-900 text-white p-6 rounded-xl shadow-xl shadow-gray-200 w-full min-w-[400px] max-w-[500px] animate-in fade-in zoom-in-95 duration-200">
          <div className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
            {content}
          </div>
      </div>
    </div>
  );
};

// --- Table Helper Components ---

export const HeaderCell = ({ children, className = '', width = '' }: { children?: React.ReactNode, className?: string, width?: string }) => (
  <th className={`px-6 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-widest bg-white border-b border-gray-100 align-middle ${className} ${width}`}>
    <div className="flex items-center gap-2 cursor-pointer group whitespace-nowrap hover:text-gray-800 transition-colors duration-200">
      {children}
    </div>
  </th>
);

export const Cell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-5 text-lg text-gray-600 border-b border-gray-50 bg-white align-middle group-hover/row:bg-gray-50 transition-colors duration-150 ${className}`} {...props}>
    {children}
  </td>
);
