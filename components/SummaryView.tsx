import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, X, FileDiff, Save, Edit3 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-900">
            <FileDiff className="w-6 h-6" />
            <h3 className="text-xl font-bold">Version Comparison</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto leading-relaxed text-gray-700">
          <p className="text-lg">
            {diff.map((token, idx) => {
              if (token.type === 'added') {
                return (
                  <span key={idx} className="bg-green-100 text-green-800 px-1 rounded mx-0.5 font-medium border border-green-200">
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'removed') {
                return (
                  <span key={idx} className="bg-red-100 text-red-800 px-1 rounded mx-0.5 line-through decoration-red-400 opacity-80 text-sm">
                    {token.value}
                  </span>
                );
              }
              return <span key={idx} className="text-gray-600"> {token.value} </span>;
            })}
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-end gap-4 text-sm">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span>
                <span className="text-gray-600">Removed</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
                <span className="text-gray-600">Added</span>
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
          flex flex-col p-6 rounded-xl border bg-white shadow-sm transition-all duration-300 ease-in-out
          relative overflow-hidden
          ${isHovered ? 'shadow-xl scale-[1.02] border-indigo-300 z-10' : 'hover:shadow-md border-indigo-100'}
          ${isEditing ? 'ring-2 ring-indigo-400' : ''}
        `}
        style={{ minHeight: '260px' }}
      >
        {/* Unsaved Changes Indicator (Red Blink) */}
        {isDirty && (
          <span className="absolute top-3 right-3 flex h-3 w-3 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}

        <div className="flex justify-between items-start mb-3 border-b border-indigo-50 pb-2">
            <h2 className="text-xl font-handwriting font-semibold text-indigo-700 select-none">
                {item.title}
            </h2>
            
            {/* Alert Button: Only visible if hovered AND changed in history */}
            {hasHistory && isHovered && !isEditing && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDiff(true);
                    }}
                    className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold transition-colors animate-in zoom-in duration-200 z-20"
                >
                    <AlertCircle size={14} />
                    View Changes
                </button>
            )}
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
                className="w-full h-full min-h-[160px] resize-none focus:outline-none bg-transparent font-handwriting text-gray-800 leading-relaxed p-0 placeholder-gray-300"
                placeholder="Click to add summary notes..."
              />
            ) : (
              <div className="h-full">
                {item.content ? (
                  <p className={`text-gray-600 leading-relaxed font-handwriting whitespace-pre-wrap ${!isHovered ? 'line-clamp-6' : ''}`}>
                    {item.content}
                  </p>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 italic select-none">
                    Click to add content...
                    <Edit3 size={16} className="ml-2 opacity-0 group-hover/content:opacity-50 transition-opacity" />
                  </div>
                )}
                
                {/* Fade effect for truncated text */}
                {!isHovered && item.content && (
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
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
  // Local state for drafts (edits in progress)
  const [drafts, setDrafts] = useState<SummaryBlock[]>(data);

  // Sync drafts if external data changes (e.g. initial load)
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
    <div className="flex flex-col h-full bg-white p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            aria-label="Go back"
          >
            <ArrowLeft className="text-gray-500 group-hover:text-indigo-600" size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 tracking-tight">{startupName}</h1>
            <p className="text-sm text-gray-400 font-medium">Investment Summaries</p>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleManualSave}
          disabled={!hasUnsavedChanges}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200
            ${hasUnsavedChanges 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Save size={18} />
          {hasUnsavedChanges ? 'Save Changes' : 'All Saved'}
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl pb-10">
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
          <div className="col-span-full text-center py-10 text-gray-400">
            No summaries found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};