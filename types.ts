
export type Language = 'EN' | 'ES';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  business_info: BusinessInfo;
  created_at: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export enum Category {
  PRODUCT = 'Product',
  AI_TECH = 'AI Tech',
  GROWTH = 'Growth',
  OPERATIONS = 'Operations',
  LEGAL = 'Legal',
  FINANCE = 'Finance',
  RETENTION = 'Retention',
  HIRING = 'Hiring',
  MARKET_RESEARCH = 'Market Research',
  CAREER = 'Career',
  COMMUNITY = 'Community',
  DEI = 'DEI',
  CX = 'Customer Experience'
}

export interface BrandDNA {
  logoDescription: string;
  primaryColor: string;
  secondaryColor: string;
  negativeKeywords: string[];
  toneVoice: string;
}

export type StrategicMission = 'Growth' | 'Sales' | 'Authority' | 'Community';
export type VisualSignature = 'Minimalist' | 'Bold' | 'Corporate' | 'Neon' | 'Organic';

export interface BusinessInfo {
  name: string;
  industry: string;
  targetAudience: string;
  coreValues: string;
  mainGoals: string;
  existingResearch?: string;
  startDate?: string;
  previousContent?: string;
  monthlyGuidance?: string;
  strategicMission?: StrategicMission;
  visualSignature?: VisualSignature;
  brandDNA?: BrandDNA;
}

export interface VisualLayer {
  type: 'text' | 'image';
  id: string; // Added for better tracking
  text?: string;
  font?: string;
  color?: string;
  size: number;
  isBold?: boolean;
  pos: { x: number; y: number };
  rotation: number; // In degrees
  scale: number; // Multiplier
  opacity: number; // 0 to 1
  glassStyle: 'none' | 'glass-light' | 'glass-dark' | 'glass-tint';
  textAlign: 'left' | 'center' | 'right';
  hasShadow: boolean;
  shadowBlur: number;
  strokeColor: string;
  strokeWidth: number;
  imageUrl?: string; // For image layers
  width?: number; // For image layers
  height?: number; // For image layers
}

export type OverlaySettings = VisualLayer; // Maintain backward compatibility for now


export interface ContentDay {
  day: number;
  date: string;
  topic: string;
  hook: string;
  full_caption: string;
  cta: string;
  hashtags: string[];
  image_prompts: string[];
  content_type: 'Educational' | 'Promotional' | 'Engagement' | 'Behind the Scenes' | 'Entertainment' | 'Testimonial';
  platform_strategy: string;
  best_time: string;
  requires_video: boolean;
  translations?: Record<string, { hook: string; caption: string }>;
}

export interface MarketInsight {
  title: string;
  uri: string;
  domain?: string;
}

export interface MarketContext {
  today: string;
  endDate: string;
  quarter: number;
  seasonalFocus: string;
  urgencyAngle: string;
  industryTrends: string[];
}

export interface StrategyResult {
  id?: string;
  project_id?: string;
  monthId: string;
  archivedAt?: string;
  calendar: ContentDay[];
  insights: MarketInsight[];
  summary: string;
  context: MarketContext;
  quality_score: number;
  strategicMission?: StrategicMission;
  visualSignature?: VisualSignature;
  visualLayers?: Record<string, OverlaySettings[]>;
}

export interface GeneratedAsset {
  id?: string;
  project_id: string;
  day_index: number;
  type: 'image' | 'video';
  url: string;
  metadata?: any;
  created_at: string;
}

export interface GeneratedImage {
  id?: number;
  dayIndex: number;
  promptIndex: number;
  url: string;
  modelId: 'gemini' | 'qwen' | 'upload';
  createdAt: number;
}

export interface GeneratedVideo {
  id?: number;
  dayIndex: number;
  url: string;
  permanentUri?: string;
  version: number;
  createdAt: number;
  modelId: 'gemini' | 'qwen' | 'upload';
  blob?: Blob; // Added for persistence
}

export interface StatData {
  label: string;
  value: string;
}

export interface ChartDataPoint {
  month: string;
  aiAdoption: number;
  efficiencyGain: number;
  revenue: number;
}

export interface ContentBlock {
  type: string;
  text?: string;
  title?: string;
  items?: string[];
  ctaButton?: string;
  ctaLink?: string;
}

export interface Article {
  id: string;
  category: Category;
  readTime: string;
  imageUrl: string;
  author: {
    name: string;
    title: string;
    avatarUrl: string;
  };
  featured?: boolean;
  locales: {
    [key: string]: {
      title: string;
      excerpt: string;
      contentBlocks: ContentBlock[];
    };
  };
}
