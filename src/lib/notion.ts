/**
 * Notion API Client
 * 
 * Handles authentication and communication with Notion API
 * Provides type-safe methods for fetching content from Notion databases
 */

import { Client } from '@notionhq/client';
import type {
  NotionVenture,
  NotionCapability,
  NotionSiteCopy,
  NotionAsset,
  NotionContactSubmission,
  NotionDatabaseResponse,
  NotionError,
  ContentFetchResult,
  NotionDatabaseConfig,
  ContactFormData,
  ContactSubmissionResult
} from '@/types/notion';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Database IDs configuration
export const NOTION_DATABASES: NotionDatabaseConfig = {
  ventures: process.env.NOTION_VENTURES_DB_ID || '',
  capabilities: process.env.NOTION_CAPABILITIES_DB_ID || '',
  siteCopy: process.env.NOTION_SITE_COPY_DB_ID || '',
  assets: process.env.NOTION_ASSETS_DB_ID || '',
  contactSubmissions: process.env.NOTION_CONTACT_DB_ID || '',
};

/**
 * Generic function to fetch from any Notion database
 */
async function fetchNotionDatabase<T>(
  databaseId: string,
  filter?: any,
  sorts?: any[]
): Promise<ContentFetchResult<T[]>> {
  try {
    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
    });

    return {
      data: response.results as T[],
      error: null,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  } catch (error: any) {
    console.error(`Error fetching from Notion database ${databaseId}:`, error);
    
    const notionError: NotionError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Failed to fetch from Notion',
      status: error.status || 500,
    };

    return {
      data: null,
      error: notionError,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Fetch ventures/portfolio companies
 */
export async function fetchVentures(): Promise<ContentFetchResult<NotionVenture[]>> {
  return fetchNotionDatabase<NotionVenture>(
    NOTION_DATABASES.ventures,
    {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    },
    [
      {
        property: 'Sort Order',
        direction: 'ascending',
      },
    ]
  );
}

/**
 * Fetch capabilities/services
 */
export async function fetchCapabilities(): Promise<ContentFetchResult<NotionCapability[]>> {
  return fetchNotionDatabase<NotionCapability>(
    NOTION_DATABASES.capabilities,
    {
      property: 'Status',
      select: {
        equals: 'Active',
      },
    },
    [
      {
        property: 'Sort Order',
        direction: 'ascending',
      },
    ]
  );
}

/**
 * Fetch site copy/content
 */
export async function fetchSiteCopy(): Promise<ContentFetchResult<NotionSiteCopy[]>> {
  return fetchNotionDatabase<NotionSiteCopy>(
    NOTION_DATABASES.siteCopy,
    {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    }
  );
}

/**
 * Fetch assets
 */
export async function fetchAssets(): Promise<ContentFetchResult<NotionAsset[]>> {
  return fetchNotionDatabase<NotionAsset>(
    NOTION_DATABASES.assets,
    {
      property: 'Status',
      select: {
        equals: 'Active',
      },
    }
  );
}

/**
 * Fetch specific site copy by section name
 */
export async function fetchSiteCopyBySection(sectionName: string): Promise<ContentFetchResult<NotionSiteCopy[]>> {
  return fetchNotionDatabase<NotionSiteCopy>(
    NOTION_DATABASES.siteCopy,
    {
      and: [
        {
          property: 'Status',
          select: {
            equals: 'Published',
          },
        },
        {
          property: 'Section Name',
          title: {
            equals: sectionName,
          },
        },
      ],
    }
  );
}

/**
 * Fetch assets by usage context
 */
export async function fetchAssetsByContext(context: string): Promise<ContentFetchResult<NotionAsset[]>> {
  return fetchNotionDatabase<NotionAsset>(
    NOTION_DATABASES.assets,
    {
      and: [
        {
          property: 'Status',
          select: {
            equals: 'Active',
          },
        },
        {
          property: 'Usage Context',
          multi_select: {
            contains: context,
          },
        },
      ],
    }
  );
}

/**
 * Health check for Notion API connection
 */
export async function checkNotionConnection(): Promise<{
  isConnected: boolean;
  error?: string;
  databases: {
    [key in keyof NotionDatabaseConfig]: boolean;
  };
}> {
  const result = {
    isConnected: false,
    databases: {
      ventures: false,
      capabilities: false,
      siteCopy: false,
      assets: false,
    } as { [key in keyof NotionDatabaseConfig]: boolean },
  };

  try {
    // Test basic API connection
    await notion.users.me({});
    result.isConnected = true;

    // Test each database
    for (const [key, databaseId] of Object.entries(NOTION_DATABASES)) {
      if (databaseId) {
        try {
          await notion.databases.retrieve({ database_id: databaseId });
          result.databases[key as keyof NotionDatabaseConfig] = true;
        } catch (error) {
          console.warn(`Database ${key} (${databaseId}) is not accessible:`, error);
        }
      }
    }

    return result;
  } catch (error: any) {
    return {
      ...result,
      error: error.message || 'Failed to connect to Notion API',
    };
  }
}

/**
 * Utility function to extract rich text content
 */
export function extractRichTextContent(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) {
    return '';
  }
  
  return richText
    .map((text) => text.plain_text || '')
    .join('');
}

