import React, { useState } from 'react';
import type { Post } from '../../types';
import { ApprovalCard } from './ApprovalCard';
import { CheckCircle2, Inbox } from 'lucide-react';

interface ApprovalQueueProps {
  posts: Post[];
  onApprove: (post: Post) => void;
  onRequestFeedback: (post: Post) => void;
  onSaveEdit: (postId: string, platformContent: Record<string, string>) => void;
  onRejectDirect: (post: Post) => void;
  onOpenComposer: () => void;
  onOpenCopilot?: (post: Post, currentCopy: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  posts,
  onApprove,
  onRequestFeedback,
  onSaveEdit,
  onRejectDirect,
  onOpenComposer,
  onOpenCopilot,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'twitter' | 'linkedin'>('all');

  const filteredPosts = posts.filter(p => {
    if (platformFilter === 'all') return true;
    return platformFilter in (p.platform_content || {});
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      {/* View Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-600" />
            <span>Approval Queue</span>
            {posts.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {posts.length} pending review
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, refine, or request AI revisions before content is published to connected social networks.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${platformFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            All Platforms
          </button>
          <button
            onClick={() => setPlatformFilter('twitter')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${platformFilter === 'twitter'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            X (Twitter)
          </button>
          <button
            onClick={() => setPlatformFilter('linkedin')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${platformFilter === 'linkedin'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Cards List or Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-lg mx-auto mt-10">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            All Caught Up!
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
            There are no posts waiting for human approval right now. Use the AI agent to draft your next batch.
          </p>
          <button
            onClick={onOpenComposer}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >

            <span>Generate New Post</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <ApprovalCard
              key={post.id}
              post={post}
              onApprove={onApprove}
              onRequestFeedback={onRequestFeedback}
              onSaveEdit={onSaveEdit}
              onRejectDirect={onRejectDirect}
              onOpenCopilot={onOpenCopilot}
            />
          ))}
        </div>
      )}
    </div>
  );
};

