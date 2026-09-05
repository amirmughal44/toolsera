export type ToolCategory =
  | 'pdf'
  | 'documents'
  | 'spreadsheet'
  | 'image'
  | 'seo'
  | 'developer'
  | 'text'
  | 'qr'
  | 'calculators'
  | 'ai';

export interface HowItWorksStep {
  step: number;
  title: string;
  desc: string;
}

export interface ToolFAQ {
  q: string;
  a: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  iconName: string;
  inputType: 'file' | 'text' | 'form' | 'table' | 'interactive';
  outputType: 'file' | 'text' | 'preview' | 'json' | 'table';
  accessLevel: 'free' | 'premium';
  processingMethod: 'client-browser' | 'worker' | 'api';
  acceptedFileTypes?: string[];
  maxFileSizeFreeMB?: number;
  maxFileSizePremiumMB?: number;
  tags: string[];
  popular?: boolean;
  featured?: boolean;
  seoTitle: string;
  seoDescription: string;
  features: string[];
  howItWorks: HowItWorksStep[];
  faqs: ToolFAQ[];
}

export interface CategoryMetadata {
  id: ToolCategory;
  name: string;
  description: string;
  iconName: string;
  badge?: string;
}
