import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, type NavTab } from "./components/Layout/Sidebar";
import { ToastProvider, useToast } from "./components/Layout/ToastProvider";
import { ApprovalQueue } from "./components/ApprovalQueue/ApprovalQueue";
import { CalendarView } from "./components/Calendar/CalendarView";
import { AccountsView } from "./components/Accounts/AccountsView";
import { AnalyticsView } from "./components/Analytics/AnalyticsView";
import { ComposerModal } from "./components/Composer/ComposerModal";
import { FeedbackModal } from "./components/ApprovalQueue/FeedbackModal";
import { ScheduleModal } from "./components/ApprovalQueue/ScheduleModal";
import { api } from "./services/api";
import type { Post, PlatformConnection, GenerateParams } from "./types";

const AppInner: React.FC = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<NavTab>("queue");
  const [posts, setPosts] = useState<Post[]>([]);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [feedbackPost, setFeedbackPost] = useState<Post | null>(null);
  const [schedulePost, setSchedulePost] = useState<Post | null>(null);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try { const data = await api.getPosts(); setPosts(data); }
    catch (err) { console.warn("Could not fetch posts:", err); }
  }, []);

  const fetchPlatforms = useCallback(async () => {
    try { const data = await api.getPlatforms(); setPlatforms(data); }
    catch (err) { console.warn("Could not fetch platforms:", err); }
  }, []);

  useEffect(() => {
    fetchPosts(); fetchPlatforms();
    const interval = setInterval(fetchPosts, 8000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchPlatforms]);

  const handleGenerate = async (params: GenerateParams) => {
    setIsModalActionLoading(true);
    try {
      await api.generatePost(params); await fetchPosts();
      setIsComposerOpen(false); setCurrentTab("queue");
      toast("AI draft created! Review it in the Approval Queue.", "success");
    } catch (err) { toast("Generation failed: " + String(err), "error"); }
    finally { setIsModalActionLoading(false); }
  };

  const handleApprove = async (scheduledFor?: string) => {
    if (!schedulePost) return;
    setIsModalActionLoading(true);
    try {
      await api.approvePost(schedulePost.id, scheduledFor); await fetchPosts(); setSchedulePost(null);
      toast(scheduledFor ? "Post approved and scheduled." : "Post approved for immediate publishing.", "success");
    } catch (err) { toast("Approval failed: " + String(err), "error"); }
    finally { setIsModalActionLoading(false); }
  };

  const handleRejectFeedback = async (feedback: string) => {
    if (!feedbackPost) return;
    setIsModalActionLoading(true);
    try {
      await api.rejectPost(feedbackPost.id, feedback); await fetchPosts(); setFeedbackPost(null);
      toast("Feedback sent. AI agent is regenerating the draft.", "info");
    } catch (err) { toast("Could not send feedback: " + String(err), "error"); }
    finally { setIsModalActionLoading(false); }
  };

  const handleRejectDirect = async (post: Post) => {
    if (!confirm(`Discard draft for "${post.topic}"?`)) return;
    try {
      await api.rejectPost(post.id, "Discarded without feedback"); await fetchPosts();
      toast("Draft discarded.", "warning");
    } catch (err) { toast("Discard error: " + String(err), "error"); }
  };

  const handleSaveEdit = async (postId: string, platformContent: Record<string, string>) => {
    try { await api.editPost(postId, platformContent); await fetchPosts(); toast("Edits saved.", "success"); }
    catch (err) { toast("Save failed: " + String(err), "error"); }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try { await api.triggerScheduler(); await fetchPosts(); toast("Scheduler triggered.", "info"); }
    catch (err) { console.warn("Sync failed:", err); }
    finally { setIsSyncing(false); }
  };

  const handleConnect = async (platform: string) => {
    try { await api.connectPlatform(platform); await fetchPlatforms(); toast(`${platform} account connected.`, "success"); }
    catch (err) { toast("Connect error: " + String(err), "error"); }
  };

  const handleDisconnect = async (platform: string) => {
    try { await api.disconnectPlatform(platform); await fetchPlatforms(); toast(`${platform} disconnected.`, "warning"); }
    catch (err) { toast("Disconnect error: " + String(err), "error"); }
  };

  const pendingPosts = posts.filter((p) => p.status === "pending_approval");

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} pendingCount={pendingPosts.length}
        onOpenComposer={() => setIsComposerOpen(true)} onTriggerSync={handleTriggerSync} isSyncing={isSyncing} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {currentTab === "queue" && <ApprovalQueue posts={pendingPosts} onApprove={(post) => setSchedulePost(post)}
          onRequestFeedback={(post) => setFeedbackPost(post)} onSaveEdit={handleSaveEdit}
          onRejectDirect={handleRejectDirect} onOpenComposer={() => setIsComposerOpen(true)} />}
        {currentTab === "calendar" && <CalendarView posts={posts} onPublishNow={async (post) => {
          await api.approvePost(post.id, undefined); await handleTriggerSync(); }} />}
        {currentTab === "analytics" && <AnalyticsView posts={posts} />}
        {currentTab === "accounts" && <AccountsView platforms={platforms} onConnect={handleConnect} onDisconnect={handleDisconnect} />}
      </main>
      <ComposerModal isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} onGenerate={handleGenerate} isGenerating={isModalActionLoading} />
      <FeedbackModal isOpen={!!feedbackPost} onClose={() => setFeedbackPost(null)} onSubmit={handleRejectFeedback} isSubmitting={isModalActionLoading} />
      <ScheduleModal isOpen={!!schedulePost} onClose={() => setSchedulePost(null)} onApprove={handleApprove} isSubmitting={isModalActionLoading} />
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider><AppInner /></ToastProvider>
);

export default App;