/**
 * Utility function to extract file URL
 */
export function extractFileUrl(files: any[]): string {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return '';
  }
  
  const file = files[0];
  return file.type === 'file' ? file.file.url : file.external.url;
}

/**
 * Utility function to extract select property
 */
export function extractSelectProperty(select: any): string {
  return select?.name || '';
}

/**
 * Utility function to extract multi-select properties
 */
export function extractMultiSelectProperties(multiSelect: any[]): string[] {
  if (!multiSelect || !Array.isArray(multiSelect)) {
    return [];
  }
  
  return multiSelect.map((item) => item.name);
}

/**
 * Utility function to extract number property
 */
export function extractNumberProperty(number: any): number {
  return number || 0;
}

/**
 * Utility function to extract URL property
 */
export function extractUrlProperty(url: any): string {
  return url || '';
}

/**
 * CONTACT FORM SUBMISSION FUNCTIONS
 */

/**
 * Submit contact form to Notion database
 */
export async function submitContactForm(formData: ContactFormData): Promise<ContactSubmissionResult> {
  try {
    if (!NOTION_DATABASES.contactSubmissions) {
      throw new Error('Contact submissions database ID is not configured');
    }

    // Prepare the properties for Notion page creation
    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: formData.name,
            },
          },
        ],
      },
      Email: {
        email: formData.email,
      },
      'Form Type': {
        select: {
          name: formData.formType,
        },
      },
      Status: {
        select: {
          name: 'New',
        },
      },
      Priority: {
        select: {
          name: 'Medium',
        },
      },
    };

    // Add phone if provided
    if (formData.phone) {
      properties.Phone = {
        phone_number: formData.phone,
      };
    }

    // Add message if provided
    if (formData.message) {
      properties.Message = {
        rich_text: [
          {
            text: {
              content: formData.message,
            },
          },
        ],
      };
    }

    // Handle file attachment if provided
    if (formData.attachment) {
      // For now, we'll note that a file was attached
      // In a full implementation, you'd upload to Notion or external storage first
      properties['Internal Notes'] = {
        rich_text: [
          {
            text: {
              content: `File attachment: ${formData.attachment.name} (${Math.round(formData.attachment.size / 1024)}KB)`,
            },
          },
        ],
      };
    }

    // Create the page in Notion
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_DATABASES.contactSubmissions,
      },
      properties,
    });

    return {
      success: true,
      submissionId: response.id,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error('Error submitting contact form to Notion:', error);
    
    const notionError: NotionError = {
      code: error.code || 'SUBMISSION_ERROR',
      message: error.message || 'Failed to submit contact form',
      status: error.status || 500,
    };

    return {
      success: false,
      error: notionError,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Fetch contact submissions (for admin use)
 */
export async function fetchContactSubmissions(
  status?: 'New' | 'In Progress' | 'Responded' | 'Closed',
  limit?: number
): Promise<ContentFetchResult<NotionContactSubmission[]>> {
  try {
    if (!NOTION_DATABASES.contactSubmissions) {
      throw new Error('Contact submissions database ID is not configured');
    }

    const filter = status ? {
      property: 'Status',
      select: {
        equals: status,
      },
    } : undefined;

    const response = await notion.databases.query({
      database_id: NOTION_DATABASES.contactSubmissions,
      filter,
      sorts: [
        {
          property: 'Submitted',
          direction: 'descending',
        },
      ],
      page_size: limit || 100,
    });

    return {
      data: response.results as unknown as NotionContactSubmission[],
      error: null,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };

  } catch (error: any) {
    console.error('Error fetching contact submissions from Notion:', error);
    
    const notionError: NotionError = {
      code: error.code || 'FETCH_ERROR',
      message: error.message || 'Failed to fetch contact submissions',
      status: error.status || 500,
    };

    return {
      data: null,
      error: notionError,
      timestamp: new Date().toISOString(),
      source: 'notion',
    };
  }
}

/**
 * Update contact submission status
 */
export async function updateContactSubmissionStatus(
  submissionId: string,
  status: 'New' | 'In Progress' | 'Responded' | 'Closed',
  internalNotes?: string
): Promise<ContactSubmissionResult> {
  try {
    const properties: any = {
      Status: {
        select: {
          name: status,
        },
      },
    };

    if (internalNotes) {
      properties['Internal Notes'] = {
        rich_text: [
          {
            text: {
              content: internalNotes,
            },
          },
        ],
      };
    }

    await notion.pages.update({
      page_id: submissionId,
      properties,
    });

    return {
      success: true,
      submissionId,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error('Error updating contact submission status:', error);
    
    const notionError: NotionError = {
      code: error.code || 'UPDATE_ERROR',
      message: error.message || 'Failed to update contact submission',
      status: error.status || 500,
    };

    return {
      success: false,
      error: notionError,
      timestamp: new Date().toISOString(),
    };
  }
}