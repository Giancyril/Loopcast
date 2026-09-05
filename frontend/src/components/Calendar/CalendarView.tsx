import React, { useState } from 'react';
import type { Post } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Send
} from 'lucide-react';

interface CalendarViewProps {
  posts: Post[];
  onPublishNow: (post: Post) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ posts, onPublishNow }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Filter scheduled and published posts
  const calendarPosts = posts.filter(
    p => p.status === 'scheduled' || p.status === 'published'
  );

  // Group by date
  const postsByDate: Record<string, Post[]> = {};
  calendarPosts.forEach(post => {
    const targetDate = post.scheduled_for || post.published_at || post.created_at;
    const dateKey = new Date(targetDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    if (!postsByDate[dateKey]) postsByDate[dateKey] = [];
    postsByDate[dateKey].push(post);
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Publishing Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buffer-style chronological view of scheduled releases and published broadcasts.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Scheduled ({calendarPosts.filter(p => p.status === 'scheduled').length})</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Published ({calendarPosts.filter(p => p.status === 'published').length})</span>
          </span>
        </div>
      </div>

      {calendarPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto mt-10">
          <CalendarIcon className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">No Posts Scheduled Yet</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Approved posts with future timestamps will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(postsByDate).map(([dateLabel, dayPosts]) => (
            <div key={dateLabel} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 font-semibold text-xs text-slate-700">
                {dateLabel}
              </div>

              <div className="p-3 space-y-3">
                {dayPosts.map(post => {
                  const isPublished = post.status === 'published';
                  const platforms = Object.keys(post.platform_content || {});

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-3 rounded-lg border border-slate-150 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer bg-white"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1">
                          {platforms.map(p => (
                            <span
                              key={p}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white uppercase ${
                                p === 'twitter' ? 'bg-slate-900' : 'bg-[#0a66c2]'
                              }`}
                            >
                              {p === 'twitter' ? 'X' : 'LI'}
                            </span>
                          ))}
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>

                      <h4 className="font-medium text-xs text-slate-900 line-clamp-1 mb-1">
                        {post.topic}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {post.raw_content || Object.values(post.platform_content)[0]}
                      </p>

                      {!isPublished && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {post.scheduled_for ? new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Immediate'}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPublishNow(post);
                            }}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Publish Now</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Post Details</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedPost.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {Object.entries(selectedPost.platform_content || {}).map(([platform, text]) => (
                <div key={platform} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                  <div className="font-semibold text-[11px] text-slate-700 mb-1.5 capitalize flex items-center justify-between">
                    <span>{platform === 'twitter' ? 'X (Twitter)' : platform} Preview</span>
                    <span className="text-slate-400 font-mono text-[10px]">{text.length} chars</span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
