import type { Post, PlatformConnection, GenerateParams } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getPosts(status?: string): Promise<Post[]> {
    const url = status ? `${API_BASE}/posts?status=${status}` : `${API_BASE}/posts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
    return res.json();
  },

  async generatePost(params: GenerateParams): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Generation failed: ${res.statusText}`);
    return res.json();
  },

  async approvePost(id: string, scheduledFor?: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_for: scheduledFor || null }),
    });
    if (!res.ok) throw new Error(`Approval failed: ${res.statusText}`);
    return res.json();
  },

  async rejectPost(id: string, feedback: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });
    if (!res.ok) throw new Error(`Rejection feedback failed: ${res.statusText}`);
    return res.json();
  },

  async editPost(id: string, platformContent: Record<string, string>): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_content: platformContent }),
    });
    if (!res.ok) throw new Error(`Edit failed: ${res.statusText}`);
    return res.json();
  },

  async getPlatforms(): Promise<PlatformConnection[]> {
    const res = await fetch(`${API_BASE}/platforms`);
    if (!res.ok) throw new Error(`Failed to fetch platforms: ${res.statusText}`);
    return res.json();
  },

  async connectPlatform(platform: string): Promise<any> {
    const res = await fetch(`${API_BASE}/platforms/${platform}/connect`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Connection failed: ${res.statusText}`);
    return res.json();
  },

  async disconnectPlatform(platform: string): Promise<any> {
    const res = await fetch(`${API_BASE}/platforms/${platform}/disconnect`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Disconnect failed: ${res.statusText}`);
    return res.json();
  },

  async triggerScheduler(): Promise<any> {
    const res = await fetch(`${API_BASE}/scheduler/run-now`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Scheduler trigger failed: ${res.statusText}`);
    return res.json();
  },
};
