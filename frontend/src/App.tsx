import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, type NavTab } from './components/Layout/Sidebar';
import { ApprovalQueue } from './components/ApprovalQueue/ApprovalQueue';
import { CalendarView } from './components/Calendar/CalendarView';
import { AccountsView } from './components/Accounts/AccountsView';
import { ComposerModal } from './components/Composer/ComposerModal';
import { FeedbackModal } from './components/ApprovalQueue/FeedbackModal';
import { ScheduleModal } from './components/ApprovalQueue/ScheduleModal';
import { api } from './services/api';
import type { Post, PlatformConnection, GenerateParams } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('queue');
  const [posts, setPosts] = useState<Post[]>([]);
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [feedbackPost, setFeedbackPost] = useState<Post | null>(null);
  const [schedulePost, setSchedulePost] = useState<Post | null>(null);
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.warn('Could not fetch posts:', err);
    }
  }, []);

  const fetchPlatforms = useCallback(async () => {
    try {
      const data = await api.getPlatforms();
      setPlatforms(data);
    } catch (err) {
      console.warn('Could not fetch platforms:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchPlatforms();
    const interval = setInterval(fetchPosts, 8000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchPlatforms]);

  // Actions
  const handleGenerate = async (params: GenerateParams) => {
    setIsModalActionLoading(true);
    try {
      await api.generatePost(params);
      await fetchPosts();
      setIsComposerOpen(false);
      setCurrentTab('queue');
    } catch (err) {
      alert('Generation error: ' + String(err));
    } finally {
      setIsModalActionLoading(false);
    }
  };

  const handleApprove = async (scheduledFor?: string) => {
    if (!schedulePost) return;
    setIsModalActionLoading(true);
    try {
      await api.approvePost(schedulePost.id, scheduledFor);
      await fetchPosts();
      setSchedulePost(null);
    } catch (err) {
      alert('Approval error: ' + String(err));
    } finally {
      setIsModalActionLoading(false);
    }
  };

  const handleRejectFeedback = async (feedback: string) => {
    if (!feedbackPost) return;
    setIsModalActionLoading(true);
    try {
      await api.rejectPost(feedbackPost.id, feedback);
      await fetchPosts();
      setFeedbackPost(null);
    } catch (err) {
      alert('Rejection feedback error: ' + String(err));
    } finally {
      setIsModalActionLoading(false);
    }
  };

  const handleRejectDirect = async (post: Post) => {
    if (!confirm(`Discard draft for "${post.topic}"?`)) return;
    try {
      await api.rejectPost(post.id, 'Discarded without feedback');
      await fetchPosts();
    } catch (err) {
      alert('Discard error: ' + String(err));
    }
  };

  const handleSaveEdit = async (postId: string, platformContent: Record<string, string>) => {
    try {
      await api.editPost(postId, platformContent);
      await fetchPosts();
    } catch (err) {
      alert('Save edit error: ' + String(err));
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await api.triggerScheduler();
      await fetchPosts();
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      await api.connectPlatform(platform);
      await fetchPlatforms();
    } catch (err) {
      alert('Connect error: ' + String(err));
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      await api.disconnectPlatform(platform);
      await fetchPlatforms();
    } catch (err) {
      alert('Disconnect error: ' + String(err));
    }
  };

  const pendingPosts = posts.filter(p => p.status === 'pending_approval');

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingPosts.length}
        onOpenComposer={() => setIsComposerOpen(true)}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {currentTab === 'queue' && (
          <ApprovalQueue
            posts={pendingPosts}
            onApprove={(post) => setSchedulePost(post)}
            onRequestFeedback={(post) => setFeedbackPost(post)}
            onSaveEdit={handleSaveEdit}
            onRejectDirect={handleRejectDirect}
            onOpenComposer={() => setIsComposerOpen(true)}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            posts={posts}
            onPublishNow={async (post) => {
              await api.approvePost(post.id, undefined);
              await handleTriggerSync();
            }}
          />
        )}

        {currentTab === 'accounts' && (
          <AccountsView
            platforms={platforms}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        )}
      </main>

      {/* Composer Modal */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isModalActionLoading}
      />

      {/* Rejection Feedback Modal */}
      <FeedbackModal
        isOpen={!!feedbackPost}
        onClose={() => setFeedbackPost(null)}
        onSubmit={handleRejectFeedback}
        isSubmitting={isModalActionLoading}
      />

      {/* Approval & Schedule Modal */}
      <ScheduleModal
        isOpen={!!schedulePost}
        onClose={() => setSchedulePost(null)}
        onApprove={handleApprove}
        isSubmitting={isModalActionLoading}
      />
    </div>
  );
};

export default App;
