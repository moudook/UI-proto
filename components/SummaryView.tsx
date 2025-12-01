import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, X, FileDiff, Save, Edit3, MoreVertical } from 'lucide-react';
import { SummaryBlock } from '../types';

interface SummaryViewProps {
  startupName: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/10 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] border border-white/50 ring-1 ring-black/5">
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <div className="flex items-center gap-2 text-gray-800">
            <FileDiff className="w-5 h-5 text-indigo-500" />
            <h3 className="text-xl font-bold tracking-tight">Version Comparison</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto leading-relaxed text-gray-600 font-sans">
          <p className="text-lg">
            {diff.map((token, idx) => {
              if (token.type === 'added') {
                return (
                  <span key={idx} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md mx-0.5 font-medium">
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'removed') {
                return (
                  <span key={idx} className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md mx-0.5 line-through decoration-rose-400 opacity-60 text-base">
                    {token.value}
                  </span>
                );
              }
              return <span key={idx} className="text-gray-500"> {token.value} </span>;
            })}
          </p>
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100/50 rounded-b-3xl flex justify-end gap-6 text-sm">
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

const EditableSummaryCard = ({ item, originalItem, onUpdate }: EditableCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check if saved version is different from previous saved version (History)
  const hasHistory = originalItem.previousContent && originalItem.previousContent.trim() !== originalItem.content.trim();
  
  // Check if current draft is different from saved version (Dirty)
  const isDirty = item.content !== originalItem.content;

  return (
    <>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          flex flex-col p-8 rounded-[2rem] bg-white transition-all duration-300 ease-out
          relative overflow-hidden group border border-gray-100
          ${isHovered ? 'shadow-soft-lg -translate-y-1 z-10' : 'shadow-sm'}
          ${isEditing ? 'ring-2 ring-indigo-500/20' : ''}
        `}
        style={{ minHeight: '300px' }}
      >
        {/* Unsaved Changes Indicator */}
        {isDirty && (
          <div className="absolute top-6 right-6 flex h-3 w-3 z-20" title="Unsaved changes">
             <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></div>
             <div className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></div>
          </div>
        )}
        
        {/* History Indicator (visible on hover) */}
        {!isDirty && hasHistory && isHovered && !isEditing && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowDiff(true);
                }}
                className="absolute top-5 right-5 p-2 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors z-20"
                title="View History"
            >
                <AlertCircle size={18} />
            </button>
        )}

        <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                {item.title}
            </h2>
            <MoreVertical size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div 
          className="flex-1 relative cursor-text group/content"
          onClick={() => setIsEditing(true)}
        >
            {isEditing ? (
              <textarea
                autoFocus
                value={item.content}
                onChange={(e) => onUpdate(item.id, e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="w-full h-full min-h-[200px] resize-none focus:outline-none bg-transparent text-gray-700 leading-relaxed p-0 placeholder-gray-300 text-base"
                placeholder="Type your observations here..."
              />
            ) : (
              <div className="h-full">
                {item.content ? (
                  <p className={`text-gray-600 text-base leading-relaxed whitespace-pre-wrap ${!isHovered ? 'line-clamp-[8]' : ''}`}>
                    {item.content}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 select-none py-10">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <Edit3 size={20} className="opacity-50" />
                    </div>
                    <span className="text-sm font-medium">Empty section</span>
                  </div>
                )}
                
                {/* Fade effect */}
                {!isHovered && item.content && (
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
            )}
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

export const SummaryView: React.FC<SummaryViewProps> = ({ startupName, data, onBack, onSave, searchQuery = '' }) => {
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
    <div className="flex flex-col h-full bg-gray-50/30 overflow-auto pb-20">
      {/* Header */}
      <div className="px-10 py-8 flex-none bg-white/50 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-6">
            <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
                aria-label="Go back"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{startupName}</h1>
                <p className="text-sm text-gray-500 font-medium">Deal Memo & Analysis</p>
            </div>
            </div>

            <button
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-sm transition-all duration-300
                ${hasUnsavedChanges 
                ? 'bg-gray-900 text-white hover:bg-black hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
            >
            <Save size={18} />
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
         </div>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="text-gray-300 mb-2">No matching sections found</div>
                    <div className="text-sm text-gray-400">Try adjusting your search</div>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};