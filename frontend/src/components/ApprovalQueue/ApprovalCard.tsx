import React, { useState } from 'react';
import type { Post } from '../../types';
import { 
  Check, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles, 
  ShieldCheck,
  Eye,
  Clock,
  Zap,
  Layers,
  FileText
} from 'lucide-react';
import { FeedSimulatorCard } from '../Simulation/FeedSimulatorCard';
import { LinkedInCarousel } from '../Composer/LinkedInCarousel';
import { ThreadEditor } from '../Composer/ThreadEditor';

interface ApprovalCardProps {
  post: Post;
  onApprove: (post: Post) => void;
  onRequestFeedback: (post: Post) => void;
  onSaveEdit: (postId: string, platformContent: Record<string, string>) => void;
  onRejectDirect: (post: Post) => void;
  onOpenCopilot?: (post: Post, currentCopy: string) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  post,
  onApprove,
  onRequestFeedback,
  onSaveEdit,
  onRejectDirect,
  onOpenCopilot,
}) => {
  const platforms = Object.keys(post.platform_content || {});
  const [activePlatform, setActivePlatform] = useState<string>(platforms[0] || 'twitter');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, string>>(post.platform_content || {});
  const [showCritique, setShowCritique] = useState(false);
  const [showFeedSim, setShowFeedSim] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'thread' | 'carousel'>('standard');

  const currentText = editedContent[activePlatform] || '';
  const charLimit = activePlatform === 'twitter' ? 280 : 3000;
  const isOverLimit = currentText.length > charLimit;
  const score = post.critique?.score ?? 85;

  const handleTextChange = (val: string) => {
    setEditedContent(prev => ({
      ...prev,
      [activePlatform]: val
    }));
  };

  const handleSave = () => {
    onSaveEdit(post.id, editedContent);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
          <span className="font-semibold text-xs text-slate-900 tracking-tight">
            {post.topic}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
            {post.tone}
          </span>
          <span className="flex items-center space-x-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>AI Score: {score}/100</span>
          </span>

          {/* Predictive Best Time Chip */}
          <span className="flex items-center space-x-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span>Peak Time: Tue 12:00 UTC</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFeedSim(!showFeedSim)}
            className={`text-[11px] font-medium flex items-center space-x-1 cursor-pointer transition-colors ${
              showFeedSim ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showFeedSim ? 'Exit Preview' : 'Feed Simulator'}</span>
          </button>

          <button
            onClick={() => setShowCritique(!showCritique)}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showCritique ? 'Hide Critique' : 'Critique'}</span>
          </button>
        </div>
      </div>

      {/* Feed Simulator Preview Drawer */}
      {showFeedSim && (
        <div className="p-4 bg-slate-900/5 border-b border-slate-200 flex justify-center animate-in fade-in duration-200">
          <FeedSimulatorCard
            platform={activePlatform === 'twitter' ? 'twitter' : 'linkedin'}
            content={currentText}
            predictedLikes={activePlatform === 'twitter' ? 342 : 185}
            predictedShares={activePlatform === 'twitter' ? 78 : 42}
            predictedComments={activePlatform === 'twitter' ? 36 : 24}
            predictedViews={activePlatform === 'twitter' ? 12400 : 8600}
          />
        </div>
      )}

      {/* Expandable Critique Details */}
      {showCritique && post.critique && (
        <div className="px-5 py-3 bg-indigo-50/40 border-b border-indigo-100/60 text-xs animate-in fade-in duration-150">
          <p className="font-semibold text-indigo-950 text-[11px] mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Self-Critique Engine Findings:
          </p>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="font-medium text-slate-500">Strengths:</span>
              <ul className="list-disc list-inside text-emerald-800 space-y-0.5 mt-0.5">
                {(post.critique.strengths || ['Strong opening hook', 'Authentic tone']).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium text-slate-500">Observations:</span>
              <p className="text-slate-600 mt-0.5">
                {post.critique.recommendations || 'Ready for scheduled publication.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Switcher & Format View Mode Tabs */}
      <div className="px-5 pt-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                activePlatform === p
                  ? p === 'twitter'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-[#0a66c2] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'twitter' ? 'X (Twitter)' : p}
            </button>
          ))}
        </div>

        {/* View Mode Switcher (Thread / Carousel / Standard) */}
        <div className="flex items-center space-x-2">
          {post.is_thread && activePlatform === 'twitter' && (
            <button
              onClick={() => setViewMode(viewMode === 'thread' ? 'standard' : 'thread')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border ${
                viewMode === 'thread'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3 h-3" />
              Thread View ({post.thread_tweets?.length || 0})
            </button>
          )}

          {post.carousel_slides && post.carousel_slides.length > 0 && activePlatform === 'linkedin' && (
            <button
              onClick={() => setViewMode(viewMode === 'carousel' ? 'standard' : 'carousel')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border ${
                viewMode === 'carousel'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3 h-3" />
              Carousel Slides ({post.carousel_slides.length})
            </button>
          )}

          {/* Character count gauge */}
          <span className={`text-[11px] font-mono ${isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
            {currentText.length} / {charLimit}
          </span>
        </div>
      </div>

      {/* Content Body / Editor / Thread / Carousel */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {viewMode === 'thread' && post.thread_tweets ? (
          <div className="mb-3">
            <ThreadEditor
              initialTweets={post.thread_tweets}
              onSave={(updatedTweets) => {
                const combined = updatedTweets.join('\n\n---\n\n');
                handleTextChange(combined);
              }}
            />
          </div>
        ) : viewMode === 'carousel' && post.carousel_slides ? (
          <div className="mb-3">
            <LinkedInCarousel slides={post.carousel_slides} topic={post.topic} />
          </div>
        ) : isEditing ? (
          <textarea
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={6}
            className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans leading-relaxed resize-none"
          />
        ) : (
          <div className="bg-slate-50/70 border border-slate-150 rounded-lg p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
            {currentText || <span className="text-slate-400 italic">No copy generated for this platform</span>}
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Edit</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Copy</span>
              </button>
            )}

            {onOpenCopilot && (
              <button
                onClick={() => onOpenCopilot(post, currentText)}
                className="flex items-center space-x-1 px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Copilot</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRequestFeedback(post)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Request Changes</span>
            </button>

            <button
              onClick={() => onRejectDirect(post)}
              className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs rounded-lg transition-colors cursor-pointer"
              title="Reject & Discard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onApprove(post)}
              disabled={isOverLimit}
              className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
