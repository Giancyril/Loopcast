import React, { useMemo } from "react";
import type { Post } from "../../types";
import {
  BarChart2,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Send,
  Calendar,
} from "lucide-react";

interface AnalyticsViewProps {
  posts: Post[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<{ className?: string }>;
  accent: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, accent }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-start gap-4 card-hover">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ posts }) => {
  const stats = useMemo(() => {
    const total     = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const failed    = posts.filter((p) => p.status === "failed").length;
    const pending   = posts.filter((p) => p.status === "pending_approval").length;
    const avgScore  = posts.reduce((acc, p) => acc + (p.critique?.score ?? 0), 0) / (total || 1);
    const twitterPosts  = posts.filter((p) => "twitter"  in (p.platform_content || {})).length;
    const linkedinPosts = posts.filter((p) => "linkedin" in (p.platform_content || {})).length;
    const successRate   = total > 0 ? Math.round((published / total) * 100) : 0;
    return { total, published, scheduled, failed, pending, avgScore, twitterPosts, linkedinPosts, successRate };
  }, [posts]);

  const activityFeed = useMemo(
    () =>
      posts
        .filter((p) => ["published", "scheduled", "failed"].includes(p.status))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [posts]
  );

  const PLATFORM_COLORS: Record<string, string> = {
    twitter:  "bg-slate-900 text-white",
    linkedin: "bg-[#0a66c2] text-white",
  };
  const PLATFORM_ABBR: Record<string, string> = {
    twitter: "X",
    linkedin: "LI",
  };
  const STATUS_STYLES: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    scheduled: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    failed:    "bg-rose-50 text-rose-700 border border-rose-200",
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          <span>Analytics &amp; Activity</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Performance overview of content generated, reviewed, and published through the AI agent pipeline.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Generated" value={stats.total}  sub="All time drafts"   icon={Sparkles}     accent="bg-indigo-50 text-indigo-600" />
        <StatCard label="Published"        value={stats.published} sub={`${stats.successRate}% success rate`} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Scheduled"        value={stats.scheduled} sub="Queued for release" icon={Clock}    accent="bg-amber-50 text-amber-600"   />
        <StatCard label="Avg AI Score"     value={`${Math.round(stats.avgScore)}/100`}  sub="Self-critique rating" icon={TrendingUp} accent="bg-violet-50 text-violet-600" />
      </div>

      {/* Platform breakdown row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* X */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center font-bold text-white text-xs">X</div>
            <span className="text-xs font-semibold text-slate-900">X (Twitter) Posts</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{stats.twitterPosts}</p>
          <p className="text-[11px] text-slate-400 mb-3">
            {stats.total > 0 ? Math.round((stats.twitterPosts / stats.total) * 100) : 0}% of all content
          </p>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-slate-800 rounded-full transition-all duration-700"
              style={{ width: `${stats.total > 0 ? (stats.twitterPosts / stats.total) * 100 : 0}%` }} />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-[#0a66c2] flex items-center justify-center font-bold text-white text-xs">in</div>
            <span className="text-xs font-semibold text-slate-900">LinkedIn Posts</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{stats.linkedinPosts}</p>
          <p className="text-[11px] text-slate-400 mb-3">
            {stats.total > 0 ? Math.round((stats.linkedinPosts / stats.total) * 100) : 0}% of all content
          </p>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#0a66c2] rounded-full transition-all duration-700"
              style={{ width: `${stats.total > 0 ? (stats.linkedinPosts / stats.total) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md bg-violet-50 flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <span className="text-xs font-semibold text-slate-900">Status Breakdown</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Published", count: stats.published, color: "bg-emerald-500" },
              { label: "Scheduled", count: stats.scheduled, color: "bg-indigo-500"  },
              { label: "Pending",   count: stats.pending,   color: "bg-amber-400"   },
              { label: "Failed",    count: stats.failed,    color: "bg-rose-500"    },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2 text-[11px]">
                <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                <span className="text-slate-600 flex-1">{label}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" />
          Activity Feed
        </h3>

        {activityFeed.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs flex flex-col items-center">
            <Calendar className="w-9 h-9 text-slate-300 mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 mb-1">No activity yet</h4>
            <p className="text-xs text-slate-500">Approve and schedule a post to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activityFeed.map((post) => {
              const platforms   = Object.keys(post.platform_content || {});
              const statusStyle = STATUS_STYLES[post.status] ?? "bg-slate-100 text-slate-600";
              const dateStr     = new Date(post.updated_at).toLocaleString("en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              });
              return (
                <div key={post.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-start gap-4 card-hover animate-slide-up">
                  <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                    {platforms.map((p) => (
                      <span key={p}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] ?? "bg-slate-200 text-slate-700"}`}>
                        {PLATFORM_ABBR[p] ?? p.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-900 line-clamp-1">{post.topic}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${statusStyle}`}>
                        {post.status === "published" ? "? Published" : post.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {Object.values(post.platform_content)[0]}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />{dateStr}
                      </span>
                      {post.critique?.score != null && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          AI Score: {post.critique.score}/100
                        </span>
                      )}
                      {post.error_message && (
                        <span className="flex items-center gap-1 text-rose-500">
                          <XCircle className="w-3 h-3" />{post.error_message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
