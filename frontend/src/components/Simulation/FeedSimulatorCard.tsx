import React, { useState } from 'react';
import { Heart, Repeat, MessageCircle, Bookmark, BarChart2, Share, CheckCircle2, Globe, MoreHorizontal } from 'lucide-react';

interface FeedSimulatorCardProps {
  platform: 'twitter' | 'linkedin';
  authorName?: string;
  authorHandle?: string;
  authorTitle?: string;
  avatarUrl?: string;
  content: string;
  predictedLikes?: number;
  predictedShares?: number;
  predictedComments?: number;
  predictedViews?: number;
}

export const FeedSimulatorCard: React.FC<FeedSimulatorCardProps> = ({
  platform,
  authorName = 'Alex Rivera',
  authorHandle = '@alexrivera_ai',
  authorTitle = 'Founder & AI Architect @ Loopcast | Building the future of social automation',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  content,
  predictedLikes = 342,
  predictedShares = 89,
  predictedComments = 45,
  predictedViews = 14200,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(predictedLikes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => (liked ? prev - 1 : prev + 1));
  };

  if (platform === 'twitter') {
    return (
      <div className="bg-black text-white rounded-2xl p-4 border border-zinc-800 max-w-md w-full font-sans shadow-xl">
        <div className="flex gap-3">
          <img
            src={avatarUrl}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-700"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-sm text-zinc-100 truncate">{authorName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400 shrink-0" />
                <span className="text-xs text-zinc-400 truncate">{authorHandle}</span>
                <span className="text-xs text-zinc-500">· 2h</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-zinc-500 cursor-pointer" />
            </div>

            {/* Content */}
            <div className="mt-2 text-sm text-zinc-200 leading-relaxed whitespace-pre-line break-words font-normal">
              {content}
            </div>

            {/* Engagement metrics */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800 text-zinc-400 text-xs">
              <button className="flex items-center gap-1.5 hover:text-sky-400 transition-colors cursor-pointer group">
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{predictedComments}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer group">
                <Repeat className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{predictedShares}</span>
              </button>
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer group ${
                  liked ? 'text-rose-500' : 'hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 group-hover:scale-110 transition-transform ${liked ? 'fill-rose-500' : ''}`} />
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-1.5 hover:text-sky-400 transition-colors">
                <BarChart2 className="w-4 h-4" />
                <span>{predictedViews.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 hover:text-sky-400 transition-colors cursor-pointer" />
                <Share className="w-4 h-4 hover:text-sky-400 transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LinkedIn
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 max-w-md w-full font-sans shadow-lg text-slate-900">
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={authorName}
          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-slate-900">{authorName}</span>
                <span className="text-[10px] text-slate-400 font-medium">· 1st</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">{authorTitle}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                <span>3h</span>
                <span>·</span>
                <Globe className="w-2.5 h-2.5 text-slate-400" />
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Post body */}
      <div className="mt-3 text-xs text-slate-800 leading-relaxed whitespace-pre-line break-words">
        {content}
      </div>

      {/* Social counters */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center font-bold">👍</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">❤️</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-[9px] text-white flex items-center justify-center font-bold">💡</span>
          </div>
          <span className="ml-1 font-medium text-slate-600">{likesCount}</span>
        </div>
        <div className="flex gap-2">
          <span>{predictedComments} comments</span>
          <span>·</span>
          <span>{predictedShares} reposts</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-1 pt-1 text-[11px] font-semibold text-slate-600">
        <button
          onClick={toggleLike}
          className={`flex items-center justify-center gap-1 py-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors ${
            liked ? 'text-blue-600' : ''
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-blue-600 text-blue-600' : ''}`} />
          Like
        </button>
        <button className="flex items-center justify-center gap-1 py-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Comment
        </button>
        <button className="flex items-center justify-center gap-1 py-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors">
          <Repeat className="w-3.5 h-3.5" />
          Repost
        </button>
        <button className="flex items-center justify-center gap-1 py-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors">
          <Share className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </div>
  );
};
