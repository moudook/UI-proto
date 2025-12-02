
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
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-3xl w-full flex flex-col max-h-[80vh] ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center gap-4 text-gray-900">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Clock className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Version History</h3>
                <p className="text-sm text-gray-500 font-medium">Comparing previous saved state</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-10 overflow-y-auto leading-relaxed text-gray-600 font-sans text-lg">
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

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 rounded-b-[2rem] flex justify-end gap-8 text-sm">
            <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
                <span className="text-gray-500 font-medium">Removed</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
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
          flex flex-col p-8 rounded-3xl bg-white
          relative overflow-hidden group transition-all duration-300 ease-out
          ${isActive ? 'border border-gray-300 shadow-card-hover -translate-y-1' : 'border border-transparent shadow-none'}
        `}
        style={{ minHeight: '320px' }}
      >
        {/* Unsaved Changes Indicator */}
        {isDirty && (
          <div className="absolute top-6 right-6 flex h-3 w-3 z-20" title="Unsaved changes">
             <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 animate-pulse"></span>
          </div>
        )}
        
        {/* History Indicator (visible on hover) */}
        {!isDirty && hasHistory && isHovered && !isEditing && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowDiff(true);
                }}
                className="absolute top-5 right-5 p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-indigo-600 z-20 transition-all animate-in fade-in duration-200"
                title="View History"
            >
                <Clock size={18} />
            </button>
        )}

        {/* Content Section - Now at the top */}
        <div 
          className="flex-1 relative cursor-text group/content mb-6"
          onClick={() => setIsEditing(true)}
        >
            {isEditing ? (
              <textarea
                autoFocus
                value={item.content}
                onChange={(e) => onUpdate(item.id, e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="w-full h-full resize-none focus:outline-none bg-transparent text-gray-700 leading-relaxed p-0 placeholder-gray-300 text-lg font-medium"
                placeholder="Click to add notes..."
              />
            ) : (
              <div className="h-full">
                {item.content ? (
                  <p className={`text-gray-600 text-lg leading-relaxed whitespace-pre-wrap transition-opacity duration-200 ${!isHovered ? 'line-clamp-[10]' : ''}`}>
                    {item.content}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 select-none py-10 opacity-40">
                    <span className="text-base font-medium">Empty section</span>
                  </div>
                )}
                
                {/* Fade effect */}
                {!isActive && item.content && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300" />
                )}
              </div>
            )}
        </div>

        {/* Title Section - Now at the bottom */}
        <div className="flex justify-between items-end pt-6 border-t border-gray-50 mt-auto">
            <h2 className="text-sm font-bold text-gray-900 tracking-wider uppercase">
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
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-10 py-6 flex-none bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50">
          <div className="flex items-center justify-between w-full">
            {/* Title Only - Back button removed */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-wide">{subtitle}</p>
            </div>

            <button
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-sm transition-all duration-200
                ${hasUnsavedChanges 
                ? 'bg-gray-900 text-white hover:bg-black hover:shadow-lg active:scale-95' 
                : 'bg-white text-gray-300 border border-gray-100 cursor-not-allowed'}
            `}
            >
            <Save size={18} />
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
         </div>
      </div>

      {/* Grid Layout - Adaptive Columns */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="w-full">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-8">
                {filteredSummaries.length > 0 ? (
                filteredSummaries.map((item, idx) => {
                    const original = data.find(d => d.id === item.id) || item;
                    return (
                     <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{ animationDelay: `${idx * 50}ms` }}>
                        <EditableSummaryCard 
                            item={item} 
                            originalItem={original}
                            onUpdate={handleUpdateContent}
                        />
                     </div>
                    );
                })
                ) : (
                <div className="col-span-full py-24 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Edit3 size={28} />
                    </div>
                    <div className="text-gray-900 font-medium mb-2 text-lg">No notes found</div>
                    <div className="text-sm text-gray-400">Try adjusting your search filters</div>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
