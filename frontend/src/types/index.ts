export type PostStatus = 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'failed';

export interface ApprovalLog {
  id: string;
  action: string;
  reviewer_feedback?: string | null;
  created_at: string;
}

export interface Critique {
  score?: number;
  passed?: boolean;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string;
}

export interface Post {
  id: string;
  topic: string;
  tone: string;
  raw_content?: string;
  platform_content: Record<string, string>;
  status: PostStatus;
  critique: Critique;
  thread_id?: string;
  scheduled_for?: string | null;
  published_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  logs: ApprovalLog[];
}

export interface PlatformConnection {
  platform: 'twitter' | 'linkedin' | string;
  name: string;
  description: string;
  is_connected: boolean;
  account_handle: string;
  account_name: string;
  updated_at?: string | null;
}

export interface GenerateParams {
  topic: string;
  tone: string;
  target_platforms: string[];
}
