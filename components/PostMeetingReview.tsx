import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Edit3, ArrowLeft, GitCommit, Sparkles } from 'lucide-react';
import { DiffItem } from '../types';

interface PostMeetingReviewProps {
  sessionId: string;
  onComplete: (acceptedDiffs: DiffItem[]) => void;
  onCancel: () => void;
}

// Mock generator for diffs (In real app, this comes from backend analysis of the meeting)
const generateMockDiffs = (): DiffItem[] => [
  {
    id: 'diff-1',
    field: 'valuation',
    fieldName: 'Valuation Update',
    oldValue: '$12M',
    newValue: '$15M',
    status: 'pending'
  },
  {
    id: 'diff-2',
    field: 'keyInsight',
    fieldName: 'Key Insight',
    oldValue: 'Strong retention metrics in beta.',
    newValue: 'Strong retention metrics in beta. \n\nNew Note: Founder mentioned they have secured a pilot with a Fortune 500 retailer starting next month.',
    status: 'pending'
  },
  {
    id: 'diff-3',
    field: 'stage',
    fieldName: 'Stage Progression',
    oldValue: 'Due Diligence',
    newValue: 'Term Sheet',
    status: 'pending'
  }
];

export const PostMeetingReview: React.FC<PostMeetingReviewProps> = ({ sessionId, onComplete, onCancel }) => {
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Simulate fetching analysis from backend
    setTimeout(() => {
      setDiffs(generateMockDiffs());
    }, 500);
  }, [sessionId]);

  const handleStatusChange = (id: string, status: 'accepted' | 'rejected') => {
    setDiffs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    
    // Auto-advance after a short delay if accepting/rejecting
    if (activeIndex < diffs.length - 1) {
       setTimeout(() => {
         setActiveIndex(prev => prev + 1);
       }, 300);
    }
  };

  const handleUpdateNewValue = (id: string, val: string) => {
    setDiffs(prev => prev.map(d => d.id === id ? { ...d, newValue: val } : d));
  };

  const handleFinish = () => {
    const accepted = diffs.filter(d => d.status === 'accepted');
    onComplete(accepted);
  };

  const pendingCount = diffs.filter(d => d.status === 'pending').length;
  const progress = ((diffs.length - pendingCount) / diffs.length) * 100;

  if (diffs.length === 0) {
      return (
          <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center">
              <div className="flex flex-col items-center gap-6 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Sparkles className="text-white w-8 h-8" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">Analyzing meeting context...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F4F6] flex flex-col animate-in fade-in duration-300 font-sans text-gray-800">
      
      {/* Header */}
      <header className="px-10 py-6 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
            <button onClick={onCancel} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm">
                <X size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Meeting Review</h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">AI Suggestions Ready</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-1.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</div>
                <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <button 
                onClick={handleFinish}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    pendingCount === 0 
                    ? 'bg-gray-900 text-white shadow-gray-300' 
                    : 'bg-white text-gray-300 border border-gray-100 cursor-not-allowed shadow-sm'
                }`}
                disabled={pendingCount > 0}
            >
                Apply Changes
            </button>
        </div>
      </header>

      {/* Main Content - Scrollable List of Cards */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {diffs.map((diff, index) => {
                const isActive = index === activeIndex;
                const isAccepted = diff.status === 'accepted';
                const isRejected = diff.status === 'rejected';

                return (
                    <div 
                        key={diff.id}
                        id={`diff-card-${index}`}
                        onClick={() => setActiveIndex(index)}
                        className={`
                            relative bg-white rounded-[2.5rem] transition-all duration-500 ease-out overflow-hidden
                            ${isActive ? 'ring-1 ring-indigo-500/20 shadow-soft-lg scale-[1.01] opacity-100 z-10' : 'shadow-card opacity-50 hover:opacity-90 scale-100 z-0'}
                            ${isAccepted ? 'ring-1 ring-emerald-500/20 bg-emerald-50/10' : ''}
                            ${isRejected ? 'ring-1 ring-rose-500/20 bg-rose-50/10' : ''}
                        `}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-8 right-8">
                            {isAccepted && <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"><Check size={14} strokeWidth={3} /> Accepted</div>}
                            {isRejected && <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-100/50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"><X size={14} strokeWidth={3} /> Rejected</div>}
                            {diff.status === 'pending' && <div className="text-gray-400 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">Pending Review</div>}
                        </div>

                        <div className="p-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                    <GitCommit size={20} />
                                </div>
                                {diff.fieldName}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Old Value */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Previous Value</label>
                                    <div className="p-6 bg-gray-50/50 rounded-3xl text-gray-500 text-sm leading-relaxed min-h-[140px] border border-transparent">
                                        {diff.oldValue}
                                    </div>
                                </div>

                                {/* New Value (Editable) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                        AI Suggestion <Edit3 size={12} />
                                    </label>
                                    <div className={`relative group transition-all rounded-3xl overflow-hidden ${isRejected ? 'opacity-50 grayscale' : 'shadow-inner-light'}`}>
                                        <textarea
                                            value={diff.newValue}
                                            onChange={(e) => handleUpdateNewValue(diff.id, e.target.value)}
                                            disabled={diff.status !== 'pending'}
                                            className={`
                                                w-full p-6 text-gray-900 text-sm leading-relaxed min-h-[140px] resize-none focus:outline-none transition-all
                                                ${diff.status === 'pending' 
                                                    ? 'bg-white border-2 border-indigo-50 focus:border-indigo-500/20 focus:bg-indigo-50/10' 
                                                    : 'bg-transparent border-2 border-transparent cursor-default'}
                                            `}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        {diff.status === 'pending' && (
                            <div className="bg-gray-50/50 border-t border-gray-100/50 p-6 flex items-center justify-end gap-4">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(diff.id, 'rejected'); }}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-rose-600 hover:shadow-card transition-all border border-transparent hover:border-gray-100"
                                >
                                    <X size={16} /> Reject
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(diff.id, 'accepted'); }}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all transform active:scale-95"
                                >
                                    <Check size={16} /> Accept Update
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </main>

      {/* Navigation Footer (Floating) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-2xl border border-white/50 rounded-full px-2 py-2 flex items-center gap-4 z-40 ring-1 ring-black/5">
        <button 
            onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 transition-colors disabled:opacity-30"
            disabled={activeIndex === 0}
        >
            <ArrowLeft size={20} />
        </button>
        <div className="h-4 w-[1px] bg-gray-200"></div>
        <span className="text-xs font-bold text-gray-900 font-mono w-12 text-center">
            {activeIndex + 1} / {diffs.length}
        </span>
        <div className="h-4 w-[1px] bg-gray-200"></div>
        <button 
            onClick={() => setActiveIndex(Math.min(diffs.length - 1, activeIndex + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 transition-colors disabled:opacity-30"
            disabled={activeIndex === diffs.length - 1}
        >
            <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
};