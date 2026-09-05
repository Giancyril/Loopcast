import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, type NavTab } from "./components/Layout/Sidebar";
import { ToastProvider, useToast } from "./components/Layout/ToastProvider";
import { ApprovalQueue } from "./components/ApprovalQueue/ApprovalQueue";
import { CalendarView } from "./components/Calendar/CalendarView";
import { AccountsView } from "./components/Accounts/AccountsView";
import { AnalyticsView } from "./components/Analytics/AnalyticsView";
import { VoiceStudio } from "./components/VoiceStudio/VoiceStudio";
import { SimulationLab } from "./components/Simulation/SimulationLab";
import { ComposerModal } from "./components/Composer/ComposerModal";
import { FeedbackModal } from "./components/ApprovalQueue/FeedbackModal";
import { ScheduleModal } from "./components/ApprovalQueue/ScheduleModal";
import { CopilotDrawer } from "./components/Copilot/CopilotDrawer";
import { api } from "./services/api";
import type { Post, PlatformConnection, GenerateParams, Persona } from "./types";

const AppInner: React.FC = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<NavTab>("queue");
  const [posts, setPosts] = useState<Post[]>([]);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [feedbackPost, setFeedbackPost] = useState<Post | null>(null);
  const [schedulePost, setSchedulePost] = useState<Post | null>(null);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);
  const [copilotState, setCopilotState] = useState<{
    isOpen: boolean;
    post: Post | null;
    text: string;
  }>({ isOpen: false, post: null, text: "" });

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.warn("Could not fetch posts:", err);
    }
  }, []);

  const fetchPlatforms = useCallback(async () => {
    try {
      const data = await api.getPlatforms();
      setPlatforms(data);
    } catch (err) {
      console.warn("Could not fetch platforms:", err);
    }
  }, []);

  const fetchPersonas = useCallback(async () => {
    try {
      const data = await api.getPersonas();
      setPersonas(data);
    } catch (err) {
      console.warn("Could not fetch personas:", err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchPlatforms();
    fetchPersonas();
    const interval = setInterval(fetchPosts, 8000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchPlatforms, fetchPersonas]);

  const handleGenerate = async (params: GenerateParams) => {
    setIsModalActionLoading(true);
    try {
      await api.generatePost(params);
      await fetchPosts();
      setIsComposerOpen(false);
      setCurrentTab("queue");
      toast("AI draft created! Review it in the Approval Queue.", "success");
    } catch (err) {
      toast("Failed to generate draft: " + String(err), "error");
    } finally {
      setIsModalActionLoading(false);
    }
  };

  const handleApprove = async (postId: string, scheduledFor?: string) => {
    setIsModalActionLoading(true);
    try {
      await api.approvePost(postId, scheduledFor);
      await fetchPosts();
      setSchedulePost(null);
      toast(
        scheduledFor
          ? `Post scheduled for ${new Date(scheduledFor).toLocaleString()}`
          : "Post scheduled for immediate publish.",
        "success"
      );
    } catch (err) {
      toast("Failed to schedule post: " + String(err), "error");
    } finally {
      setIsModalActionLoading(false);
    }
  };

  const handleRejectFeedback = async (postId: string, feedback: string) => {
    setIsModalActionLoading(true);
    try {
      await api.reviewPost(postId, "rejected", feedback);
      await fetchPosts();
      setFeedbackPost(null);
      toast("Feedback submitted. AI is regenerating revisions.", "info");
    } catch (err) {
      toast("Failed to submit feedback: " + String(err), "error");
    } finally {
      setIsModalActionLoading(false);
    }
  };

  const handleSaveEdit = async (
    postId: string,
    platformContent: Record<string, string>
  ) => {
    try {
      await api.updatePost(postId, { platform_content: platformContent });
      await fetchPosts();
      toast("Draft updated successfully.", "success");
    } catch (err) {
      toast("Could not save edit: " + String(err), "error");
    }
  };

  const handleRejectDirect = async (post: Post) => {
    setFeedbackPost(post);
  };

  const handlePublishNow = async (post: Post) => {
    try {
      await api.approvePost(post.id);
      await fetchPosts();
      toast("Publish triggered.", "success");
    } catch (err) {
      toast("Publish failed: " + String(err), "error");
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    try {
      await api.connectPlatform(platform);
      await fetchPlatforms();
      toast(`${platform} connected successfully.`, "success");
    } catch (err) {
      toast(`Could not connect: ${String(err)}`, "error");
    }
  };

  const handleDisconnectPlatform = async (platform: string) => {
    try {
      await api.disconnectPlatform(platform);
      await fetchPlatforms();
      toast(`${platform} disconnected.`, "info");
    } catch (err) {
      toast(`Could not disconnect: ${String(err)}`, "error");
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await api.triggerScheduler();
      await fetchPosts();
      toast("Scheduler sweep complete.", "info");
    } catch (err) {
      toast("Sync trigger failed: " + String(err), "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenCopilot = (post: Post, currentCopy: string) => {
    setCopilotState({ isOpen: true, post, text: currentCopy });
  };

  const handleApplyCopilot = (newText: string) => {
    if (copilotState.post) {
      const activePlat =
        Object.keys(copilotState.post.platform_content || {})[0] || "twitter";
      handleSaveEdit(copilotState.post.id, {
        ...(copilotState.post.platform_content || {}),
        [activePlat]: newText,
      });
      toast("Copilot refinement applied to draft!", "success");
    }
  };

  const handleUpdatePersona = async (id: string, updates: Partial<Persona>) => {
    await api.updatePersona(id, updates);
    await fetchPersonas();
  };

  const handleCreatePersona = async (newPersona: Partial<Persona>) => {
    await api.createPersona(newPersona);
    await fetchPersonas();
  };

  const handleDeletePersona = async (id: string) => {
    await api.deletePersona(id);
    await fetchPersonas();
  };

  const pendingCount = posts.filter((p) => p.status === "pending_approval").length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
        onOpenComposer={() => setIsComposerOpen(true)}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{scrollbarGutter: 'stable'}}>
        {currentTab === "queue" && (
          <ApprovalQueue
            posts={posts.filter((p) => p.status === "pending_approval")}
            onApprove={(post) => setSchedulePost(post)}
            onRequestFeedback={(post) => setFeedbackPost(post)}
            onSaveEdit={handleSaveEdit}
            onRejectDirect={handleRejectDirect}
            onOpenComposer={() => setIsComposerOpen(true)}
            onOpenCopilot={handleOpenCopilot}
          />
        )}

        {currentTab === "calendar" && (
          <CalendarView posts={posts} onPublishNow={handlePublishNow} />
        )}

        {currentTab === "personas" && (
          <VoiceStudio
            personas={personas}
            onUpdatePersona={handleUpdatePersona}
            onCreatePersona={handleCreatePersona}
            onDeletePersona={handleDeletePersona}
          />
        )}

        {currentTab === "simulation" && <SimulationLab />}

        {currentTab === "analytics" && <AnalyticsView posts={posts} />}

        {currentTab === "accounts" && (
          <AccountsView
            platforms={platforms}
            onConnect={handleConnectPlatform}
            onDisconnect={handleDisconnectPlatform}
          />
        )}
      </main>

      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isModalActionLoading}
        personas={personas}
      />

      <FeedbackModal
        isOpen={!!feedbackPost}
        onClose={() => setFeedbackPost(null)}
        onSubmit={(feedback: string) => feedbackPost && handleRejectFeedback(feedbackPost.id, feedback)}
        isSubmitting={isModalActionLoading}
      />

      <ScheduleModal
        isOpen={!!schedulePost}
        onClose={() => setSchedulePost(null)}
        onApprove={(scheduledFor?: string) => schedulePost && handleApprove(schedulePost.id, scheduledFor)}
        isSubmitting={isModalActionLoading}
      />

      <CopilotDrawer
        isOpen={copilotState.isOpen}
        onClose={() => setCopilotState((prev) => ({ ...prev, isOpen: false }))}
        originalText={copilotState.text}
        platform="twitter"
        onApplyRefinedText={handleApplyCopilot}
      />
    </div>
  );
};

export const App: React.FC = () => (
  <ToastProvider>
    <AppInner />
  </ToastProvider>
);

export default App;

