/**
 * Notion CMS Content Types
 * 
 * Type definitions for content fetched from Notion databases
 * These types correspond to the database properties in Notion
 */

// Base Notion property types
export interface NotionSelectProperty {
  id: string;
  name: string;
  color: string;
}

export interface NotionFileProperty {
  name: string;
  url: string;
  type: 'file' | 'external';
}

export interface NotionRichTextProperty {
  type: 'text';
  text: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
}

// Venture/Portfolio Company data structure
export interface NotionVenture {
  id: string;
  properties: {
    Name: {
      title: NotionRichTextProperty[];
    };
    Status: {
      select: NotionSelectProperty;
    };
    Logo: {
      files: NotionFileProperty[];
    };
    'Logo Alt Text': {
      rich_text: NotionRichTextProperty[];
    };
    Stat: {
      rich_text: NotionRichTextProperty[];
    };
    Outcome: {
      rich_text: NotionRichTextProperty[];
    };
    Description: {
      rich_text: NotionRichTextProperty[];
    };
    'ARR Revenue': {
      rich_text: NotionRichTextProperty[];
    };
    'User Count': {
      rich_text: NotionRichTextProperty[];
    };
    'Growth Rate': {
      rich_text: NotionRichTextProperty[];
    };
    'Website URL': {
      url: string;
    };
    'Sort Order': {
      number: number;
    };
  };
}

// Capability/Service data structure
export interface NotionCapability {
  id: string;
  properties: {
    Title: {
      title: NotionRichTextProperty[];
    };
    Subtitle: {
      rich_text: NotionRichTextProperty[];
    };
    Description: {
      rich_text: NotionRichTextProperty[];
    };
    Features: {
      multi_select: NotionSelectProperty[];
    };
    Examples: {
      multi_select: NotionSelectProperty[];
    };
    Technologies: {
      multi_select: NotionSelectProperty[];
    };
    'Sort Order': {
      number: number;
    };
    Status: {
      select: NotionSelectProperty;
    };
  };
}

// Site copy/content data structure
export interface NotionSiteCopy {
  id: string;
  properties: {
    'Section Name': {
      title: NotionRichTextProperty[];
    };
    'Content Type': {
      select: NotionSelectProperty;
    };
    'Primary Text': {
      rich_text: NotionRichTextProperty[];
    };
    'Secondary Text': {
      rich_text: NotionRichTextProperty[];
    };
    'Button Text': {
      rich_text: NotionRichTextProperty[];
    };
    'Status': {
      select: NotionSelectProperty;
    };
    'Last Updated': {
      last_edited_time: string;
    };
  };
}

// Asset management data structure
export interface NotionAsset {
  id: string;
  properties: {
    Name: {
      title: NotionRichTextProperty[];
    };
    'Asset Type': {
      select: NotionSelectProperty;
    };
    File: {
      files: NotionFileProperty[];
    };
    'Alt Text': {
      rich_text: NotionRichTextProperty[];
    };
    'Usage Context': {
      multi_select: NotionSelectProperty[];
    };
    Status: {
      select: NotionSelectProperty;
    };
  };
}

// Processed/clean content types (after parsing from Notion)
export interface VentureContent {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  stat: string;
  outcome: string;
  description: string;
  metrics: {
    revenue: string;
    users: string;
    growth: string;
  };
  siteUrl: string;
  sortOrder: number;
}

export interface CapabilityContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  examples: string[];
  technologies: string[];
  sortOrder: number;
}

export interface SiteCopyContent {
  sectionName: string;
  contentType: string;
  primaryText: string;
  secondaryText: string;
  buttonText: string;
  lastUpdated: string;
}

export interface AssetContent {
  name: string;
  type: string;
  url: string;
  altText: string;
  usageContext: string[];
}

// Complete site content structure
export interface SiteContent {
  ventures: VentureContent[];
  capabilities: CapabilityContent[];
  siteCopy: {
    hero: SiteCopyContent;
    essence: SiteCopyContent;
    capabilities: SiteCopyContent;
    proof: SiteCopyContent;
    cta: SiteCopyContent;
    footer: SiteCopyContent;
  };
  assets: AssetContent[];
}

// API response types
export interface NotionDatabaseResponse<T> {
  results: T[];
  next_cursor: string | null;
  has_more: boolean;
}

// Error handling types
export interface NotionError {
  code: string;
  message: string;
  status: number;
}

export interface ContentFetchResult<T> {
  data: T | null;
  error: NotionError | null;
  timestamp: string;
  source: 'notion' | 'fallback' | 'cache';
}

// Contact submission data structure
export interface NotionContactSubmission {
  id: string;
  properties: {
    Name: {
      title: NotionRichTextProperty[];
    };
    Email: {
      email: string;
    };
    Phone: {
      phone_number: string;
    };
    Message: {
      rich_text: NotionRichTextProperty[];
    };
    Attachment: {
      files: NotionFileProperty[];
    };
    'Form Type': {
      select: NotionSelectProperty;
    };
    Status: {
      select: NotionSelectProperty;
    };
    'Assigned To': {
      people: Array<{
        id: string;
        name: string;
        avatar_url: string;
      }>;
    };
    Priority: {
      select: NotionSelectProperty;
    };
    'Internal Notes': {
      rich_text: NotionRichTextProperty[];
    };
    Submitted: {
      created_time: string;
    };
  };
}

// Processed contact submission content
export interface ContactSubmissionContent {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  attachment: string;
  formType: 'Partnership' | 'Project' | 'Investment';
  status: 'New' | 'In Progress' | 'Responded' | 'Closed';
  assignedTo: string[];
  priority: 'Low' | 'Medium' | 'High';
  internalNotes: string;
  submitted: string;
}

// Form submission request types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  formType: 'Partnership' | 'Project' | 'Investment';
  attachment?: File;
}

export interface ContactSubmissionResult {
  success: boolean;
  submissionId?: string;
  error?: NotionError;
  timestamp: string;
}

// Database configuration
export interface NotionDatabaseConfig {
  ventures: string;
  capabilities: string;
  siteCopy: string;
  assets: string;
  contactSubmissions: string;
}

// Content validation types
export interface ContentValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ContentValidationError[];
  warnings: ContentValidationError[];
}