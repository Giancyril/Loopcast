import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ThreadEditorProps {
  tweets: string[];
  onChange: (tweets: string[]) => void;
  isEditable?: boolean;
}

export const ThreadEditor: React.FC<ThreadEditorProps> = ({
  tweets,
  onChange,
  isEditable = true,
}) => {
  const handleTweetChange = (index: number, val: string) => {
    const updated = [...tweets];
    updated[index] = val;
    onChange(updated);
  };

  const handleAddTweet = () => {
    const nextIdx = tweets.length + 1;
    onChange([...tweets, `${nextIdx}/${nextIdx} `]);
  };

  const handleDeleteTweet = (index: number) => {
    if (tweets.length <= 1) return;
    const updated = tweets.filter((_, i) => i !== index);
    // Re-index numbering
    const reindexed = updated.map((t, i) => {
      return t.replace(/^\d+\/\d+\s*/, `${i + 1}/${updated.length} `);
    });
    onChange(reindexed);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= tweets.length) return;
    const updated = [...tweets];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-index numbering
    const reindexed = updated.map((t, i) => {
      return t.replace(/^\d+\/\d+\s*/, `${i + 1}/${updated.length} `);
    });
    onChange(reindexed);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-sky-500" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Sequential Twitter/X Thread ({tweets.length} Tweets)
          </h4>
        </div>
        {isEditable && (
          <button
            type="button"
            onClick={handleAddTweet}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Tweet</span>
          </button>
        )}
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-200">
        {tweets.map((tweetText, idx) => {
          const charCount = tweetText.length;
          const isOver = charCount > 280;
          const isWarning = charCount > 250 && !isOver;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white shadow-2xs">
                {idx + 1}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {idx === 0 ? "Opening Hook" : idx === tweets.length - 1 ? "Closing CTA" : `Point ${idx}`}
                  </span>

                  {isEditable && (
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < tweets.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                      {tweets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTweet(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer ml-1"
                          title="Delete tweet"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditable ? (
                  <textarea
                    rows={3}
                    value={tweetText}
                    onChange={(e) => handleTweetChange(idx, e.target.value)}
                    className={`w-full text-xs p-2.5 rounded-lg border outline-none resize-none transition-colors ${
                      isOver
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-sky-500 text-slate-800'
                    }`}
                  />
                ) : (
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {tweetText}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 text-[10px]">
                  <span className="flex items-center gap-1">
                    {isOver ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Exceeds 280 limit by {charCount - 280}
                      </span>
                    ) : isWarning ? (
                      <span className="text-amber-600 font-semibold">Near limit</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Good length
                      </span>
                    )}
                  </span>
                  <span className={`font-mono font-medium ${isOver ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-600' : 'text-slate-400'}`}>
                    {charCount} / 280
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};