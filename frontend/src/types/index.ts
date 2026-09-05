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
  voice_match_score?: number;
}

export interface ToneAttributes {
  wit: number;
  formality: number;
  provocation: number;
  technical_depth: number;
  [key: string]: number;
}

export interface Persona {
  id: string;
  name: string;
  handle_or_tag?: string | null;
  bio?: string | null;
  archetype: 'founder' | 'explainer' | 'growth_hacker' | 'executive' | string;
  tone_attributes: ToneAttributes;
  banned_words: string[];
  sample_hooks: string[];
  target_audience: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  topic: string;
  tone: string;
  persona_id?: string | null;
  persona?: Persona | null;
  raw_content?: string;
  platform_content: Record<string, string>;
  thread_tweets?: string[];
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
  persona_id?: string | null;
  target_platforms: string[];
  is_thread?: boolean;
  content_format?: string;
}
