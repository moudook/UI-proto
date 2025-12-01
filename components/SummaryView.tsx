import React, { useState, useEffect } from 'react';
import { Save, Edit3, Clock, X } from 'lucide-react';
import { SummaryBlock } from '../types';

interface SummaryViewProps {
  title: string;
  subtitle?: string;
  data: SummaryBlock[]; // The saved data
  onBack: () => void;
  onSave: (newData: SummaryBlock[]) => void;
  searchQuery?: string;
}

// --- Utils: Simple Word Diff (LCS) ---
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

// --- Components ---

const DiffModal = ({ oldText, newText, onClose }: { oldText: string, newText: string, onClose: () => void }) => {
  const diff = computeDiff(oldText, newText);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/10 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] ring-1 ring-black/5">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Clock className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-bold tracking-tight">Version History</h3>
                <p className="text-xs text-gray-500 font-medium">Comparing previous saved state</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto leading-relaxed text-gray-600 font-sans text-sm">
          <p>
            {diff.map((token, idx) => {
              if (token.type === 'added') {
                return (
                  <span key={idx} className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded mx-0.5 font-medium border border-emerald-200/50">
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'removed') {
                return (
                  <span key={idx} className="bg-rose-50 text-rose-400 px-1 py-0.5 rounded mx-0.5 line-through decoration-rose-300 opacity-70">
                    {token.value}
                  </span>
                );
              }
              return <span key={idx} className="text-gray-500"> {token.value} </span>;
            })}
          </p>
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-[2rem] flex justify-end gap-6 text-xs">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                <span className="text-gray-500 font-medium">Removed</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-gray-500 font-medium">Added</span>
            </div>
        </div>
      </div>
    </div>
  );
};

interface EditableCardProps {
  item: SummaryBlock;
  originalItem: SummaryBlock;
  onUpdate: (id: string, newContent: string) => void;
}

const EditableSummaryCard: React.FC<EditableCardProps> = ({ item, originalItem, onUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check if saved version is different from previous saved version (History)
  const hasHistory = originalItem.previousContent && originalItem.previousContent.trim() !== originalItem.content.trim();
  
  // Check if current draft is different from saved version (Dirty)
  const isDirty = item.content !== originalItem.content;
  
  // Active state is defined as hovered or being edited
  const isActive = isHovered || isEditing;

  return (
    <>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex flex-col p-6 rounded-2xl bg-white transition-all duration-300 ease-out
          relative overflow-hidden group
          ${isActive ? 'border border-gray-300 shadow-sm' : 'border border-transparent shadow-none'}
        `}
        style={{ minHeight: '260px' }}
      >
        {/* Unsaved Changes Indicator */}
        {isDirty && (
          <div className="absolute top-4 right-4 flex h-2 w-2 z-20" title="Unsaved changes">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </div>
        )}
        
        {/* History Indicator (visible on hover) */}
        {!isDirty && hasHistory && isHovered && !isEditing && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowDiff(true);
                }}
                className="absolute top-3 right-3 p-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-indigo-600 transition-colors z-20"
                title="View History"
            >
                <Clock size={14} />
            </button>
        )}

        {/* Content Section - Now at the top */}
        <div 
          className="flex-1 relative cursor-text group/content mb-4"
          onClick={() => setIsEditing(true)}
        >
            {isEditing ? (
              <textarea
                autoFocus
                value={item.content}
                onChange={(e) => onUpdate(item.id, e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="w-full h-full resize-none focus:outline-none bg-transparent text-gray-700 leading-6 p-0 placeholder-gray-300 text-sm font-medium"
                placeholder="Click to add notes..."
              />
            ) : (
              <div className="h-full">
                {item.content ? (
                  <p className={`text-gray-600 text-sm leading-6 whitespace-pre-wrap ${!isHovered ? 'line-clamp-[8]' : ''}`}>
                    {item.content}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 select-none py-6 opacity-40">
                    <span className="text-xs font-medium">Empty section</span>
                  </div>
                )}
                
                {/* Fade effect */}
                {!isActive && item.content && (
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
            )}
        </div>

        {/* Title Section - Now at the bottom */}
        <div className="flex justify-between items-end pt-4 border-t border-gray-50 mt-auto">
            <h2 className="text-xs font-bold text-gray-900 tracking-wider uppercase">
                {item.title}
            </h2>
        </div>
      </div>

      {showDiff && originalItem.previousContent && (
        <DiffModal 
            oldText={originalItem.previousContent} 
            newText={originalItem.content} 
            onClose={() => setShowDiff(false)} 
        />
      )}
    </>
  );
};

export const SummaryView: React.FC<SummaryViewProps> = ({ 
  title, 
  subtitle = "Due Diligence Notebook", 
  data, 
  onBack, 
  onSave, 
  searchQuery = '' 
}) => {
  const [drafts, setDrafts] = useState<SummaryBlock[]>(data);

  useEffect(() => {
    setDrafts(data);
  }, [data]);

  const handleUpdateContent = (id: string, newContent: string) => {
    setDrafts(prev => prev.map(block => 
      block.id === id ? { ...block, content: newContent } : block
    ));
  };

  const handleManualSave = () => {
    onSave(drafts);
  };

  const hasUnsavedChanges = drafts.some((draft, idx) => {
    const original = data.find(d => d.id === draft.id);
    return original && original.content !== draft.content;
  });

  const filteredSummaries = drafts.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-auto pb-20">
      {/* Header */}
      <div className="px-8 py-5 flex-none bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50">
          <div className="flex items-center justify-between w-full">
            {/* Title Only - Back button removed */}
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">{subtitle}</p>
            </div>

            <button
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-300
                ${hasUnsavedChanges 
                ? 'bg-gray-900 text-white hover:bg-black hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-white text-gray-300 border border-gray-100 cursor-not-allowed'}
            `}
            >
            <Save size={14} />
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
         </div>
      </div>

      {/* Grid Layout - Adaptive Columns */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="w-full">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                {filteredSummaries.length > 0 ? (
                filteredSummaries.map((item) => {
                    const original = data.find(d => d.id === item.id) || item;
                    return (
                    <EditableSummaryCard 
                        key={item.id} 
                        item={item} 
                        originalItem={original}
                        onUpdate={handleUpdateContent}
                    />
                    );
                })
                ) : (
                <div className="col-span-full py-20 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Edit3 size={20} />
                    </div>
                    <div className="text-gray-900 font-medium mb-1 text-sm">No notes found</div>
                    <div className="text-xs text-gray-400">Try adjusting your search filters</div>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};