export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';
export type EngineMode = 'studio' | 'veo-cloud';

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  resolution: Resolution;
  model: string;
  engineMode: EngineMode;
  prompt: string;
  userQuote: string;
  stylePreset: string;
}

export interface GeneratedVideoItem {
  id: string;
  operationName: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  model: string;
  engineMode?: EngineMode;
  prompt: string;
  quote?: string;
  sourceImagePreview: string; // base64 or url
  videoBlobUrl?: string;
  audioBlobUrl?: string;
  createdAt: number;
  duration?: number;
}

export interface MotivationalPreset {
  id: string;
  title: string;
  language: 'ur' | 'en';
  text: string;
  author?: string;
  recommendedStyle: string;
}

export interface MotionPreset {
  id: string;
  title: string;
  titleUrdu: string;
  description: string;
  promptSnippet: string;
  iconName: string;
}

export type GenerationStatus =
  | 'idle'
  | 'preparing'
  | 'submitting'
  | 'polling'
  | 'downloading'
  | 'completed'
  | 'failed';
