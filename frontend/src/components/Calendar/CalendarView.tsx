import React, { useState } from 'react';
import type { Post } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Send,
  TrendingUp,
  } from 'lucide-react';
import { BestTimeHeatmap } from '../Scheduler/BestTimeHeatmap';

interface CalendarViewProps {
  posts: Post[];
  onPublishNow: (post: Post) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ posts, onPublishNow }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

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
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Publishing Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of queued, scheduled, and published social updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showHeatmap
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showHeatmap ? 'Hide Audience Heatmap' : 'Show Audience Heatmap'}</span>
          </button>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {calendarPosts.length} Items Queued
          </span>
        </div>
      </div>

      {/* Audience Engagement Heatmap Accordion */}
      {showHeatmap && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <BestTimeHeatmap />
        </div>
      )}

      {calendarPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">No scheduled or published posts found</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Approved drafts will appear here on their target dispatch date.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(postsByDate).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{date}</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(post => {
                  const platforms = Object.keys(post.platform_content || {});
                  const isPublished = post.status === 'published';

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`p-4 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isPublished ? 'border-slate-200' : 'border-indigo-100 ring-1 ring-indigo-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1">
                            {platforms.map(p => (
                              <span
                                key={p}
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  p === 'twitter' ? 'bg-slate-900 text-white' : 'bg-[#0a66c2] text-white'
                                }`}
                              >
                                {p === 'twitter' ? 'X' : 'In'}
                              </span>
                            ))}
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {post.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                          {post.topic}
                        </h4>

                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                          {post.platform_content?.twitter || post.platform_content?.linkedin || 'Post content'}
                        </p>
                      </div>

                      {!isPublished && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
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

